import { execa } from "execa";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "coputo-test-"));
const cli = path.resolve(__dirname, "../dist/index.js");

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

test("create-coputo installs deps from registry", async () => {
  await execa("node", [cli, "my-awesome-app", "--skip-install"], {
    cwd: tmpDir,
  });

  const pkg = await import(path.join(tmpDir, "my-awesome-app", "package.json"));

  expect(pkg.default.dependencies["@coputo/core"]).toBeDefined();
});
