import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { JSONSchema7 } from "json-schema";

import * as mcpToolSchema from "@/domain/mcpTool/mcpTool.schema.ts";

export function replySuccess({
  data,
}: {
  data: string;
}): ReturnType<mcpToolSchema.McpToolSchema["run"]> {
  return Promise.resolve({
    content: [{ type: "text", text: data, mimeType: "application/json" }],
    isError: false,
  });
}

export function replyFailure({
  data,
}: {
  data: string;
}): ReturnType<mcpToolSchema.McpToolSchema["run"]> {
  return Promise.resolve({
    content: [{ type: "text", text: data, mimeType: "application/json" }],
    isError: true,
  });
}

export function buildMcpToolInputSchema<Z extends z.ZodTypeAny>({
  zodSchema,
}: {
  zodSchema: Z;
}): mcpToolSchema.McpToolInputDefinitionSchema {
  const obj = zodToJsonSchema(zodSchema, {
    target: "openApi3",
    $refStrategy: "none",
  });

  if (isSchemaObject(obj) !== true) {
    throw new Error("Zod schema is not converted to an object JSON Schema");
  }

  return mcpToolSchema.McpToolInputDefinitionZodSchema.parse({
    type: "object",
    properties: obj.properties,
    required: obj.required,
  });
}

type SchemaObject = JSONSchema7 & {
  type: "object";
  properties: NonNullable<JSONSchema7["properties"]>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isSchemaObject(obj: any): obj is SchemaObject {
  if (obj == null) {
    return false;
  }

  if (typeof obj !== "object") {
    return false;
  }

  if (obj.type !== "object") {
    return false;
  }

  if (obj.properties == null) {
    return false;
  }

  return true;
}
