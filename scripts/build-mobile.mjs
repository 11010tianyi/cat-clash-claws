// Assemble the static site into dist/ for Capacitor packaging.
// Only the files the game actually loads are copied (docs and notes
// stay out of the APK).
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const files = [
  "index.html",
  "css",
  "js",
  "images",
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const name of files) {
  cpSync(join(root, name), join(dist, name), { recursive: true });
}
console.log(`build-mobile: copied ${files.length} entries into dist/`);
