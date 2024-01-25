import { describe, expect, it } from "vitest";
import { Thread } from "../entrypoints/thread";

describe("sleep", () => {
    it("should return the right value sync", async () => {
        const thread = new Thread({
            function: () => {
                let a = 100;
                while (a > 0) { a-- };
                return "hello world";
            }
        });

        const result = await thread.toPromise();
        expect(result.data).toBe("hello world");
    });

    it("should return the right value async", async () => {
        const thread = new Thread({
            function: async (_, __, feats) => {
                await feats.sleep(100);
                return "hello world"
            }
        });

        const result = await thread.toPromise();
        expect(result.data).toBe("hello world");
    });
})