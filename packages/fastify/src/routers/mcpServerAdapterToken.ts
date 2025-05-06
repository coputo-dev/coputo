import { z } from "zod";

import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";

import type { McpServerAdapterTokenStoreSchema } from "@coputo/core";

export default async function route({
  mcpServerAdapterTokenStore,
  fetchTenantId,
  getCipherKey,
}: {
  mcpServerAdapterTokenStore: McpServerAdapterTokenStoreSchema;
  fetchTenantId: (
    req: FastifyRequest,
  ) => Promise<string | undefined> | string | undefined;
  getCipherKey: () => Promise<string> | string;
}) {
  return fp(async (f) => {
    f.register(async (instance) => {
      instance.route({
        method: "POST",
        url: "/api/mcpServerAdapterTokens",
        handler: async (req, reply) => {
          const tenantId = await fetchTenantId(req);

          if (tenantId == null) {
            throw new Error("Unauthorized");
          }

          const body = z
            .object({
              name: z.string(),
              token: z.string(),
            })
            .parse(req.body);

          mcpServerAdapterTokenStore.set({
            cypherKey: await getCipherKey(),
            tenantId,
            name: body.name,
            token: body.token,
          });

          await reply.send({
            status: "ok",
          });
        },
      });
    });
  });
}
