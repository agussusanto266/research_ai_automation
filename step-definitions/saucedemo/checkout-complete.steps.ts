import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { CartPage } from "../../pages/saucedemo/CartPage";
import { CheckoutPage } from "../../pages/saucedemo/CheckoutPage";
import { CheckoutCompletePage } from "../../pages/saucedemo/CheckoutCompletePage";
import { InventoryPage } from "../../pages/saucedemo/InventoryPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I have completed the checkout process", async function (this: CustomWorld) {
  const inventory = this.getPage(InventoryPage);
  await inventory.goto(env.baseUrl);
  await inventory.addFirstProductToCart();

  const cart = this.getPage(CartPage);
  await cart.goto(env.baseUrl);
  await cart.checkout();
  await this.page.waitForURL(/checkout-step-one\.html/);

  const checkout = this.getPage(CheckoutPage);
  await checkout.fillInfo("Test", "User", "12345");
  await checkout.clickContinue();
  await this.page.waitForURL(/checkout-step-two\.html/);
  await checkout.clickFinish();
  await this.page.waitForURL(/checkout-complete\.html/);
});

When(
  "I complete the checkout flow with first name {string} last name {string} and zip {string}",
  async function (this: CustomWorld, firstName: string, lastName: string, zip: string) {
    const cart = this.getPage(CartPage);
    await cart.goto(env.baseUrl);
    await cart.checkout();
    await this.page.waitForURL(/checkout-step-one\.html/);

    const checkout = this.getPage(CheckoutPage);
    await checkout.fillInfo(firstName, lastName, zip);
    await checkout.clickContinue();
    await this.page.waitForURL(/checkout-step-two\.html/);
    await checkout.clickFinish();
    await this.page.waitForURL(/checkout-complete\.html/);
  }
);

When("I navigate to the checkout complete page", async function (this: CustomWorld) {
  await this.getPage(CheckoutCompletePage).goto(env.baseUrl);
});

When("I click back home", async function (this: CustomWorld) {
  await this.getPage(CheckoutCompletePage).clickBackHome();
});

When("I navigate back in the browser", async function (this: CustomWorld) {
  await this.page.goBack({ waitUntil: "domcontentloaded" });
});

Then("I should be on the checkout complete page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-complete\.html/);
  assert.match(
    this.page.url(),
    /checkout-complete\.html/,
    "Expected to be on the checkout complete page"
  );
});

Then(
  "the confirmation header should be {string}",
  async function (this: CustomWorld, expected: string) {
    const actual = await this.getPage(CheckoutCompletePage).getCompleteHeader();
    assert.strictEqual(
      actual,
      expected,
      `Expected confirmation header "${expected}" but got "${actual}"`
    );
  }
);

Then(
  "the confirmation text should be {string}",
  async function (this: CustomWorld, expected: string) {
    const actual = await this.getPage(CheckoutCompletePage).getCompleteText();
    assert.strictEqual(
      actual,
      expected,
      `Expected confirmation text "${expected}" but got "${actual}"`
    );
  }
);

Then("the confirmation image should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(CheckoutCompletePage).isConfirmationImageVisible();
  assert.ok(visible, "Expected confirmation image (pony express) to be visible but it was not");
});

Then("the page title should be {string}", async function (this: CustomWorld, expected: string) {
  const actual = await this.getPage(CheckoutCompletePage).getTitle();
  assert.strictEqual(actual, expected, `Expected page title "${expected}" but got "${actual}"`);
});

Then("I should be on the checkout step 2 page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-step-two\.html/);
  assert.match(
    this.page.url(),
    /checkout-step-two\.html/,
    "Expected to be on checkout step 2 page"
  );
});
