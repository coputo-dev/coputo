import { z } from "zod";

export const McpToolInputDefitionZodSchema = z.object({
  type: z.literal("object"),
  properties: z.record(
    z.object({
      type: z.string(),
      description: z.string().optional(),
    }),
  ),
  required: z.array(z.string()).optional(),
});
export type McpToolInputDefitionSchema = z.infer<
  typeof McpToolInputDefitionZodSchema
>;

export const McpToolDefitionZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: McpToolInputDefitionZodSchema,
  annotations: z.record(z.any()).optional(),
});
export type McpToolDefitionSchema = z.infer<typeof McpToolDefitionZodSchema>;

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
  schema: McpToolDefitionSchema;
  inputZodSchema: z.AnyZodObject;
  run: ({
    args,
    authToken,
  }: {
    args: unknown;
    authToken: string | null;
  }) => Promise<McpToolCallResultSchema>;
}
