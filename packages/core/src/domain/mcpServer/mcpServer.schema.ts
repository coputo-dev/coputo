import type * as mcpToolSchema from "@/domain/mcpTool/mcpTool.schema.ts";

export interface McpServerSchema {
  name: string;
  tools: mcpToolSchema.McpToolSchema[];
}
