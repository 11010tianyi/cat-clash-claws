// Runs automatically after `cap sync` (chained from the
// capacitor:sync:after hook in package.json).
//
// Pins the debug signing key for the generated Android project.
// The repository Secrets route proved unreliable (the pasted base64
// did not decode back to a usable keystore, so every CI build silently
// minted a one-off debug key and updates failed with
// INSTALL_FAILED_UPDATE_INCOMPATIBLE). Instead, the debug keystore
// travels with the repo as signing/debug.keystore.b64 (base64 text,
// because the commit API cannot carry raw binary), is decoded into
// the generated project here, and the generated build.gradle is
// pointed at it. A debug keystore is a throwaway signing key for
// sideloaded debug builds only; it protects no production secret.
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const androidDir = path.join(root, "android");
const b64Path = path.join(root, "signing", "debug.keystore.b64");
const keystorePath = path.join(androidDir, "app", "debug.keystore");
const gradlePath = path.join(androidDir, "app", "build.gradle");
const MARKER = "// cat-clash-claws: pinned debug signing (apply-signing.mjs)";

if (!existsSync(androidDir)) {
  console.log("[apply-signing] android/ not generated yet, skipping.");
  process.exit(0);
}
if (!existsSync(b64Path)) {
  console.log("[apply-signing] signing/debug.keystore.b64 not found, skipping.");
  process.exit(0);
}

const b64 = readFileSync(b64Path, "utf8").replace(/\s+/g, "");
writeFileSync(keystorePath, Buffer.from(b64, "base64"));
console.log("[apply-signing] Wrote android/app/debug.keystore from repo source.");

const gradle = readFileSync(gradlePath, "utf8");
if (!gradle.includes(MARKER)) {
  appendFileSync(
    gradlePath,
    `
${MARKER}
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
`
  );
  console.log("[apply-signing] Pointed build.gradle debug signing at the pinned keystore.");
} else {
  console.log("[apply-signing] build.gradle already pinned, leaving as is.");
}
