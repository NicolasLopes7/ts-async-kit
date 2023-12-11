import { expect, describe, it, vi, beforeAll } from "vitest";

describe("library entrypoints", () => {
  it("should export retry entrypoint", async () => {
    const { retry } = await getLib();
    const fn = vi.fn().mockImplementationOnce(() => ({ success: true }));

    expect(await retry(fn)).toEqual({ success: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

async function getLib() {
  return await import("./../src");
}
