import { Worker } from 'node:worker_threads';
import { sleep } from '../../entrypoints/sleep';
import { retry } from '../../entrypoints/retry';
import { map } from '../../entrypoints/map';

import { 
    ThreadAction, 
    ThreadConstructorOptions, 
    ThreadFeatures, 
    ThreadResult 
} from './types';

class Thread<TResult, TShared> {
    private worker?: Worker;
    private promise?: Promise<ThreadResult<TResult>>;
    private execute: () => Promise<ThreadResult<TResult>>;

    protected readonly sleep = sleep;
    protected readonly retry = retry;
    protected readonly map = map;

    constructor(options: ThreadConstructorOptions<TResult, TShared>) {
        const sharedFinal = {} as Record<string, any>;

        Object.entries(options.config?.sharedObject ?? {}).forEach(entry => {
            sharedFinal[entry[0]] = entry[1];
        });

        const assembledClosure = (
            target: ThreadAction<TResult, TShared>, 
            shared: Record<string, any>, 
            imports: Record<string, string[]>,
            features: ThreadFeatures) => {

            // Defines the threadingThis global object in a newly
            // created thread. The objective is avoiding conflicts
            // and storing all the needed objects to provide imports
            // and object sharing features.
            (<any>globalThis)["threadingThis"] = {};
            (<any>globalThis)["threadingThis"].imports = {};
            (<any>globalThis)["threadingThis"].imports.performance = require('perf_hooks').performance;
            (<any>globalThis)["threadingThis"].features = features;

            const threadStartPerformanceTime = performance.now();
            const threadRelativeStart = new Date();

            (<any>globalThis)["threadingThis"].imports.parentPort = require("node:worker_threads").parentPort;
            (<any>globalThis)["threadingThis"].shared = shared;

            // Setup object imports; No support to default imports yet.
            Object
                .entries(imports)
                .forEach(importEntry => {
                    (<any>globalThis)["threadingThis"].imports[importEntry[0]] = {}

                    importEntry[1].forEach(value => {
                        (<any>globalThis)["threadingThis"].imports[importEntry[0]][value] = require(importEntry[0])[value];
                    });
                });

            let result = undefined;
            let error: Error | undefined = undefined;

            try {
                const isAsync = target.constructor.name === "AsyncFunction" ||
                    target.constructor.name === "Promise";

                if (isAsync) {
                    result = (<Promise<TResult>>target(
                        (<any>globalThis)["threadingThis"].shared,
                        (<any>globalThis)["threadingThis"].imports,
                        (<any>globalThis)["threadingThis"].features
                    ))
                    .then(result => {
                        const threadEndPerformanceTime = performance.now();
                        const threadRelativeEnd = new Date();
            
                        (<any>globalThis)["threadingThis"].imports.parentPort.postMessage({
                            runtime: threadEndPerformanceTime - threadStartPerformanceTime,
                            relativeStart: threadRelativeStart,
                            relativeEnd: threadRelativeEnd,
                            type: "completion",
                            data: result,
                            error
                        });
                    });

                    return;
                }

                result = target(
                    (<any>globalThis)["threadingThis"].shared,
                    (<any>globalThis)["threadingThis"].imports,
                    (<any>globalThis)["threadingThis"].features
                );

                const threadEndPerformanceTime = performance.now();
                const threadRelativeEnd = new Date();
    
                (<any>globalThis)["threadingThis"].imports.parentPort.postMessage({
                    runtime: threadEndPerformanceTime - threadStartPerformanceTime,
                    relativeStart: threadRelativeStart,
                    relativeEnd: threadRelativeEnd,
                    type: "completion",
                    data: result,
                    error
                });
            }
            catch (e) {
                error = <Error>e;
            }
        }

        let textScript = `
            (${assembledClosure.toString()})
            (
                ${options.function.toString()}, 
                ${JSON.stringify(sharedFinal)}, 
                ${JSON.stringify(options.config?.imports ?? "")}, 
                {
                    sleep: ${sleep.toString()},
                    map: ${map.toString()},
                    retry: ${retry.toString()}
                }
            );`;

        this.execute = () => {
            this.promise = new Promise<ThreadResult<TResult>>((resolve, reject) => {
                this.worker = new Worker(textScript, { eval: true });

                this.worker.on('error', (err) => {
                    reject(err);
                });

                this.worker.on('message', (data: any) => {
                    if (data.type === 'completion') {
                        resolve(data);
                    }
                });
            });

            return this.promise;
        }
    }

    async toPromise() {
        return this.execute();
    }
}

export { Thread }