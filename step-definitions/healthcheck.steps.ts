import { Given, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { HomePage } from "../pages/HomePage";
import { env } from "../config/env";
import { CustomWorld } from "../support/CustomWorld";

Given("I navigate to the base URL", async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  await homePage.goto(env.baseUrl);
});

Then("the page title should contain {string}", async function (this: CustomWorld, expected: string) {
  const homePage = new HomePage(this.page);
  const title = await homePage.getTitle();
  assert.match(title, new RegExp(expected, "i"));
});
