import { AnyFunction } from "../common";

type RetryParameters = {
  maxRetries?: number;
  interval?: number;
  timeout?: number;
  onRetry?: (err: Error) => void;
  onFail?: (err: Error) => void;
  currentRetry?: number;
};
type RetryReturnType<T extends AnyFunction> = Promise<ReturnType<T>>;

const sleep = async (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
  
const rejectsIn = (time: number) => new Promise((_, reject) => setTimeout(() => reject('Timeout limit reached'), time));

export async function retry<T extends AnyFunction>(
  fn: T,
  parameters?: RetryParameters
): RetryReturnType<T> {
  const { maxRetries = 2, onFail, interval = 1000, onRetry } = parameters ?? {};
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
    await sleep(interval);
    return retry(fn, {
      maxRetries,
      interval,
      onRetry,
      onFail,
      currentRetry: currentRetry + 1,
    });
  }
}
