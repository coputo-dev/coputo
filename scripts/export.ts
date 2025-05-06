import { promises as fs } from "node:fs";
import path from "node:path";

const SRC_PATH = path.resolve(process.cwd(), process.argv[2]);
const OUT_PATH = path.resolve(process.cwd(), "src.md");

async function walk(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const d of dirents) {
    const resolved = path.join(dir, d.name);
    if (d.isDirectory()) {
      files.push(...(await walk(resolved)));
    } else {
      files.push(resolved);
    }
  }
  return files;
}

function languageTag(filename: string): string {
  const ext = path.extname(filename).slice(1);
  switch (ext) {
    case "ts":
    case "tsx":
      return "ts";
    case "js":
    case "cjs":
    case "mjs":
      return "js";
    case "json":
      return "json";
    case "md":
      return "md";
    default:
      return "text";
  }
}

async function main(): Promise<void> {
  const files = await walk(SRC_PATH);

  let markdown = `# Source snapshot generated ${new Date().toISOString()}\n\n`;

  for (const absPath of files) {
    const relPath = path.relative(process.cwd(), absPath);
    const lang = languageTag(relPath);
    const code = await fs.readFile(absPath, "utf8");

    markdown += `## ${relPath}\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  }

  await fs.writeFile(OUT_PATH, markdown);

  console.log(
    `✅ Wrote ${files.length} files into ${path.relative(process.cwd(), OUT_PATH)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
