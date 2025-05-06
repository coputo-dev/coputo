import { describe, it, expect, beforeEach } from "vitest";

import { randomBytes } from "node:crypto";

import { McpServerAdapterTokenStore } from "./mcpServerAdapterToken.service.ts";

const KEY_BYTES = 32;

function generateKey(): string {
  return randomBytes(KEY_BYTES).toString("base64url");
}

describe("McpServerAdapterTokenStore", () => {
  let store: McpServerAdapterTokenStore;

  const tenantId = "tenant‑123";
  const name = "example-saas";
  const token = "secret‑token‑xyz";

  beforeEach(() => {
    store = new McpServerAdapterTokenStore();
  });

  it("returns the original token after set → get", async () => {
    const key = generateKey();

    // biome-ignore format:
    const setResult = await store.set({ cypherKey: key, tenantId, name, token });
    const getResult = await store.get({ cypherKey: key, tenantId, name });

    expect(getResult).toBe(token);
  });
});
