import { expect, describe, it, vi, afterEach, beforeEach } from "vitest";
import { sleep } from "../entrypoints/sleep";
import { map } from "../entrypoints/map";
import exp from "constants";
import { error } from "console";

describe("Map", () => {
  const fn = vi.fn(async (value: number) => {
    await sleep(1000);
    return value * 3;
  });

  const data = [1, 2, 3, 4, 5];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should map function with two workers without giving any parameters ", async () => {
    const expected = [3, 6, 9, 12, 15].map((value) => ({
      status: "fulfilled",
      value,
    }));

    const result = map(data, fn);
    expect(vi.getTimerCount()).toBe(2);

    await vi.runAllTimersAsync();
    expect(await result).toEqual(expected);
    expect(fn).toHaveBeenCalledTimes(5);
    expect(fn).toHaveBeenCalledWith(1, 0, data);
    expect(fn).toHaveBeenCalledWith(2, 1, data);
    expect(fn).toHaveBeenCalledWith(3, 2, data);
    expect(fn).toHaveBeenCalledWith(4, 3, data);
    expect(fn).toHaveBeenCalledWith(5, 4, data);
  });

  it("should map function with five workers parameter", async () => {
    const expected = [3, 6, 9, 12, 15].map((value) => ({
      status: "fulfilled",
      value,
    }));

    const result = map(data, fn, { concurrency: 5 });
    expect(vi.getTimerCount()).toBe(5);

    await vi.runAllTimersAsync();
    expect(await result).toEqual(expected);
    expect(fn).toHaveBeenCalledTimes(5);
    expect(fn).toHaveBeenCalledWith(1, 0, data);
    expect(fn).toHaveBeenCalledWith(2, 1, data);
    expect(fn).toHaveBeenCalledWith(3, 2, data);
    expect(fn).toHaveBeenCalledWith(4, 3, data);
    expect(fn).toHaveBeenCalledWith(5, 4, data);
  });

  it("should return fail results", async () => {
    const fn = vi.fn(async (value: number) => {
      throw new Error(`fail to ${value}`);
    });

    const expected = data.map((value) => ({
      status: "rejected",
      reason: new Error(`fail to ${value}`),
    }));

    const result = await map(data, fn);

    expect(result).toEqual(expected);
    expect(fn).toHaveBeenCalledTimes(5);
    expect(fn).toHaveBeenCalledWith(1, 0, data);
    expect(fn).toHaveBeenCalledWith(2, 1, data);
    expect(fn).toHaveBeenCalledWith(3, 2, data);
    expect(fn).toHaveBeenCalledWith(4, 3, data);
    expect(fn).toHaveBeenCalledWith(5, 4, data);
  });
});
