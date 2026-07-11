import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type ImageRecord = {
  fileName: string;
  filePath: string;
  size: number;
  width: number;
  height: number;
  sha256: string;
};

const repoRoot = process.cwd();
const artDir = path.join(repoRoot, "art");
const reportDir = path.join(repoRoot, "reports");
const reportPath = path.join(reportDir, "duplicate-images.md");

function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

function readPngSize(filePath: string): { width: number; height: number } {
  const buffer = readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";

  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`Unsupported image format for ${filePath}. Expected PNG.`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function sha256(filePath: string): string {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

function collectImages(): ImageRecord[] {
  if (!existsSync(artDir) || !statSync(artDir).isDirectory()) {
    throw new Error("Expected an art directory with PNG files.");
  }

  return readdirSync(artDir)
    .filter((entry) => entry.toLowerCase().endsWith(".png"))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => {
      const filePath = path.join(artDir, fileName);
      const { width, height } = readPngSize(filePath);

      return {
        fileName,
        filePath,
        size: statSync(filePath).size,
        width,
        height,
        sha256: sha256(filePath)
      };
    });
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key);

    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
}

function renderList(items: string[]): string {
  return items.map((item) => `- \`${item}\``).join("\n");
}

function main(): void {
  const images = collectImages();
  const hashGroups = [...groupBy(images, (image) => image.sha256).values()].filter((group) => group.length > 1);
  const sizeGroups = [...groupBy(images, (image) => `${image.size}:${image.width}x${image.height}`).values()].filter((group) => group.length > 1);

  const exactDuplicateLines =
    hashGroups.length === 0
      ? ["No exact duplicate images were found."]
      : hashGroups
        .map((group) => {
          const head = group[0];
          return [`- SHA-256 \`${head.sha256}\``, renderList(group.map((image) => image.fileName))].join("\n");
        });

  const sizeCandidateLines =
    sizeGroups.length === 0
      ? ["No same-size, same-dimension collision groups were found."]
      : sizeGroups
        .map((group) => {
          const sample = group[0];
          return [`- ${sample.size} bytes, ${sample.width}x${sample.height}`, renderList(group.map((image) => image.fileName))].join("\n");
        });

  const report = `# Duplicate Image Report

## Summary
- Scanned: ${images.length} PNG files in \`art/\`
- Image dimensions: ${[...new Set(images.map((image) => `${image.width}x${image.height}`))].join(", ")}
- Exact duplicates by SHA-256: ${hashGroups.length}

## Method
1. Read every PNG in \`art/\`.
2. Record byte size, dimensions, and SHA-256.
3. Group by SHA-256 to identify confirmed duplicates.
4. Group by byte size plus dimensions to surface same-shape candidates.

## Exact Duplicates
${exactDuplicateLines.join("\n")}

## Same-Size Candidates
${sizeCandidateLines.join("\n")}

## Notes
- This is a report only; no artwork was removed or rewritten.
`;

  ensureDir(reportDir);
  writeFileSync(reportPath, report);
  process.stdout.write(`${reportPath}\n`);
}

main();
