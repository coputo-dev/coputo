# Coputo

**The TypeScript Remote MCP server framework**

Build remote Model Context Protocol servers in seconds with a modern TypeScript stack.

https://coputo.dev

## 📦 Getting Started

```bash
npm create coputo@latest
```

## ✏️ Build an MCP server in seconds

You can write an MCP server in a few lines of code.

```ts
const EchoSchema = z.object({
  text: z.string(),
});

app.register(coputo, {
  mcpServers: [
    {
      name: 'echo',
      tools: [
        {
          schema: {
            name: 'echo:text',
            description: 'Echo back the provided text.',
            inputSchema: buildMcpToolInputSchema({ zodSchema: EchoSchema }),
          },
          inputZodSchema: EchoSchema,
          async run({ args }) {
            return replySuccess({ data: args.text });
          },
        },
      ],
    },
  ],
});
```

You can immediately try this code using the prepared requests in `example.http`.

```http
POST http://localhost:3000/api/mcp
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "echo:text",
    "arguments": {
      "text": "hi"
    }
  }
}
```

## 🔐 Tenant‑scoped SaaS credential storage

Coputo exposes a **built‑in HTTP endpoint** so each tenant can securely persist API keys, or any secret required by your tools.

![](https://www.coputo.dev/index/kvs.png)

### Set and get credentials

```http
POST http://localhost:3000/api/mcpServerAdapterTokens
Content-Type: application/json

{
  "name": "example",           // adapter / provider name
  "token": "example-token"     // encrypted & stored server‑side
}
```

```ts
async run({ args, authToken }) {
  // authToken now contains the decrypted secret
  const res = await fetch('https://api.example.com', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return replySuccess({ data: await res.json() });
}
```

### Set and get credentials in Production

In a production environment, we recommend making the following changes.

#### Cipher key

Using the environment variable `COPUTO_SECRET_KEY` to encrypt and decrypt the tokens.

```ts
app.register(coputo, {
  getCipherKey: async () => {
    return process.env.COPUTO_SECRET_KEY;
  },
});
```

#### Tenant ID

Using an IdP such as Stitch or Clerk, or any other IdP that supports JWTs.

```ts
import { StytchB2BClient } from 'stytch';

const stytch = new StytchB2BClient({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET!,
});

app.register(coputo, {
  fetchTenantId: async (req) => {
    const auth = req.headers['authorization'];

    if (auth == null) {
      throw new Error('Unauthorized');
    }

    const jwt = auth.replace('Bearer ', '');
    // Verify session / JWT via Stytch
    const { session } = await stytch.sessions.authenticateJwt({ jwt });

    // Assume tenant_id is stored in custom claims
    const tenantId = session.custom_claims?.tenant_id as string;

    if (tenantId == null) {
      throw new Error('Unauthorized');
    }

    return tenantId;
  },
});
```

#### Store

Using a database with a Prisma adapter.

```ts
import { PrismaClient } from '@prisma/client';
import * as encryptionLib from '@/_lib/encryption';

type Params = {
  cypherKey: string;
  tenantId: string;
  name: string;
};

type SetParams = Params & { token: string };

const prisma = new PrismaClient();

export class PrismaTokenStore {
  async get({ cypherKey, tenantId, name }: Params) {
    const record = await prisma.mcpServerAdapterToken.findUnique({
      where: { tenantId_name: { tenantId, name } },
    });

    if (record == null) {
      return null;
    }

    const decryptToken = encryptionLib.decrypt({ cypherKey, value: record.token });

    return decryptToken;
  }

  async set({ cypherKey, tenantId, name, token }: SetParams) {
    const encryptToken = encryptionLib.encrypt({ cypherKey, value: token });

    await prisma.mcpServerAdapterToken.upsert({
      where: { tenantId_name: { tenantId, name } },
      update: { token: encrypted },
      create: { tenantId, name, token: encrypted },
    });
  }

  async remove({ tenantId, name }: Params) {
    await prisma.mcpServerAdapterToken.delete({
      where: { tenantId_name: { tenantId, name } },
    });
  }
}

app.register(coputo, {
  tokenStore: new PrismaTokenStore(),
});
```

## 💬 Support

Join our [Coputo Discord](https://discord.gg/EWS2k7zy) community🙌
