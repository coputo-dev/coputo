import Fastify from "fastify";

import { z } from "zod";

import coputo from "@coputo/fastify";
import {
  buildMcpToolInputSchema,
  replySuccess,
  replyFailure,
} from "@coputo/core";

const PORT = 3000;

const app = Fastify({
  logger: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
        colorize: true,
        singleLine: false,
      },
    },
  },
});

export const ExampleAuthSchema = z.object({
  _meta: z.object({
    tenantId: z.string().describe("Tenant ID"),
  }),
});

export const CalcAddSchema = z.object({
  a: z.number().describe("Number a"),
  b: z.number().describe("Number b"),
  _meta: z.object({
    tenantId: z.string().describe("Tenant ID"),
  }),
});

export const CalcSubSchema = z.object({
  a: z.number().describe("Number a"),
  b: z.number().describe("Number b"),
  _meta: z.object({
    tenantId: z.string().describe("Tenant ID"),
  }),
});

app.register(coputo, {
  mcpServers: [
    {
      name: "example",
      tools: [
        {
          schema: {
            name: "example:auth",
            description: "Example - Show auth token",
            inputSchema: buildMcpToolInputSchema({
              zodSchema: ExampleAuthSchema,
            }),
          },
          inputZodSchema: ExampleAuthSchema,
          async run({ args, authToken }) {
            try {
              return replySuccess({
                data: JSON.stringify({
                  authToken,
                }),
              });
            } catch (err) {
              return replyFailure({
                data: JSON.stringify({
                  message: err instanceof Error ? err.message : String(err),
                }),
              });
            }
          },
        },
      ],
    },
    {
      name: "calc",
      tools: [
        {
          schema: {
            name: "calc:add",
            description: "Calc - Add two numbers",
            inputSchema: buildMcpToolInputSchema({
              zodSchema: CalcAddSchema,
            }),
          },
          inputZodSchema: CalcAddSchema,
          async run({ args, authToken }) {
            const parsed = CalcAddSchema.safeParse(args);

            if (parsed.success !== true) {
              return replyFailure({
                data: JSON.stringify({
                  message: parsed.error.message,
                }),
              });
            }

            try {
              const res = parsed.data.a + parsed.data.b;

              return replySuccess({
                data: JSON.stringify(res),
              });
            } catch (err) {
              return replyFailure({
                data: JSON.stringify({
                  message: err instanceof Error ? err.message : String(err),
                }),
              });
            }
          },
        },
        {
          schema: {
            name: "calc:sub",
            description: "Calc - Sub two numbers",
            inputSchema: buildMcpToolInputSchema({
              zodSchema: CalcSubSchema,
            }),
          },
          inputZodSchema: CalcSubSchema,
          async run({ args, authToken }) {
            const parsed = CalcSubSchema.safeParse(args);

            if (parsed.success !== true) {
              return replyFailure({
                data: JSON.stringify({
                  message: parsed.error.message,
                }),
              });
            }

            try {
              const res = parsed.data.a - parsed.data.b;

              return replySuccess({
                data: JSON.stringify(res),
              });
            } catch (err) {
              return replyFailure({
                data: JSON.stringify({
                  message: err instanceof Error ? err.message : String(err),
                }),
              });
            }
          },
        },
      ],
    },
  ],
});

console.log(`🚀 Server listening on http://localhost:${PORT}`);

app.listen({ port: PORT });
