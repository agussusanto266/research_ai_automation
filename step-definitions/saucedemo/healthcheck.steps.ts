import { Given, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { HomePage } from "../../pages/saucedemo/HomePage";
import { env } from "../../config/env";
import { CustomWorld } from "../../support/CustomWorld";

Given("I navigate to the base URL", async function (this: CustomWorld) {
  await this.getPage(HomePage).goto(env.baseUrl);
});

Then(
  "the page title should contain {string}",
  async function (this: CustomWorld, expected: string) {
    const title = await this.getPage(HomePage).getTitle();
    assert.match(title, new RegExp(expected, "i"));
  }
);
