import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { OrangeHRMLoginPage } from "../../pages/OrangeHRMLoginPage";
import { OrangeHRMDashboardPage } from "../../pages/OrangeHRMDashboardPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I am logged in to OrangeHRM as {string}", { timeout: 180000 }, async function (this: CustomWorld, username: string) {
  this.orangehrmLoginPage = new OrangeHRMLoginPage(this.page, this.scenarioLogs, this.locatorUsages);
  // Admin password is fixed for the public demo
  const password = username === "Admin" ? "admin123" : username;

  let success = false;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await this.orangehrmLoginPage.goto(env.orangehrmBaseUrl);
      await this.orangehrmLoginPage.signIn(username, password);
      success = await this.orangehrmLoginPage.isLoginSuccessful();
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
  assert.ok(success, `Expected OrangeHRM login to succeed for "${username}" but URL is ${this.page.url()}. Last error: ${String(lastError ?? "none")}`);
  this.orangehrmDashboardPage = new OrangeHRMDashboardPage(this.page, this.scenarioLogs, this.locatorUsages);
});

Given("I am not logged in to OrangeHRM", async function (this: CustomWorld) {
  // Actively clear session so Background-injected login state doesn't persist
  await this.page.context().clearCookies();
  const url = this.page.url();
  if (url && url !== "about:blank") {
    await this.page.evaluate(() => window.localStorage.clear()).catch(() => {});
  }
});

When("I navigate to the OrangeHRM module {string}", async function (this: CustomWorld, module: string) {
  assert.ok(this.orangehrmDashboardPage, "OrangeHRMDashboardPage is not initialized");
  await this.orangehrmDashboardPage.navigateTo(module);
});

Then("the OrangeHRM dashboard heading should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.orangehrmDashboardPage, "OrangeHRMDashboardPage is not initialized");
  const actual = await this.orangehrmDashboardPage.getHeading();
  assert.strictEqual(actual, expected, `Expected heading "${expected}" but got "${actual}"`);
});

Then("the OrangeHRM navigation menu should be visible", async function (this: CustomWorld) {
  assert.ok(this.orangehrmDashboardPage, "OrangeHRMDashboardPage is not initialized");
  const visible = await this.orangehrmDashboardPage.isNavMenuVisible();
  assert.ok(visible, "Expected OrangeHRM navigation menu to be visible");
});

Then("the OrangeHRM navigation menu should contain {string}", async function (this: CustomWorld, item: string) {
  assert.ok(this.orangehrmDashboardPage, "OrangeHRMDashboardPage is not initialized");
  const names = await this.orangehrmDashboardPage.getNavItemNames();
  const found = names.some((n) => n.toLowerCase().includes(item.toLowerCase()));
  assert.ok(found, `Expected nav menu to contain "${item}" but got: [${names.join(", ")}]`);
});

Then("the OrangeHRM breadcrumb should contain {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.orangehrmDashboardPage, "OrangeHRMDashboardPage is not initialized");
  const breadcrumb = await this.orangehrmDashboardPage.getCurrentBreadcrumb();
  assert.ok(
    breadcrumb.toLowerCase().includes(expected.toLowerCase()),
    `Expected breadcrumb to contain "${expected}" but got "${breadcrumb}"`
  );
});
