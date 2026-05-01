// Wrapper: runs cucumber-js then always opens the HTML report
const { spawnSync } = require('child_process');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const reportPath = path.resolve(__dirname, '..', 'reports', 'report.html');
const reportsDir = path.dirname(reportPath);

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const result = spawnSync('npx', ['cucumber-js', ...args], {
  stdio: 'inherit',
  shell: true
});

if (fs.existsSync(reportPath)) {
  exec(`npx open-cli "${reportPath}"`);
}

process.exit(result.status ?? 1);
