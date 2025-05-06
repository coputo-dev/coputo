import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import type {
  McpServerSchema,
  McpServerAdapterTokenStoreSchema,
} from "@coputo/core";

export default async function route({
  name = "Coputo",
  version = "0.1.0",
  mcpServers = [],
  mcpServerAdapterTokenStore,
  fetchTenantId,
  getCypherKey,
}: {
  name?: string;
  version?: string;
  mcpServers: McpServerSchema[];
  mcpServerAdapterTokenStore: McpServerAdapterTokenStoreSchema;
  fetchTenantId: (req: FastifyRequest) => Promise<string>;
  getCypherKey: () => Promise<string>;
}) {
  const root = new McpServer({ name, version });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  for (const server of mcpServers) {
    for (const tool of server.tools) {
      root.tool(
        tool.schema.name,
        tool.schema.description,
        tool.inputZodSchema.shape,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        async (args: any) => {
          const authToken = await mcpServerAdapterTokenStore.get({
            cypherKey: await getCypherKey(),
            tenantId: args._meta.tenantId,
            name: server.name,
          });

          return await tool.run({
            args,
            authToken,
          });
        },
      );
    }
  }

  await root.connect(transport);

  return fp(async (f) => {
    f.register(async (instance) => {
      instance.route({
        method: "POST",
        url: "/api/mcp",
        handler: async (req, reply) => {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const body = req.body as any;

          const tenantId = await fetchTenantId(req);

          body.params.arguments = body.params.arguments ?? {};
          body.params.arguments._meta = {
            ...(body.params.arguments._meta ?? {}),
            tenantId,
          };

          await transport.handleRequest(req.raw, reply.raw, body);
        },
      });

      instance.route({
        method: "GET",
        url: "/api/mcp",
        handler: async (req, reply) => {
          reply.code(405).send();
        },
      });
    });
  });
}
