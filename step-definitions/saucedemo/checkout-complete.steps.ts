import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { CheckoutCompletePage } from "../../pages/CheckoutCompletePage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I have completed the checkout process", async function (this: CustomWorld) {
  await this.page.goto(`${env.baseUrl}inventory.html`, { waitUntil: "domcontentloaded" });
  await this.page.locator('[data-test^="add-to-cart"]').first().click();
  await this.page.goto(`${env.baseUrl}cart.html`, { waitUntil: "domcontentloaded" });
  await this.page.locator('[data-test="checkout"]').click();
  await this.page.waitForURL(/checkout-step-one\.html/);
  await this.page.locator('[data-test="firstName"]').fill("Test");
  await this.page.locator('[data-test="lastName"]').fill("User");
  await this.page.locator('[data-test="postalCode"]').fill("12345");
  await this.page.locator('[data-test="continue"]').click();
  await this.page.waitForURL(/checkout-step-two\.html/);
  await this.page.locator('[data-test="finish"]').click();
  await this.page.waitForURL(/checkout-complete\.html/);
  this.checkoutCompletePage = new CheckoutCompletePage(this.page, this.scenarioLogs);
});

When(
  "I complete the checkout flow with first name {string} last name {string} and zip {string}",
  async function (this: CustomWorld, firstName: string, lastName: string, zip: string) {
    await this.page.goto(`${env.baseUrl}cart.html`, { waitUntil: "domcontentloaded" });
    await this.page.locator('[data-test="checkout"]').click();
    await this.page.waitForURL(/checkout-step-one\.html/);
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(zip);
    await this.page.locator('[data-test="continue"]').click();
    await this.page.waitForURL(/checkout-step-two\.html/);
    await this.page.locator('[data-test="finish"]').click();
    await this.page.waitForURL(/checkout-complete\.html/);
    this.checkoutCompletePage = new CheckoutCompletePage(this.page, this.scenarioLogs);
  }
);

When("I navigate to the checkout complete page", async function (this: CustomWorld) {
  this.checkoutCompletePage = new CheckoutCompletePage(this.page, this.scenarioLogs);
  await this.checkoutCompletePage.goto(env.baseUrl);
});

When("I click back home", async function (this: CustomWorld) {
  assert.ok(this.checkoutCompletePage, "CheckoutCompletePage is not initialized");
  await this.checkoutCompletePage.clickBackHome();
});

When("I navigate back in the browser", async function (this: CustomWorld) {
  await this.page.goBack({ waitUntil: "domcontentloaded" });
});

Then("I should be on the checkout complete page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-complete\.html/);
  assert.match(this.page.url(), /checkout-complete\.html/, "Expected to be on the checkout complete page");
});

Then("the confirmation header should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.checkoutCompletePage, "CheckoutCompletePage is not initialized");
  const actual = await this.checkoutCompletePage.getCompleteHeader();
  assert.strictEqual(actual, expected, `Expected confirmation header "${expected}" but got "${actual}"`);
});

Then("the confirmation text should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.checkoutCompletePage, "CheckoutCompletePage is not initialized");
  const actual = await this.checkoutCompletePage.getCompleteText();
  assert.strictEqual(actual, expected, `Expected confirmation text "${expected}" but got "${actual}"`);
});

Then("the confirmation image should be visible", async function (this: CustomWorld) {
  assert.ok(this.checkoutCompletePage, "CheckoutCompletePage is not initialized");
  const visible = await this.checkoutCompletePage.isConfirmationImageVisible();
  assert.ok(visible, "Expected confirmation image (pony express) to be visible but it was not");
});

Then("the page title should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.checkoutCompletePage, "CheckoutCompletePage is not initialized");
  const actual = await this.checkoutCompletePage.getTitle();
  assert.strictEqual(actual, expected, `Expected page title "${expected}" but got "${actual}"`);
});

Then("I should be on the checkout step 2 page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-step-two\.html/);
  assert.match(this.page.url(), /checkout-step-two\.html/, "Expected to be on checkout step 2 page");
});
