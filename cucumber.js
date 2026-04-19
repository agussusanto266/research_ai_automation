module.exports = {
  default: {
    requireModule: ["ts-node/register", "dotenv/config"],
    require: ["step-definitions/**/*.ts", "support/**/*.ts"],
    format: [
      "progress",
      "html:reports/report.html",
      "json:reports/report.json"
    ],
    publishQuiet: true,
    parallel: 1
  }
};
