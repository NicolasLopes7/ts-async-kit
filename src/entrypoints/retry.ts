import { AnyFunction } from "../common";
import { sleep } from "./sleep";

type RetryParameters = {
  maxRetries?: number;
  interval?: number;
  timeout?: number;
  onRetry?: (err: Error) => void;
  onFail?: (err: Error) => void;
  currentRetry?: number;
  backoffFactor?: number;
};

type RetryReturnType<T extends AnyFunction> = Promise<ReturnType<T>>;

const rejectsIn = (time: number) => sleep(time).then(()=>Promise.reject("Timeout limit reached"));

export async function retry<T extends AnyFunction>(
  fn: T,
  parameters?: RetryParameters
): RetryReturnType<T> {
  const { maxRetries = 2, onFail, interval = 1000, onRetry, backoffFactor = 1 } = parameters ?? {};
  const currentRetry = parameters?.currentRetry ?? 0;
  const shouldRecall = currentRetry < maxRetries;

  try {
    if (!shouldRecall) throw Error("Too many tries");
    return Promise.race<RetryReturnType<T>>([
      fn(),
      ...(parameters?.timeout ? [rejectsIn(parameters?.timeout)] : [])
    ])
  } catch (error: any) {
    if (["Too many tries", "Timeout limit reached"].includes(error.message)) {
      onFail?.(error);
      throw error;
    }
    onRetry?.(error);
    const delay = interval * (backoffFactor ** currentRetry);
    await sleep(delay);
    return retry(fn, {
      maxRetries,
      interval,
      onRetry,
      onFail,
      currentRetry: currentRetry + 1,
      backoffFactor,
    });
  }
}
