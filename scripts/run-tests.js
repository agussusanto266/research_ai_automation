// Wrapper: runs cucumber-js then auto-opens the HTML report.
//
// Usage:
//   node scripts/run-tests.js [cucumber-js args...]
//   node scripts/run-tests.js --tags "@smoke" --report reports/smoke-report.html
//
// --report <path>  Optional. Writes an extra HTML report to <path> and opens it
//                  after the run. Falls back to reports/report.html if omitted.
//                  All other args are forwarded to cucumber-js as-is.
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const rawArgs = process.argv.slice(2);

// Pull --report <path> out of the args before forwarding to cucumber-js
const reportFlagIndex = rawArgs.indexOf("--report");
let reportPath;
let cucumberArgs;

if (reportFlagIndex !== -1 && rawArgs[reportFlagIndex + 1]) {
  const relReportPath = rawArgs[reportFlagIndex + 1];
  reportPath = path.resolve(__dirname, "..", relReportPath);

  // Remove --report <path> from the args cucumber-js receives
  cucumberArgs = rawArgs.filter((_, i) => i !== reportFlagIndex && i !== reportFlagIndex + 1);

  // Tell cucumber-js to also write an HTML report to this specific file
  cucumberArgs = [...cucumberArgs, "--format", `html:${relReportPath}`];
} else {
  reportPath = path.resolve(__dirname, "..", "reports", "report.html");
  cucumberArgs = rawArgs;
}

const reportsDir = path.dirname(reportPath);
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Clean up leftover failure artifacts from previous runs
const rootReportsDir = path.resolve(__dirname, "..", "reports");
if (fs.existsSync(rootReportsDir)) {
  for (const file of fs.readdirSync(rootReportsDir)) {
    if (
      /^failed-.*\.png$/.test(file) ||
      /^diagnostics-.*\.log$/.test(file) ||
      file === "report.json"
    ) {
      fs.rmSync(path.join(rootReportsDir, file));
    }
  }
}

const cucumberBin = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@cucumber",
  "cucumber",
  "bin",
  "cucumber.js"
);
const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(process.execPath, [cucumberBin, ...cucumberArgs], {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    DOTENV_CONFIG_QUIET: "true",
  },
});

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function printFailureSummary(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    return;
  }

  let features;
  try {
    features = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    return;
  }

  const failures = [];
  for (const feature of features) {
    for (const element of feature.elements ?? []) {
      const failedStep = (element.steps ?? []).find((step) => step.result?.status === "failed");
      if (!failedStep) {
        continue;
      }

      const errorLines = stripAnsi(failedStep.result.error_message ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const error = [errorLines[0], errorLines.find((line) => line.startsWith("at "))]
        .filter(Boolean)
        .join("\n      ");

      failures.push({
        feature: feature.uri,
        line: element.line,
        scenario: element.name,
        step: failedStep.name || failedStep.keyword?.trim() || "hook",
        error,
      });
    }
  }

  if (failures.length === 0) {
    return;
  }

  console.log("\nFailure summary:");
  for (const failure of failures.slice(0, 10)) {
    console.log(`- ${failure.scenario} (${failure.feature}:${failure.line})`);
    console.log(`  Step: ${failure.step}`);
    if (failure.error) {
      console.log(`  Error: ${failure.error}`);
    }
  }

  if (failures.length > 10) {
    console.log(`- ... ${failures.length - 10} more failure(s). See ${jsonPath}`);
  }
}

if ((result.status ?? 1) !== 0) {
  printFailureSummary(path.resolve(__dirname, "..", "reports", "report.json"));
}

if (!process.env.CI && fs.existsSync(reportPath)) {
  spawnSync(npxBin, ["open-cli", reportPath], { shell: false, stdio: "ignore" });
}

process.exit(result.status ?? 1);
