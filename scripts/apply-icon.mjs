// Runs automatically after `cap sync` (Capacitor package.json hook).
// Regenerates the Android launcher icons from the app icon so the APK
// never ships with the default Capacitor icon. The android/ platform
// is generated fresh in CI, so this must run on every sync.
//
// The icon travels through git as assets/icon.webp.b64 (base64 text of
// a WebP image), because the API route used to commit files cannot
// carry raw binary and has a tight per-call size limit. It is decoded
// back to assets/icon.png here (the generator reads image content, so
// WebP bytes in a .png name are fine), before generation.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bin = path.join(root, "node_modules", ".bin", "capacitor-assets");
const iconPng = path.join(root, "assets", "icon.png");
const iconB64 = path.join(root, "assets", "icon.webp.b64");

if (!existsSync(path.join(root, "android"))) {
  console.log("[apply-icon] android/ not generated yet, skipping.");
  process.exit(0);
}

if (!existsSync(iconPng) && existsSync(iconB64)) {
  const b64 = readFileSync(iconB64, "utf8").replace(/\s+/g, "");
  writeFileSync(iconPng, Buffer.from(b64, "base64"));
  console.log("[apply-icon] Decoded app icon from base64 source.");
}

if (!existsSync(iconPng)) {
  console.log("[apply-icon] No icon source found, skipping.");
  process.exit(0);
}

execFileSync(bin, ["generate", "--android"], { cwd: root, stdio: "inherit" });
console.log("[apply-icon] Android launcher icons regenerated from the app icon.");
