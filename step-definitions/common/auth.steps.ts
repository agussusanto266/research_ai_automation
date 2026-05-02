import { Given } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { LoginPage } from "../../pages/LoginPage";
import { CustomWorld } from "../../support/CustomWorld";
import { SAUCEDEMO_USERS } from "../../test-data/saucedemo-users";
import { getSessionState } from "../../support/sessionCache";

Given("I am logged in as {string}", { timeout: 90000 }, async function (this: CustomWorld, username: string) {
  const password = SAUCEDEMO_USERS[username];
  assert.ok(password !== undefined, `No password configured for user "${username}" in test-data/saucedemo-users.ts`);

  // Attempt fast session injection: inject cached cookies + localStorage instead of UI login.
  // Each Cucumber worker caches one session per user — only the first scenario pays the
  // full login cost; subsequent scenarios skip the login form entirely.
  const sessionState = await getSessionState(username);
  if (sessionState) {
    // Inject cookies
    if (sessionState.cookies.length > 0) {
      await this.page.context().addCookies(sessionState.cookies);
    }

    // Inject localStorage (must navigate to origin first)
    const baseOrigin = new URL(env.baseUrl).origin;
    const originEntry = sessionState.origins.find((o) => o.origin === baseOrigin);
    if (originEntry && originEntry.localStorage.length > 0) {
      await this.page.goto(env.baseUrl, { waitUntil: "domcontentloaded" });
      for (const { name, value } of originEntry.localStorage) {
        await this.page.evaluate(
          ({ k, v }: { k: string; v: string }) => window.localStorage.setItem(k, v),
          { k: name, v: value }
        );
      }
    }

    // Navigate to inventory and verify session is valid
    await this.page.goto(`${env.baseUrl}inventory.html`, { waitUntil: "domcontentloaded" });
    if (/inventory\.html/.test(this.page.url())) {
      this.scenarioLogs.push(`[session-cache] ${username} authenticated via cached storage state`);
      return;
    }

    // Cached session was invalid (expired or rejected) — fall through to UI login
    this.scenarioLogs.push(`[session-cache] ${username} cached state invalid — falling back to UI login`);
  }

  // Fallback: full UI login
  const loginPage = new LoginPage(this.page, this.scenarioLogs, this.locatorUsages);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(username, password);
  assert.match(this.page.url(), /inventory\.html/, `Login failed for user: ${username}`);
});

Given("I am not logged in", async function (this: CustomWorld) {
  // Actively clear session so Background-injected login state doesn't persist
  await this.page.context().clearCookies();
  const url = this.page.url();
  if (url && url !== "about:blank") {
    await this.page.evaluate(() => window.localStorage.clear()).catch(() => {});
  }
});
