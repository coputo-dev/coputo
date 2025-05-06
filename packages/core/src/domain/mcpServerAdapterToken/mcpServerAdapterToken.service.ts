import * as encryptionLib from "@/_lib/encryption.ts";

import type * as mcpServerAdapterTokenSchema from "@/domain/mcpServerAdapterToken/mcpServerAdapterToken.schema.ts";

export class McpServerAdapterTokenStore
  implements mcpServerAdapterTokenSchema.McpServerAdapterTokenStoreSchema
{
  #map = new Map<string, string>();

  genRecordkey({
    tenantId,
    name,
  }: {
    tenantId: string;
    name: string;
  }) {
    return `${tenantId}::${name}`;
  }

  async get({
    cypherKey,
    tenantId,
    name,
  }: {
    cypherKey: string;
    tenantId: string;
    name: string;
  }) {
    const recordKey = this.genRecordkey({
      tenantId,
      name,
    });

    const value = this.#map.get(recordKey);

    if (value == null) {
      return null;
    }

    const decryptToken = encryptionLib.decrypt({
      cypherKey,
      value,
    });

    return decryptToken;
  }

  async set({
    cypherKey,
    tenantId,
    name,
    token,
  }: {
    cypherKey: string;
    tenantId: string;
    name: string;
    token: string;
  }) {
    const recordKey = this.genRecordkey({
      tenantId,
      name,
    });

    const encyptToken = encryptionLib.encrypt({
      cypherKey,
      value: token,
    });

    this.#map.set(recordKey, encyptToken);
  }

  async remove({
    tenantId,
    name,
  }: {
    tenantId: string;
    name: string;
  }) {
    const recordKey = this.genRecordkey({
      tenantId,
      name,
    });

    this.#map.delete(recordKey);
  }
}
