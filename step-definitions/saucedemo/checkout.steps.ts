import { When, Then, Given } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { CustomWorld } from "../../support/CustomWorld";

// --- Setup helpers ---

When(
  "I proceed to checkout step 2 with info {string} {string} {string}",
  async function (this: CustomWorld, firstName: string, lastName: string, zip: string) {
    const cart = new CartPage(this.page, this.scenarioLogs, this.locatorUsages);
    await cart.goto(env.baseUrl);
    await cart.checkout();
    await this.page.waitForURL(/checkout-step-one\.html/);

    this.checkoutPage = new CheckoutPage(this.page, this.scenarioLogs, this.locatorUsages);
    await this.checkoutPage.fillInfo(firstName, lastName, zip);
    await this.checkoutPage.clickContinue();
    await this.page.waitForURL(/checkout-step-two\.html/);
  }
);

Given("I navigate directly to checkout step 2", async function (this: CustomWorld) {
  await this.page.goto(`${env.baseUrl}checkout-step-two.html`, { waitUntil: "domcontentloaded" });
});

// --- Step 1 steps ---

When(
  "I fill in checkout info with first name {string} last name {string} and zip {string}",
  async function (this: CustomWorld, firstName: string, lastName: string, zip: string) {
    this.checkoutPage = new CheckoutPage(this.page, this.scenarioLogs, this.locatorUsages);
    await this.checkoutPage.fillInfo(firstName, lastName, zip);
  }
);

When("I click the continue button", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  await this.checkoutPage.clickContinue();
});

When("I click the cancel button on checkout step 1", async function (this: CustomWorld) {
  this.checkoutPage = new CheckoutPage(this.page, this.scenarioLogs, this.locatorUsages);
  await this.checkoutPage.clickCancel();
});

Then("the checkout step 1 error should contain {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const actual = await this.checkoutPage.getStep1ErrorMessage();
  assert.match(
    actual,
    new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `Expected step 1 error containing "${expected}" but got "${actual}"`
  );
});

Then("I should be on the cart page", async function (this: CustomWorld) {
  await this.page.waitForURL(/\/cart\.html/);
  assert.match(this.page.url(), /\/cart\.html/, "Expected to be on the cart page");
});

// --- Step 2 steps ---

When("I click the finish button", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  await this.checkoutPage.clickFinish();
});

When("I click the cancel button on checkout step 2", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  await this.checkoutPage.clickCancel();
});

Then("the checkout step 2 should show a subtotal", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const subtotal = await this.checkoutPage.getSubtotal();
  assert.ok(subtotal.length > 0, "Expected subtotal label to be visible but got empty string");
});

Then("the checkout step 2 should show a tax amount", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const tax = await this.checkoutPage.getTax();
  assert.ok(tax.length > 0, "Expected tax label to be visible but got empty string");
});

Then("the checkout step 2 should show a total", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const total = await this.checkoutPage.getTotal();
  assert.ok(total.length > 0, "Expected total label to be visible but got empty string");
});

Then("the checkout step 2 cart item count should be {int}", async function (this: CustomWorld, expected: number) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const actual = await this.checkoutPage.getCartItemCount();
  assert.strictEqual(actual, expected, `Expected ${expected} item(s) in step 2 overview but found ${actual}`);
});

Then("the checkout total should equal subtotal plus tax", async function (this: CustomWorld) {
  assert.ok(this.checkoutPage, "CheckoutPage is not initialized");
  const parseAmount = (label: string): number => {
    const match = label.match(/\$(\d+\.\d{2})/);
    assert.ok(match, `Could not parse dollar amount from "${label}"`);
    return parseFloat(match[1]);
  };
  const subtotal = parseAmount(await this.checkoutPage.getSubtotal());
  const tax = parseAmount(await this.checkoutPage.getTax());
  const total = parseAmount(await this.checkoutPage.getTotal());
  assert.ok(
    Math.abs(subtotal + tax - total) < 0.01,
    `Expected subtotal ($${subtotal}) + tax ($${tax}) = $${(subtotal + tax).toFixed(2)} to equal total $${total}`
  );
});
