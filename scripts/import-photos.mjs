#!/usr/bin/env node
// Drop edited photos into "assets/edited photos" and run:  npm run photos
//
// Name each file after the product id from src/catalog.js — for example
// "turtle-watermelon.jpg" or "bee-pink.png". The script squares it up on a
// white background, resizes it for the web, and writes it straight to the
// file the catalog already points at, so no code changes are needed.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { dirname, extname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dropDir = join(root, "assets", "edited photos");
const SIZE = 1200;

// Pull "id" -> "photo path" straight out of the catalog so this stays in sync.
const catalog = readFileSync(join(root, "src", "catalog.js"), "utf8");
const products = [...catalog.matchAll(/id:\s*"([^"]+)"[\s\S]*?photo:\s*"([^"]+)"/g)].map(
  ([, id, photo]) => ({ id, photo })
);

if (!existsSync(dropDir)) {
  mkdirSync(dropDir, { recursive: true });
}

const files = readdirSync(dropDir).filter((f) =>
  [".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(extname(f).toLowerCase())
);

if (files.length === 0) {
  console.log(`Nothing to import.\n\nDrop photos into:\n  ${dropDir}\n`);
  console.log("Name each file after a product id, e.g. turtle-watermelon.jpg");
  console.log(`\nAvailable ids (${products.length}):`);
  for (const p of products) console.log("  " + p.id);
  process.exit(0);
}

let done = 0;
const skipped = [];

for (const file of files) {
  const id = basename(file, extname(file)).toLowerCase();
  const product = products.find((p) => p.id === id);
  if (!product) {
    skipped.push(file);
    continue;
  }
  const dest = join(root, "public", product.photo.replace(/^\//, ""));
  execFileSync("magick", [
    join(dropDir, file),
    "-auto-orient",
    // Fit the whole item in frame on white rather than cropping its edges off.
    "-resize", `${SIZE}x${SIZE}>`,
    "-background", "white",
    "-gravity", "center",
    "-extent", `${SIZE}x${SIZE}`,
    "-quality", "88",
    "-strip",
    dest,
  ]);
  console.log(`  ${file}  ->  ${product.photo}`);
  done++;
}

console.log(`\nImported ${done} photo${done === 1 ? "" : "s"}.`);

if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} — filename didn't match a product id:`);
  for (const f of skipped) console.log("  " + f);
  console.log("\nRun with no files in the folder to list every valid id.");
}

if (done) {
  console.log("\nNext:  npm run build   then commit and push to publish.");
}
