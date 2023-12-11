import { expect, describe, it, vi, beforeAll } from "vitest";

describe("library entrypoints", () => {
  it("should export retry entrypoint", async () => {
    const { retry } = await getLib();
    const fn = vi.fn().mockImplementationOnce(() => ({ success: true }));

    expect(await retry(fn)).toEqual({ success: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should export sleep entrypoint", async () => {
    // @ts-expect-error
    const { sleep } = await getLib();

    const start = Date.now();
    await sleep(1000);
    const end = Date.now();
    expect(end - start).toBeGreaterThan(1000);
  });
});

async function getLib() {
  return await import("./../src");
}
