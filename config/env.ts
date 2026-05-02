import dotenv from "dotenv";

process.env.DOTENV_CONFIG_QUIET ??= "true";
dotenv.config({ quiet: true });

export const env = {
  baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com/",
  orangehrmBaseUrl: process.env.ORANGEHRM_BASE_URL ?? "https://opensource-demo.orangehrmlive.com",
  todoMvcBaseUrl: process.env.TODOMVC_BASE_URL ?? "https://todomvc.com/examples/react/dist",
  headless: process.env.HEADLESS !== "false",
  prewarmSessions: process.env.PREWARM_SESSIONS === "true",
  locatorTimeout: parseInt(process.env.LOCATOR_TIMEOUT_MS ?? "1200", 10),
  locatorTimeoutSlow: parseInt(process.env.LOCATOR_TIMEOUT_SLOW_MS ?? "8000", 10),
  browser: (process.env.BROWSER ?? "chromium") as "chromium" | "firefox" | "webkit",
};
