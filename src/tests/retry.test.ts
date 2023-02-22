import { expect, describe, it, vi, afterEach } from 'vitest';
import { retry } from '../entrypoints/retry';

type RetryParameters = Parameters<typeof retry>;
const retryTest = async (
  fn: RetryParameters[0],
  options?: RetryParameters[1]
) => {
  const onRetry = vi.fn();
  const onFail = vi.fn();
  const result = await retry(fn, { onRetry, onFail, interval: 10, ...options });

  return {
    result,
    onRetry,
    onFail,
  };
};

describe('Retry', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should retry function two times without giving any parameters', async () => {
    const fn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error('First execution');
      })
      .mockImplementationOnce(() => ({ success: true }));

    const { result, onRetry } = await retryTest(fn);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({ success: true });
  });

  it('should retry function five times with maxRetries parameter', async () => {
    const fn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error('First execution');
      })
      .mockImplementationOnce(() => {
        throw Error('Second execution');
      })
      .mockImplementationOnce(() => {
        throw Error('Third execution');
      })
      .mockImplementationOnce(() => {
        throw Error('Fourth execution');
      })
      .mockImplementationOnce(() => ({ success: true }));

    const { result, onRetry } = await retryTest(fn, { maxRetries: 5 });

    expect(fn).toHaveBeenCalledTimes(5);
    expect(onRetry).toHaveBeenCalledTimes(4);

    expect(result).toStrictEqual({ success: true });
  });

  it('should call onFail function when maxRetries is reached', async () => {
    const fn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error('First execution');
      })
      .mockImplementationOnce(() => {
        throw Error('Second execution');
      });

    const onFail = vi.fn();
    await retryTest(fn, { maxRetries: 2, onFail }).catch(() => {
      expect(fn).toHaveBeenCalledTimes(2);
      expect(onFail).toHaveBeenCalledWith(new Error('Too many tries'));
    });
  });

  it('should stop function execution when timeout is reached', async () => {
    const fn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error('First execution');
      })
      .mockImplementationOnce(
        async () => new Promise((resolve) => setTimeout(resolve, 20))
      );

    const onFail = vi.fn();
    await retryTest(fn, { maxRetries: 2, timeout: 10, onFail }).catch(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(onFail).toHaveBeenCalledWith(new Error('Timeout limit reached'));
    });
  });
});