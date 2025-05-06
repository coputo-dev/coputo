import { describe, it, expect } from "vitest";

import { z } from "zod";

import { buildMcpToolInputSchema } from "./mcpTool.service.ts";

describe("buildMcpToolInputSchema", () => {
  it("converts a Zod object schema to the expected JSON Schema shape", () => {
    const zodSchema = z.object({
      a: z.string(),
      b: z.string(),
    });

    const schema = buildMcpToolInputSchema({ zodSchema });

    expect(schema).toEqual(
      expect.objectContaining({
        type: "object",
        properties: {
          a: expect.objectContaining({ type: "string" }),
          b: expect.objectContaining({ type: "string" }),
        },
        required: ["a", "b"],
      }),
    );
  });
});
