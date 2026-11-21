// Maven Central rate-limits GitHub-hosted runner IPs (HTTP 429), which made
// the CI Gradle build fail while resolving the Android Gradle Plugin's
// classpath (kotlin-stdlib, gson, guava, ...). Route Maven Central through
// Google's full mirror of it, which does not throttle those IPs.
// Runs from the capacitor:sync:after hook, after `cap add android` has
// generated android/ and before the workflow's gradle step. Idempotent.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const gradlePath = join(rootDir, "android", "build.gradle");
const MIRROR = "https://maven-central.storage-download.googleapis.com/maven2";
const MARKER = "maven-central mirror (apply-maven-mirror)";

if (!existsSync(gradlePath)) {
  console.log("[apply-maven-mirror] android/build.gradle not found, skipping.");
  process.exit(0);
}

const source = readFileSync(gradlePath, "utf8");
if (source.includes(MARKER)) {
  console.log("[apply-maven-mirror] Mirror already configured, leaving as is.");
  process.exit(0);
}

// Insert the mirror right before every `mavenCentral()` line so it is tried
// ahead of the throttled repo.maven.apache.org, keeping google() first.
const patched = source.replace(
  /^(\s*)mavenCentral\(\)/gm,
  `$1maven { url '${MIRROR}' } // ${MARKER}\n$1mavenCentral()`,
);

if (patched === source) {
  console.error("[apply-maven-mirror] No mavenCentral() found in android/build.gradle; cannot patch.");
  process.exit(1);
}

writeFileSync(gradlePath, patched);
console.log("[apply-maven-mirror] Maven Central mirror added to android/build.gradle.");
