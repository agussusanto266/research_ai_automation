import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../config/env";
import { LoginPage } from "../pages/LoginPage";
import { CustomWorld } from "../support/CustomWorld";

Given("I open the SauceDemo login page", async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page, this.scenarioLogs);
  await this.loginPage.goto(env.baseUrl);
});

When(
  "I login with username {string} and password {string}",
  async function (this: CustomWorld, username: string, password: string) {
    assert.ok(this.loginPage, "LoginPage is not initialized");
    await this.loginPage.login(username, password);
  }
);

Then("login should be {string}", async function (this: CustomWorld, expectedOutcome: string) {
  assert.ok(this.loginPage, "LoginPage is not initialized");
  const successful = await this.loginPage.isLoginSuccessful();

  if (expectedOutcome === "success") {
    assert.ok(successful, `Expected successful login but current URL is ${this.page.url()}`);
    assert.match(this.page.url(), /inventory\.html/, "Expected inventory URL after successful login");
    await this.page.getByText("Products", { exact: true }).waitFor({ state: "visible" });
    return;
  }

  assert.ok(!successful, "Expected login failure but user reached inventory page");
});

Then(
  "I should see message containing {string}",
  async function (this: CustomWorld, expectedMessage: string) {
    assert.ok(this.loginPage, "LoginPage is not initialized");
    if (expectedMessage.trim().length === 0) {
      return;
    }

    const actualMessage = await this.loginPage.getErrorMessage();
    assert.match(
      actualMessage,
      new RegExp(expectedMessage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      `Expected "${actualMessage}" to include "${expectedMessage}"`
    );
  }
);
