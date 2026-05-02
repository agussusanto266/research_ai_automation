// Aggregates per-scenario a11y-*.json reports into a single WCAG compliance summary.
// Run after every test execution: npm run merge:a11y
const fs   = require("fs");
const path = require("path");

const reportsDir = path.resolve(__dirname, "..", "reports");

if (!fs.existsSync(reportsDir)) {
  console.log("reports/ directory not found — nothing to aggregate");
  process.exit(0);
}

const a11yFiles = fs.readdirSync(reportsDir)
  .filter((f) => /^a11y-.*\.json$/.test(f))
  .map((f) => path.join(reportsDir, f));

if (a11yFiles.length === 0) {
  console.log("No a11y report files found — no @a11y scenarios ran");
  process.exit(0);
}

const allViolations = [];
const violationById  = {};
const violationByImpact = {};

for (const file of a11yFiles) {
  let violations;
  try { violations = JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { console.warn(`Skipping unreadable file: ${file}`); continue; }

  const scenarioName = path.basename(file, ".json").replace(/^a11y-\d+-/, "");

  for (const v of violations) {
    allViolations.push({ ...v, scenario: scenarioName });

    // Aggregate by violation ID
    if (!violationById[v.id]) {
      violationById[v.id] = { id: v.id, impact: v.impact, description: v.description, totalNodes: 0, scenarios: [] };
    }
    violationById[v.id].totalNodes += v.nodes;
    violationById[v.id].scenarios.push(scenarioName);

    // Aggregate by impact level
    const impact = v.impact ?? "unknown";
    violationByImpact[impact] = (violationByImpact[impact] ?? 0) + 1;
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  scenariosScanned: a11yFiles.length,
  totalViolations: allViolations.length,
  uniqueViolations: Object.keys(violationById).length,
  byImpact: violationByImpact,
  violations: Object.values(violationById).sort((a, b) => {
    const order = { critical: 0, serious: 1, moderate: 2, minor: 3, unknown: 4 };
    return (order[a.impact] ?? 4) - (order[b.impact] ?? 4);
  }),
};

const outputPath = path.join(reportsDir, "a11y-summary.json");
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), "utf-8");

console.log(`Aggregated ${a11yFiles.length} a11y report(s) → ${outputPath}`);
console.log(`Total violations: ${summary.totalViolations} (${summary.uniqueViolations} unique)`);
if (Object.keys(violationByImpact).length > 0) {
  console.log("By impact:", JSON.stringify(violationByImpact));
}
if (summary.totalViolations === 0) {
  console.log("No WCAG violations found across all scanned scenarios.");
}
