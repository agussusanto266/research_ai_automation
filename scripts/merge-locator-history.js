// Merges per-PID locator-history-<pid>.json files produced by parallel workers
// into a single reports/locator-history.json with heal-event summary.
// Run after every test execution: npm run merge:locator-history
const fs = require("fs");
const path = require("path");

const reportsDir = path.resolve(__dirname, "..", "reports");

if (!fs.existsSync(reportsDir)) {
  console.log("reports/ directory not found — nothing to merge");
  process.exit(0);
}

const pidFiles = fs
  .readdirSync(reportsDir)
  .filter((f) => /^locator-history-\d+\.json$/.test(f))
  .map((f) => path.join(reportsDir, f));

if (pidFiles.length === 0) {
  console.log("No per-PID history files found — nothing to merge");
  process.exit(0);
}

const merged = {};
for (const file of pidFiles) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    console.warn(`Skipping unreadable file: ${file}`);
    continue;
  }

  for (const [element, usages] of Object.entries(data)) {
    merged[element] = [...(merged[element] ?? []), ...usages];
  }
}

// Keep last 30 usages per element, sorted by timestamp
for (const element of Object.keys(merged)) {
  merged[element] = merged[element]
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(-30);
}

// Identify heal events: any usage where primary candidate was not used
const healEvents = [];
for (const [element, usages] of Object.entries(merged)) {
  const nonPrimary = usages.filter((u) => !u.candidateName.startsWith("primary"));
  if (nonPrimary.length > 0) {
    healEvents.push({
      element,
      healCount: nonPrimary.length,
      lastFallback: nonPrimary.at(-1).candidateName,
      lastAt: nonPrimary.at(-1).at,
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  filesmerged: pidFiles.length,
  healEventCount: healEvents.length,
  healEvents,
  history: merged,
};

const outputPath = path.join(reportsDir, "locator-history.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

// Remove per-PID source files after merge
for (const file of pidFiles) fs.unlinkSync(file);

console.log(`Merged ${pidFiles.length} PID file(s) → ${outputPath}`);
if (healEvents.length > 0) {
  console.log(`Heal events detected (${healEvents.length}):`);
  healEvents.forEach((e) =>
    console.log(
      `  ${e.element}: ${e.healCount} non-primary use(s), last="${e.lastFallback}" at ${e.lastAt}`
    )
  );
} else {
  console.log("No heal events — all elements resolved with primary candidates.");
}
