import { z } from "zod";

export interface McpServerAdapterTokenStoreSchema {
  set({
    cypherKey,
    tenantId,
    name,
    token,
  }: {
    cypherKey: string;
    tenantId: string;
    name: string;
    token: string;
  }): Promise<void>;

  get({
    cypherKey,
    tenantId,
    name,
  }: {
    cypherKey: string;
    tenantId: string;
    name: string;
  }): Promise<string | null>;

  remove({
    tenantId,
    name,
  }: {
    tenantId: string;
    name: string;
  }): Promise<void>;
}

// Req
export const McpServerAdapterTokenStoreSetZodSchema = z.object({
  cypherKey: z.string(),
  tenantId: z.string(),
  name: z.string(),
  token: z.string(),
});
export type McpServerAdapterTokenStoreSetSchema = z.infer<
  typeof McpServerAdapterTokenStoreSetZodSchema
>;

export const McpServerAdapterTokenStoreGetZodSchema = z.object({
  cypherKey: z.string(),
  tenantId: z.string(),
  name: z.string(),
  token: z.string(),
});
export type McpServerAdapterTokenStoreGetSchema = z.infer<
  typeof McpServerAdapterTokenStoreSetZodSchema
>;
