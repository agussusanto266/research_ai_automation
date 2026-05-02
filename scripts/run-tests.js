// Wrapper: runs cucumber-js then auto-opens the HTML report.
//
// Usage:
//   node scripts/run-tests.js [cucumber-js args...]
//   node scripts/run-tests.js --tags "@smoke" --report reports/smoke-report.html
//
// --report <path>  Optional. Writes an extra HTML report to <path> and opens it
//                  after the run. Falls back to reports/report.html if omitted.
//                  All other args are forwarded to cucumber-js as-is.
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rawArgs = process.argv.slice(2);

// Pull --report <path> out of the args before forwarding to cucumber-js
const reportFlagIndex = rawArgs.indexOf('--report');
let reportPath;
let cucumberArgs;

if (reportFlagIndex !== -1 && rawArgs[reportFlagIndex + 1]) {
  const relReportPath = rawArgs[reportFlagIndex + 1];
  reportPath = path.resolve(__dirname, '..', relReportPath);

  // Remove --report <path> from the args cucumber-js receives
  cucumberArgs = rawArgs.filter((_, i) => i !== reportFlagIndex && i !== reportFlagIndex + 1);

  // Tell cucumber-js to also write an HTML report to this specific file
  cucumberArgs = [...cucumberArgs, '--format', `html:${relReportPath}`];
} else {
  reportPath = path.resolve(__dirname, '..', 'reports', 'report.html');
  cucumberArgs = rawArgs;
}

const reportsDir = path.dirname(reportPath);
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Clean up leftover failure artifacts from previous runs
const rootReportsDir = path.resolve(__dirname, '..', 'reports');
if (fs.existsSync(rootReportsDir)) {
  for (const file of fs.readdirSync(rootReportsDir)) {
    if (/^failed-.*\.png$/.test(file) || /^diagnostics-.*\.log$/.test(file)) {
      fs.rmSync(path.join(rootReportsDir, file));
    }
  }
}

const result = spawnSync('npx', ['cucumber-js', ...cucumberArgs], {
  stdio: 'inherit',
  shell: true
});

if (fs.existsSync(reportPath)) {
  spawnSync('npx', ['open-cli', reportPath], { shell: true, stdio: 'ignore' });
}

process.exit(result.status ?? 1);
