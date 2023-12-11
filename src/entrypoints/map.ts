interface MapFulfilledResult<T> {
  status: "fulfilled";
  value: T;
}

interface MapRejectedResult {
  status: "rejected";
  reason: any;
}

interface MapProcessing {
  status: "processing";
}

type MapResult<T> = MapFulfilledResult<T> | MapRejectedResult;

export const map = async <T, R>(
  data: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<R>,
  options?: { concurrency?: number }
): Promise<MapResult<R>[]> => {
  const { concurrency = 2 } = options ?? {};

  const results: MapResult<R>[] = [];

  await Promise.allSettled(
    Array.from({ length: concurrency }).map((_, index) =>
      worker(data, callbackfn, results)
    )
  );

  return results;
};

const worker = async <T, R>(
  data: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<R>,
  results: Array<MapResult<R> | MapProcessing>
) => {
  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const result = results[index];
    if (!result) {
      results[index] = { status: "processing" };
      try {
        results[index] = {
          status: "fulfilled",
          value: await callbackfn(item, index, data),
        };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  }
};
