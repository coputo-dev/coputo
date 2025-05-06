import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGO = "aes-256-gcm" as const;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export function encrypt({
  cypherKey,
  value,
}: {
  cypherKey: string;
  value: string;
}): string {
  const key = Buffer.from(cypherKey, "base64url");

  if (key.length !== KEY_LENGTH) {
    throw new Error(`Cypher key must be ${KEY_LENGTH} bytes`);
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);

  const enc = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // iv | tag | enc
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decrypt({
  cypherKey,
  value,
}: {
  cypherKey: string;
  value: string;
}): string {
  const key = Buffer.from(cypherKey, "base64url");

  if (key.length !== KEY_LENGTH) {
    throw new Error(`Cypher key must be ${KEY_LENGTH} bytes`);
  }

  const buf = Buffer.from(value, "base64url");

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const enc = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);

  return dec.toString("utf8");
}
