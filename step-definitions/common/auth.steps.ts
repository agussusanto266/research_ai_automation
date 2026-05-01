import { Given } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { LoginPage } from "../../pages/LoginPage";
import { CustomWorld } from "../../support/CustomWorld";

const TEST_PASSWORDS: Record<string, string> = {
  standard_user: "secret_sauce",
  locked_out_user: "secret_sauce",
  problem_user: "secret_sauce",
  performance_glitch_user: "secret_sauce"
};

Given("I am logged in as {string}", async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page, this.scenarioLogs);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(username, TEST_PASSWORDS[username] ?? "secret_sauce");
  assert.match(this.page.url(), /inventory\.html/, `Login failed for user: ${username}`);
});

Given("I am not logged in", async function (this: CustomWorld) {
  // Fresh browser context is created per scenario by the Before hook — no action needed
});
