import { After, Before, AfterStep, Status } from "@cucumber/cucumber";
import { promises as fs } from "node:fs";
import { CustomWorld } from "./CustomWorld";

Before(async function (this: CustomWorld) {
  this.scenarioLogs = [];
  this.consoleLogs = [];
  await this.initBrowser();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.on("console", (message) => {
    this.consoleLogs.push(`[${message.type()}] ${message.text()}`);
  });
});

AfterStep(async function (this: CustomWorld, { result }) {
  if (result?.status === Status.FAILED) {
    await this.page.screenshot({
      path: `reports/failed-${Date.now()}.png`,
      fullPage: true
    });
  }
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    await fs.mkdir("reports", { recursive: true });
    const safeScenario = scenario.pickle.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const diagnosticPath = `reports/diagnostics-${safeScenario}-${Date.now()}.log`;
    const diagnostics = [
      `scenario: ${scenario.pickle.name}`,
      `status: ${scenario.result.status}`,
      "",
      "== Locator + scenario logs ==",
      ...this.scenarioLogs,
      "",
      "== Browser console logs ==",
      ...this.consoleLogs
    ].join("\n");
    await fs.writeFile(diagnosticPath, diagnostics, "utf-8");
  }

  await this.page.close();
  await this.context.close();
  await this.browser.close();
});
