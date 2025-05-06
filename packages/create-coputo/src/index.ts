#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "fs-extra";
const { copy, readJson, writeJson } = fs;

import { execa } from "execa";
import prompts from "prompts";
import { Command } from "commander";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "..", "templates");

function stripWorkspace(deps?: Record<string, string>) {
  if (deps == null) {
    return;
  }

  for (const [name, range] of Object.entries(deps)) {
    if (range?.startsWith("workspace:")) {
      deps[name] = "*";
    }
  }
}

async function scaffold({
  appName,
  skipInstall,
}: {
  appName: string;
  skipInstall: boolean;
}) {
  const dest = path.resolve(process.cwd(), appName);

  await copy(path.join(templatesDir, "basic"), dest, { overwrite: false });

  const pkgPath = path.join(dest, "package.json");

  const pkg = await readJson(pkgPath);

  pkg.name = appName;

  stripWorkspace(pkg.dependencies);
  stripWorkspace(pkg.devDependencies);
  stripWorkspace(pkg.peerDependencies);

  await writeJson(pkgPath, pkg, { spaces: 2 });

  if (skipInstall !== true) {
    console.log("📦 Installing dependencies...");

    await execa(
      "pnpm",
      [
        "install",
        "--config.link-workspace-packages=false", // 強制的にレジストリ解決
      ],
      { cwd: dest, stdio: "inherit" },
    );
  }

  console.log(`\n✨ All set! Next steps:\n  cd ${appName}\n  pnpm dev\n`);
}

const program = new Command()
  .name("create-coputo")
  .argument("[app-name]", "Your app name")
  .option("--skip-install", "Skip dependency installation")
  // biome-ignore lint/suspicious/noExplicitAny: CLI signature from Commander
  .action(async (appNameArg: any, opts: any) => {
    let appName = appNameArg as string | undefined;

    if (!appName) {
      const res = await prompts(
        {
          type: "text",
          name: "appName",
          message: "App name:",
          initial: "my-coputo-app",
        },
        { onCancel: () => process.exit(1) },
      );
      appName = res.appName;
    }

    if (appName == null) {
      console.error("App name is required");
      process.exit(1);
    }

    await scaffold({
      appName,
      skipInstall: opts.skipInstall ?? false,
    });
  });

program.parse(process.argv);
