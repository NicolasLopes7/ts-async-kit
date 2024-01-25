import { sleep } from "../../entrypoints/sleep";
import { retry } from '../../entrypoints/retry';
import { map } from "../../entrypoints/map";

interface ThreadFeatures {
    sleep: typeof sleep;
    retry: typeof retry;
    map: typeof map;
}

type ThreadAction<TReturn, TShared> = (
    sharedObject: TShared, 
    imports: Record<string, Function>,
    threadFeatures: ThreadFeatures) => TReturn;

type ThreadResult<TResult> = {
    runtime?: number,
    relativeStart?: Date,
    relativeEnd?: Date,
    data: TResult | undefined,
    error: Error | undefined
}

type ThreadOptions<TShared> = {
    sharedObject?: TShared extends unknown ? Record<string, any> | null : TShared,
    imports?: Record<string, string[]> | null
};

type ThreadConstructorOptions<TReturn, TShared> = {
    function: ThreadAction<TReturn, TShared>,
    config?: ThreadOptions<TShared>
}

export { 
    ThreadFeatures, 
    ThreadAction, 
    ThreadResult,
    ThreadOptions,
    ThreadConstructorOptions
}