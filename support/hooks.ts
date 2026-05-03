import {
  After,
  Before,
  BeforeAll,
  BeforeStep,
  AfterStep,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { promises as fs } from "node:fs";
import { CustomWorld } from "./CustomWorld";
import { SelfHealingLocatorResolver } from "../utils/selfHealingLocator";
import { checkAccessibility } from "./accessibility";
import { compareScreenshot } from "./visual";
import { prewarmAllSessions } from "./sessionCache";
import { env } from "../config/env";

// Test-data teardown registry — step definitions call world.registerDataTeardown()
// to enqueue async cleanup that runs in After for @data-teardown scenarios.
declare module "./CustomWorld" {
  interface CustomWorld {
    _dataTeardowns: Array<() => Promise<void>>;
    registerDataTeardown(fn: () => Promise<void>): void;
  }
}

CustomWorld.prototype._dataTeardowns = [];
CustomWorld.prototype.registerDataTeardown = function (fn: () => Promise<void>) {
  this._dataTeardowns.push(fn);
};

setDefaultTimeout(30000);

After({ tags: "@data-teardown" }, async function (this: CustomWorld) {
  for (const fn of this._dataTeardowns ?? []) {
    try {
      await fn();
    } catch (e) {
      console.warn("[TEST] Data teardown error (non-fatal):", e);
    }
  }
  this._dataTeardowns = [];
});

// Pre-build sessions for all users before any scenario runs.
// Each Cucumber worker calls this independently; the per-worker module-level
// cache is then warm for every subsequent "I am logged in as" step.
BeforeAll({ timeout: 120000 }, async function () {
  if (env.prewarmSessions) {
    console.log("[TEST] Prewarming SauceDemo sessions");
    await prewarmAllSessions();
    console.log("[TEST] Finished prewarming SauceDemo sessions");
  }
});

// Save and restore locatorTimeout around slow scenarios so glitch_user
// doesn't exhaust all fallback candidates before elements render.
// SAFETY: env is a plain object mutated on the calling process's module instance.
// Cucumber workers are separate Node.js processes, so each worker has its own
// copy of this module — mutation is process-local and there are no race conditions.
// If the concurrency model ever changes to thread-based workers (shared memory),
// this pattern must be replaced with a per-scenario timeout context object.
let _savedLocatorTimeout = env.locatorTimeout;

Before({ tags: "@slow" }, function () {
  setDefaultTimeout(90000);
  _savedLocatorTimeout = env.locatorTimeout;
  env.locatorTimeout = env.locatorTimeoutSlow;
});

After({ tags: "@slow" }, function () {
  env.locatorTimeout = _savedLocatorTimeout;
  setDefaultTimeout(30000);
});

After({ tags: "@visual" }, async function (this: CustomWorld, scenario) {
  if (!this.page) {
    return;
  }

  const safeName = scenario.pickle.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const result = await compareScreenshot(this.page, safeName);
  if (!result.matched) {
    const msg =
      `Visual regression: ${result.diffPixels} pixels differ` +
      ` (${result.diffPercent.toFixed(2)}%)` +
      (result.diffPath ? `\nDiff saved: ${result.diffPath}` : "");
    throw new Error(msg);
  }
});

BeforeStep(async function ({ pickleStep }) {
  console.log(`[TEST] STEP ${pickleStep.text}`);
});

Before(async function (this: CustomWorld, scenario) {
  this.scenarioStartedAt = Date.now();
  console.log(`[TEST] START ${scenario.pickle.name}`);
  this.scenarioLogs = [];
  this.consoleLogs = [];
  this.locatorUsages = [];
  await this.initBrowser();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.on("console", (message) => {
    this.consoleLogs.push(`[${message.type()}] ${message.text()}`);
  });
});

AfterStep(async function (this: CustomWorld, { pickleStep, result }) {
  console.log(`[TEST] STEP ${result?.status ?? "UNKNOWN"} ${pickleStep.text}`);

  if (result?.status === Status.FAILED && this.page) {
    await fs.mkdir("reports", { recursive: true });
    await this.page.screenshot({
      path: `reports/failed-${Date.now()}.png`,
      fullPage: true,
    });
  }
});

After({ tags: "@a11y" }, async function (this: CustomWorld, scenario) {
  if (!this.page) {
    return;
  }

  const violations = await checkAccessibility(this.page);
  if (violations.length > 0) {
    await fs.mkdir("reports", { recursive: true });
    const safeScenario = scenario.pickle.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const a11yPath = `reports/a11y-${safeScenario}-${Date.now()}.json`;
    await fs.writeFile(a11yPath, JSON.stringify(violations, null, 2), "utf-8");
    const summary = violations
      .map((v) => `  [${v.impact ?? "unknown"}] ${v.id}: ${v.description} (${v.nodes} node(s))`)
      .join("\n");
    throw new Error(`Accessibility violations found:\n${summary}\nFull report: ${a11yPath}`);
  }
});

After(async function (this: CustomWorld, scenario) {
  const elapsedSeconds = ((Date.now() - this.scenarioStartedAt) / 1000).toFixed(1);
  console.log(
    `[TEST] END ${scenario.result?.status ?? "UNKNOWN"} ${scenario.pickle.name} (${elapsedSeconds}s)`
  );

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
      ...this.consoleLogs,
    ].join("\n");
    await fs.writeFile(diagnosticPath, diagnostics, "utf-8");
  }

  await SelfHealingLocatorResolver.flush(this.locatorUsages);
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
