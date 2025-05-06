import { describe, it, expect } from "vitest";

import { randomBytes } from "node:crypto";

import { encrypt, decrypt } from "./encryption.ts";

const KEY_BYTES = 32;

function generateKey(): string {
  return randomBytes(KEY_BYTES).toString("base64url");
}

describe("encryption library", () => {
  it("round‑trips with encrypt → decrypt", () => {
    const key = generateKey();
    const plain = "Hello, encryption world!";

    const encrypted = encrypt({ cypherKey: key, value: plain });
    const decrypted = decrypt({ cypherKey: key, value: encrypted });

    expect(decrypted).toBe(plain);
  });

  it("throws on invalid key length (encrypt)", () => {
    expect(() => encrypt({ cypherKey: "short", value: "x" })).toThrow(
      /Cypher key must be 32 bytes/,
    );
  });

  it("throws on invalid key length (decrypt)", () => {
    expect(() => decrypt({ cypherKey: "short", value: "x" })).toThrow(
      /Cypher key must be 32 bytes/,
    );
  });
});
