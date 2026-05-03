import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { CartPage } from "../../pages/saucedemo/CartPage";
import { CartFixture } from "../../support/fixtures/CartFixture";
import { CustomWorld } from "../../support/CustomWorld";

Given("I have {int} items in the cart", async function (this: CustomWorld, count: number) {
  const fixture = new CartFixture(this.page, this.scenarioLogs, this.locatorUsages);
  await fixture.addItems(count);
});

When("I navigate to the cart page", async function (this: CustomWorld) {
  await this.getPage(CartPage).goto(env.baseUrl);
});

When("I remove the item at position {int}", async function (this: CustomWorld, position: number) {
  await this.getPage(CartPage).removeItemAt(position - 1);
});

When("I click continue shopping", async function (this: CustomWorld) {
  await this.getPage(CartPage).continueShopping();
});

When("I click checkout", async function (this: CustomWorld) {
  await this.getPage(CartPage).checkout();
});

When("I click the first product name in the cart", async function (this: CustomWorld) {
  await this.getPage(CartPage).clickProductNameAt(0);
});

When("I refresh the page", async function (this: CustomWorld) {
  await this.page.reload({ waitUntil: "domcontentloaded" });
});

Then("the cart should contain {int} items", async function (this: CustomWorld, expected: number) {
  const actual = await this.getPage(CartPage).getItemCount();
  assert.strictEqual(actual, expected, `Expected ${expected} cart items but found ${actual}`);
});

Then("the cart should be empty", async function (this: CustomWorld) {
  const empty = await this.getPage(CartPage).isCartEmpty();
  assert.ok(empty, "Expected cart to be empty but it contains items");
});

Then("the cart badge should show {string}", async function (this: CustomWorld, expected: string) {
  const actual = await this.getPage(CartPage).getBadgeCount();
  assert.strictEqual(actual, expected, `Expected cart badge "${expected}" but got "${actual}"`);
});

Then("the cart badge should not be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(CartPage).isBadgeVisible();
  assert.ok(!visible, "Expected cart badge to be hidden but it is visible");
});

Then(
  "the cart badge count should be {string}",
  async function (this: CustomWorld, expected: string) {
    if (expected === "hidden") {
      const visible = await this.getPage(CartPage).isBadgeVisible();
      assert.ok(!visible, "Expected cart badge to be hidden but it is visible");
      return;
    }
    const actual = await this.getPage(CartPage).getBadgeCount();
    assert.strictEqual(actual, expected, `Expected badge count "${expected}" but got "${actual}"`);
  }
);

Then(
  "the cart should display item name price and remove button",
  async function (this: CustomWorld) {
    const cart = this.getPage(CartPage);
    const name = await cart.getItemNameAt(0);
    const price = await cart.getItemPriceAt(0);
    assert.ok(name.length > 0, "Expected item name to be visible but got empty string");
    assert.ok(price.length > 0, "Expected item price to be visible but got empty string");
    const hasRemove = await cart.hasRemoveButtonAt(0);
    assert.ok(hasRemove, "Expected Remove button to be visible");
  }
);

Then("I should be on the inventory page", async function (this: CustomWorld) {
  await this.page.waitForURL(/inventory\.html/);
  assert.match(this.page.url(), /inventory\.html/, "Expected to be on the inventory page");
});

Then("I should be on the checkout page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-step-one\.html/);
  assert.match(
    this.page.url(),
    /checkout-step-one\.html/,
    "Expected to be on checkout step 1 page"
  );
});

Then("I should be on the login page", async function (this: CustomWorld) {
  await this.page.waitForURL(/saucedemo\.com\/?(\?.*)?$/);
  assert.match(
    this.page.url(),
    /saucedemo\.com\/?(\?.*)?$/,
    "Expected to be redirected to login page"
  );
});

Then("I should be on the product detail page", async function (this: CustomWorld) {
  await this.page.waitForURL(/inventory-item\.html/);
  assert.match(this.page.url(), /inventory-item\.html/, "Expected to be on product detail page");
});
