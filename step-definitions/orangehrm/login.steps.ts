import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { OrangeHRMLoginPage } from "../../pages/OrangeHRMLoginPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I am on the OrangeHRM login page", async function (this: CustomWorld) {
  this.orangehrmLoginPage = new OrangeHRMLoginPage(this.page, this.scenarioLogs, this.locatorUsages);
  await this.orangehrmLoginPage.goto(env.orangehrmBaseUrl);
});

When(
  "I sign in with username {string} and password {string}",
  { timeout: 60000 },
  async function (this: CustomWorld, username: string, password: string) {
    assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
    await this.orangehrmLoginPage.signIn(username, password);
  }
);

Then(
  "the OrangeHRM login result should be {string}",
  { timeout: 60000 },
  async function (this: CustomWorld, expectedOutcome: string) {
    assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
    const successful = await this.orangehrmLoginPage.isLoginSuccessful();

    if (expectedOutcome === "success") {
      assert.ok(successful, `Expected successful login but URL is ${this.page.url()}`);
      return;
    }

    assert.ok(!successful, "Expected login failure but user reached dashboard");
  }
);

Then(
  "I should see an OrangeHRM error containing {string}",
  async function (this: CustomWorld, expectedText: string) {
    assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
    const errorText = await this.orangehrmLoginPage.getAnyErrorText();
    assert.match(
      errorText,
      new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      `Expected error containing "${expectedText}" but got "${errorText}"`
    );
  }
);

Then("the OrangeHRM login form should still be visible", async function (this: CustomWorld) {
  assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
  const visible = await this.orangehrmLoginPage.isFormVisible();
  assert.ok(visible, "Expected login form to be visible but it was not");
});

When("I click the forgot password link", async function (this: CustomWorld) {
  assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
  await this.orangehrmLoginPage.clickForgotPassword();
});

Then("I should be on the OrangeHRM password reset page", async function (this: CustomWorld) {
  await this.page.waitForURL(/requestPasswordResetCode/, { timeout: 10000 });
  assert.match(
    this.page.url(),
    /requestPasswordResetCode/,
    `Expected password reset URL but got ${this.page.url()}`
  );
});

When("I navigate directly to the OrangeHRM dashboard", async function (this: CustomWorld) {
  assert.ok(this.orangehrmLoginPage, "OrangeHRMLoginPage is not initialized");
  await this.orangehrmLoginPage.navigateToDashboard(env.orangehrmBaseUrl);
});

Then("I should be redirected to the OrangeHRM login page", async function (this: CustomWorld) {
  await this.page.waitForURL(/auth\/login/, { timeout: 10000 });
  assert.match(
    this.page.url(),
    /auth\/login/,
    `Expected redirect to login page but got ${this.page.url()}`
  );
});
