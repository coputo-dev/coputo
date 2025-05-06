import { randomBytes } from "node:crypto";

import fp from "fastify-plugin";
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyPluginAsync,
} from "fastify";

import {
  type McpServerSchema,
  type McpServerAdapterTokenStoreSchema,
  McpServerAdapterTokenStore,
} from "@coputo/core";

import routeMcpServer from "@/routers/mcpServer.ts";
import routeMcpServerAdapterToken from "@/routers/mcpServerAdapterToken.ts";

const KEY_LENGTH = 32;

export interface CoputoFastifyOpts {
  name?: string;
  version?: string;
  mcpServers?: McpServerSchema[];
  fetchTenantId?: (req: FastifyRequest) => Promise<string>;
  getCipherKey?: () => Promise<string>;
  mcpServerAdapterTokenStore?: McpServerAdapterTokenStoreSchema;
}

const plugin: FastifyPluginAsync<CoputoFastifyOpts> = async (
  fastify: FastifyInstance,
  opts = {},
): Promise<void> => {
  let cypherKey: string;

  const {
    name = "Coputo",
    version = "0.1.0",
    mcpServerAdapterTokenStore = new McpServerAdapterTokenStore(),
    fetchTenantId = async () => {
      return "anonymous";
    },
    getCipherKey = async () => {
      if (cypherKey != null) {
        return cypherKey;
      }

      cypherKey = randomBytes(KEY_LENGTH).toString("base64");

      return cypherKey;
    },
    mcpServers = [],
  } = opts;

  fastify.register(
    await routeMcpServer({
      name,
      version,
      mcpServers,
      mcpServerAdapterTokenStore,
      fetchTenantId,
      getCipherKey,
    }),

    await routeMcpServerAdapterToken({
      mcpServerAdapterTokenStore,
      fetchTenantId,
      getCipherKey,
    }),
  );
};

export default fp(plugin, { name: "@coputo/fastify" });
