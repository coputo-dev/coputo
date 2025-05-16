import { z } from "zod";

export const McpToolInputDefinitionZodSchema = z.object({
  type: z.literal("object"),
  properties: z.record(
    z.object({
      type: z.string(),
      description: z.string().optional(),
    }),
  ),
  required: z.array(z.string()).optional(),
});
export type McpToolInputDefinitionSchema = z.infer<
  typeof McpToolInputDefinitionZodSchema
>;

export const McpToolDefinitionZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: McpToolInputDefinitionZodSchema,
  annotations: z.record(z.any()).optional(),
});
export type McpToolDefinitionSchema = z.infer<
  typeof McpToolDefinitionZodSchema
>;

const TextResource = z.object({
  uri: z.string().url(),
  mimeType: z.string().optional(),
  text: z.string(),
});

const BlobResource = z.object({
  uri: z.string().url(),
  mimeType: z.string().optional(),
  blob: z.string(),
});

export const McpToolContentItemZodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
    mimeType: z.string().optional(),
  }),
  z.object({
    type: z.literal("image"),
    data: z.string(),
    mimeType: z.string(),
  }),
  z.object({
    type: z.literal("audio"),
    data: z.string(),
    mimeType: z.string(),
  }),
  z.object({
    type: z.literal("resource"),
    resource: z.union([TextResource, BlobResource]),
  }),
]);

export const McpToolCallResultZodSchema = z.object({
  _meta: z.record(z.unknown()).optional(),
  content: z.array(McpToolContentItemZodSchema),
  isError: z.boolean().optional(),
});
export type McpToolCallResultSchema = z.infer<
  typeof McpToolCallResultZodSchema
>;

export interface McpToolSchema {
  schema: McpToolDefinitionSchema;
  inputZodSchema: z.AnyZodObject;
  run: ({
    args,
    authToken,
  }: {
    args: unknown;
    authToken: string | null;
  }) => Promise<McpToolCallResultSchema>;
}
