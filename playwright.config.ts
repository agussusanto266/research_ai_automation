import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

// This config applies when running with `npx playwright test`.
// The primary test runner for this project is Cucumber.js (`npm test`).
// Browser lifecycle for Cucumber is managed in support/hooks.ts.
export default defineConfig({
  timeout: 30000,
  use: {
    browserName: "chromium",
    headless: process.env.HEADLESS === "true",
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com/",
    screenshot: "only-on-failure",
    video: "off"
  },
  reporter: [
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["json", { outputFile: "reports/results.json" }]
  ],
  workers: 1
});
