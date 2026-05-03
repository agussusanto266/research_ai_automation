import { chromium, firefox, webkit } from "playwright";
import type { BrowserContext } from "playwright";
import { env } from "../config/env";
import { SAUCEDEMO_USERS } from "../test-data/saucedemo-users";

type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

// Module-level cache: each Cucumber worker is a separate Node process,
// so this map is per-worker. First scenario per user pays the login cost;
// subsequent scenarios in the same worker inject the cached state directly.
const cache = new Map<string, StorageState | null>();
const pending = new Map<string, Promise<StorageState | null>>();
// Note: selectors.setTestIdAttribute is set once in CustomWorld.ts — not here.

async function buildSession(username: string): Promise<StorageState | null> {
  const password = SAUCEDEMO_USERS[username];
  if (!password) return null;

  const browserType =
    env.browser === "firefox" ? firefox : env.browser === "webkit" ? webkit : chromium;
  const browser = await browserType.launch({ headless: env.headless });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(env.baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.getByTestId("username").fill(username, { timeout: 10000 });
    await page.getByTestId("password").fill(password, { timeout: 10000 });
    await page.getByTestId("login-button").click({ timeout: 10000 });

    try {
      await page.waitForURL(/inventory\.html/, { timeout: 15000 });
    } catch {
      // User cannot complete login (e.g. locked_out_user) — null is intentionally cached
      return null;
    }

    return await context.storageState();
  } catch {
    // Network error or browser crash — fall back to UI login in the step
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * Returns the cached StorageState for `username`, building it on first call.
 * Returns null if the user cannot log in successfully (e.g. locked_out_user).
 */
export async function getSessionState(username: string): Promise<StorageState | null> {
  if (cache.has(username)) return cache.get(username)!;

  // Deduplicate concurrent requests for the same user within a worker
  if (!pending.has(username)) {
    const promise = buildSession(username)
      .then((state) => {
        cache.set(username, state); // cache null too — avoids retrying on every scenario
        pending.delete(username);
        return state;
      })
      .catch(() => {
        pending.delete(username);
        return null;
      });
    pending.set(username, promise);
  }

  return pending.get(username)!;
}

/**
 * Pre-builds sessions for all configured users.
 * Call from a BeforeAll hook so sessions are ready before step execution begins.
 */
export async function prewarmAllSessions(): Promise<void> {
  await Promise.allSettled(Object.keys(SAUCEDEMO_USERS).map((u) => getSessionState(u)));
}
