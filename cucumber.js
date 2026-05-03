const workers = parseInt(process.env.CUCUMBER_WORKERS ?? "1", 10);

// Tag taxonomy:
//   @sanity     — fastest subset (~3 scenarios); CI docker sanity check and pre-deploy gate
//   @smoke      — fast happy-path coverage; gate for merge to main
//   @regression — full suite; runs after smoke passes
//   @slow       — extended timeouts (e.g. performance_glitch_user); always included in @regression
//   @no-retry   — data-mutating scenarios; never retried to prevent duplicate side-effects
//   @visual     — visual regression via screenshot comparison
//   @a11y       — axe WCAG 2.1 AA scan on rendered pages

const shared = {
  requireModule: ["ts-node/register"],
  require: ["step-definitions/**/*.ts", "support/**/*.ts"],
  // publishQuiet: true,
  retry: 1,
  retryTagFilter: "not @no-retry",
  timeout: 30000,
  exit: true,
};

module.exports = {
  default: {
    ...shared,
    format: [
      "summary",
      "html:reports/report.html",
      "json:reports/report.json",
      "allure-cucumberjs/reporter",
    ],
    formatOptions: {
      resultsDir: "allure-results",
    },
    ...(workers > 1 ? { parallel: workers } : {}),
  },

  firefox: {
    ...shared,
    format: ["summary", "html:reports/firefox-report.html", "json:reports/firefox-report.json"],
    tags: "@smoke",
  },

  webkit: {
    ...shared,
    format: ["summary", "html:reports/webkit-report.html", "json:reports/webkit-report.json"],
    tags: "@smoke",
  },
};
