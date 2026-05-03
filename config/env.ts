import dotenv from "dotenv";

process.env.DOTENV_CONFIG_QUIET ??= "true";
dotenv.config({ quiet: true });

// In CI (process.env.CI=true), credentials must come from secrets — not the local fallback.
// This guard prevents a misconfigured pipeline from silently running with the dev default.
if (process.env.CI === "true" && !process.env.SAUCEDEMO_PASSWORD) {
  throw new Error(
    "SAUCEDEMO_PASSWORD is required in CI. Set it as a repository secret (SAUCEDEMO_PASSWORD)."
  );
}

export const env = {
  baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com/",
  orangehrmBaseUrl: process.env.ORANGEHRM_BASE_URL ?? "https://opensource-demo.orangehrmlive.com",
  todoMvcBaseUrl: process.env.TODOMVC_BASE_URL ?? "https://todomvc.com/examples/react/dist",
  headless: process.env.HEADLESS !== "false",
  prewarmSessions: process.env.PREWARM_SESSIONS === "true",
  locatorTimeout: parseInt(process.env.LOCATOR_TIMEOUT_MS ?? "3000", 10),
  locatorTimeoutSlow: parseInt(process.env.LOCATOR_TIMEOUT_SLOW_MS ?? "8000", 10),
  browser: (process.env.BROWSER ?? "chromium") as "chromium" | "firefox" | "webkit",
};
