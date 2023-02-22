import { AnyFunction } from "../common";

type RetryParameters = {
  maxRetries?: number;
  interval?: number;
  onRetry?: (err: Error) => void;
  onFail?: (err: Error) => void;
  currentRetry?: number;
};
type RetryReturnType<T extends AnyFunction> = Promise<ReturnType<T>>;

const sleep = async (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export async function retry<T extends AnyFunction>(
  fn: T,
  parameters?: RetryParameters
): RetryReturnType<T> {
  const { maxRetries = 2, onFail, interval = 1000, onRetry } = parameters ?? {};
  const currentRetry = parameters?.currentRetry ?? 0;
  const shouldRecall = currentRetry < maxRetries;

  try {
    if (!shouldRecall) throw Error("Too many tries");
    return fn();
  } catch (error: any) {
    if (error.message === "Too many tries") {
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
