// ============================================================
// NOT USED BY THE CUCUMBER RUNNER — REFERENCE ONLY
// ============================================================
// This file only applies to `npx playwright test`.
// The Cucumber runner (`npm test`) manages browser lifecycle
// via support/hooks.ts + support/CustomWorld.ts.
// Environment config is in config/env.ts.
// Do not rely on this file for any test execution behaviour.
// ============================================================
import { defineConfig } from "playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  timeout: 30000,
  use: {
    browserName: "chromium",
    headless: process.env.HEADLESS === "true",
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com/",
    screenshot: "only-on-failure",
    video: "off",
  },
  reporter: [
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["json", { outputFile: "reports/results.json" }],
  ],
  workers: 1,
});
