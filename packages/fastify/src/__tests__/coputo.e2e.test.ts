/// <reference types="vitest" />

import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

import Fastify from "fastify";
import { z } from "zod";

import coputo from "@coputo/fastify";
import {
  buildMcpToolInputSchema,
  replySuccess,
  replyFailure,
} from "@coputo/core";

function parseSSE(stream: string) {
  return stream
    .split("\n\n")
    .filter(Boolean)
    .map((evt) => {
      const obj: Record<string, string> = {};
      for (const line of evt.split("\n")) {
        const [field, ...rest] = line.split(":");
        obj[field.trim()] = rest.join(":").trim();
      }
      return obj;
    });
}

const ExampleAuthSchema = z.object({
  _meta: z.object({ tenantId: z.string() }),
});
const CalcAddSchema = z.object({
  a: z.number(),
  b: z.number(),
  _meta: z.object({ tenantId: z.string() }),
});
const CalcSubSchema = z.object({
  a: z.number(),
  b: z.number(),
  _meta: z.object({ tenantId: z.string() }),
});

describe("Coputo Fastify e2e", () => {
  const TENANT = "tenant-123";
  const AUTH_TOKEN = "secret‑token‑xyz";

  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    app = Fastify();
    await app.register(coputo, {
      fetchTenantId: async () => TENANT,
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
              async run({ authToken }) {
                return replySuccess({
                  data: JSON.stringify({ authToken }),
                });
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
                description: "Add two numbers",
                inputSchema: buildMcpToolInputSchema({
                  zodSchema: CalcAddSchema,
                }),
              },
              inputZodSchema: CalcAddSchema,
              async run({ args }) {
                const { a, b } = CalcAddSchema.parse(args);
                return replySuccess({
                  data: JSON.stringify(a + b),
                });
              },
            },
            {
              schema: {
                name: "calc:sub",
                description: "Sub two numbers",
                inputSchema: buildMcpToolInputSchema({
                  zodSchema: CalcSubSchema,
                }),
              },
              inputZodSchema: CalcSubSchema,
              async run({ args }) {
                const { a, b } = CalcSubSchema.parse(args);
                return replySuccess({
                  data: JSON.stringify(a - b),
                });
              },
            },
          ],
        },
      ],
    });
    await app.ready();
  });

  afterAll(() => app.close());

  it("stores a token for server 'example'", async () => {
    const res = await app.inject({
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      url: "/api/mcpServerAdapterTokens",
      payload: { name: "example", token: AUTH_TOKEN },
    });
    expect(res.statusCode).toBe(200);
  });

  it("example:auth returns the stored token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      payload: {
        jsonrpc: "2.0",
        id: 10,
        method: "tools/call",
        params: {
          name: "example:auth",
          arguments: {},
        },
      },
    });

    const events = parseSSE(res.body);
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const last = events.at(-1)!;
    const body = JSON.parse(last.data);
    const data = JSON.parse(body.result.content[0].text);

    expect(data.authToken).toBe(AUTH_TOKEN);
  });

  it("calc:add returns 3 for 1 + 2", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      payload: {
        jsonrpc: "2.0",
        id: "examele",
        method: "tools/call",
        params: { name: "calc:add", arguments: { a: 1, b: 2 } },
      },
    });

    const events = parseSSE(res.body);
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const last = events.at(-1)!;
    const body = JSON.parse(last.data);
    const data = JSON.parse(body.result.content[0].text);

    expect(data).toBe(3);
  });

  it("calc:sub returns 1 for 2 - 1", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      payload: {
        jsonrpc: "2.0",
        id: "examele",
        method: "tools/call",
        params: { name: "calc:sub", arguments: { a: 2, b: 1 } },
      },
    });

    const events = parseSSE(res.body);
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const last = events.at(-1)!;
    const body = JSON.parse(last.data);
    const data = JSON.parse(body.result.content[0].text);

    expect(data).toBe(1);
  });
});
