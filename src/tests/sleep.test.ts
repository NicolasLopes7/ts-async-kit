import { describe, expect, it } from "vitest";
import { sleep } from "../entrypoints/sleep";

describe("sleep", () => {
    it("should sleep", async () => {
        const start = Date.now()
        await sleep(1000)
        const end = Date.now()
        expect(end - start).toBeGreaterThan(1000)
    })
})