import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { OrangeHRMLoginPage } from "../../pages/orangehrm/OrangeHRMLoginPage";
import { OrangeHRMDashboardPage } from "../../pages/orangehrm/OrangeHRMDashboardPage";
import { CustomWorld } from "../../support/CustomWorld";

Given(
  "I am logged in to OrangeHRM as {string}",
  { timeout: 180000 },
  async function (this: CustomWorld, username: string) {
    const loginPage = this.getPage(OrangeHRMLoginPage);
    // Admin password is fixed for the public demo
    const password = username === "Admin" ? "admin123" : username;

    let success = false;
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await loginPage.goto(env.orangehrmBaseUrl);
        await loginPage.signIn(username, password);
        success = await loginPage.isLoginSuccessful();
        if (success) {
          break;
        }
        this.scenarioLogs.push(`[orangehrm-login] attempt ${attempt} failed at ${this.page.url()}`);
      } catch (error) {
        lastError = error;
        this.scenarioLogs.push(`[orangehrm-login] attempt ${attempt} errored: ${String(error)}`);
      }
    }

    success = success || /dashboard\/index/.test(this.page.url());
    assert.ok(
      success,
      `Expected OrangeHRM login to succeed for "${username}" but URL is ${this.page.url()}. Last error: ${String(lastError ?? "none")}`
    );
  }
);

Given("I am not logged in to OrangeHRM", async function (this: CustomWorld) {
  // Actively clear session so Background-injected login state doesn't persist
  await this.page.context().clearCookies();
  const url = this.page.url();
  if (url && url !== "about:blank") {
    await this.page.evaluate(() => window.localStorage.clear()).catch(() => {});
  }
});

When(
  "I navigate to the OrangeHRM module {string}",
  async function (this: CustomWorld, module: string) {
    await this.getPage(OrangeHRMDashboardPage).navigateTo(module);
  }
);

Then(
  "the OrangeHRM dashboard heading should be {string}",
  async function (this: CustomWorld, expected: string) {
    const actual = await this.getPage(OrangeHRMDashboardPage).getHeading();
    assert.strictEqual(actual, expected, `Expected heading "${expected}" but got "${actual}"`);
  }
);

Then("the OrangeHRM navigation menu should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(OrangeHRMDashboardPage).isNavMenuVisible();
  assert.ok(visible, "Expected OrangeHRM navigation menu to be visible");
});

Then(
  "the OrangeHRM navigation menu should contain {string}",
  async function (this: CustomWorld, item: string) {
    const names = await this.getPage(OrangeHRMDashboardPage).getNavItemNames();
    const found = names.some((n) => n.toLowerCase().includes(item.toLowerCase()));
    assert.ok(found, `Expected nav menu to contain "${item}" but got: [${names.join(", ")}]`);
  }
);

Then(
  "the OrangeHRM breadcrumb should contain {string}",
  async function (this: CustomWorld, expected: string) {
    const breadcrumb = await this.getPage(OrangeHRMDashboardPage).getCurrentBreadcrumb();
    assert.ok(
      breadcrumb.toLowerCase().includes(expected.toLowerCase()),
      `Expected breadcrumb to contain "${expected}" but got "${breadcrumb}"`
    );
  }
);
