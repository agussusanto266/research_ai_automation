import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../config/env";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";
import { CustomWorld } from "../support/CustomWorld";

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

Given(/I have (\d+) items? in the cart/, async function (this: CustomWorld, count: number) {
  if (count === 0) return;
  await this.page.goto(`${env.baseUrl}/inventory.html`, { waitUntil: "domcontentloaded" });
  const addButtons = this.page.locator('[data-test^="add-to-cart"]');
  for (let i = 0; i < count; i++) {
    await addButtons.nth(i).click();
  }
});

When("I navigate to the cart page", async function (this: CustomWorld) {
  this.cartPage = new CartPage(this.page, this.scenarioLogs);
  await this.cartPage.goto(env.baseUrl);
});

When(/I remove the item at position (\d+)/, async function (this: CustomWorld, position: number) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  await this.cartPage.removeItemAt(position - 1);
});

When("I click continue shopping", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  await this.cartPage.continueShopping();
});

When("I click checkout", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  await this.cartPage.checkout();
});

When("I click the first product name in the cart", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  await this.cartPage.clickProductNameAt(0);
});

When("I refresh the page", async function (this: CustomWorld) {
  await this.page.reload({ waitUntil: "domcontentloaded" });
});

Then(/the cart should contain (\d+) items?/, async function (this: CustomWorld, expected: number) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  const actual = await this.cartPage.getItemCount();
  assert.strictEqual(actual, expected, `Expected ${expected} cart items but found ${actual}`);
});

Then("the cart should be empty", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  const empty = await this.cartPage.isCartEmpty();
  assert.ok(empty, "Expected cart to be empty but it contains items");
});

Then("the cart badge should show {string}", async function (this: CustomWorld, expected: string) {
  const badge = this.page.locator('[data-test="shopping-cart-badge"]');
  await badge.waitFor({ state: "visible" });
  const actual = (await badge.textContent())?.trim();
  assert.strictEqual(actual, expected, `Expected cart badge "${expected}" but got "${actual}"`);
});

Then("the cart badge should not be visible", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  const visible = await this.cartPage.isBadgeVisible();
  assert.ok(!visible, "Expected cart badge to be hidden but it is visible");
});

Then("the cart badge count should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  if (expected === "hidden") {
    const visible = await this.cartPage.isBadgeVisible();
    assert.ok(!visible, "Expected cart badge to be hidden but it is visible");
    return;
  }
  const actual = await this.cartPage.getBadgeCount();
  assert.strictEqual(actual, expected, `Expected badge count "${expected}" but got "${actual}"`);
});

Then("the cart should display item name price and remove button", async function (this: CustomWorld) {
  assert.ok(this.cartPage, "CartPage is not initialized");
  const name = await this.cartPage.getItemNameAt(0);
  const price = await this.cartPage.getItemPriceAt(0);
  assert.ok(name.length > 0, "Expected item name to be visible but got empty string");
  assert.ok(price.length > 0, "Expected item price to be visible but got empty string");
  const item = this.page.locator('[data-test="cart-item"]').first();
  const removeBtn = item.getByRole("button", { name: "Remove" });
  assert.ok(await removeBtn.isVisible(), "Expected Remove button to be visible");
});

Then("I should be on the inventory page", async function (this: CustomWorld) {
  await this.page.waitForURL(/inventory\.html/);
  assert.match(this.page.url(), /inventory\.html/, "Expected to be on the inventory page");
});

Then("I should be on the checkout page", async function (this: CustomWorld) {
  await this.page.waitForURL(/checkout-step-one\.html/);
  assert.match(this.page.url(), /checkout-step-one\.html/, "Expected to be on checkout step 1 page");
});

Then("I should be on the login page", async function (this: CustomWorld) {
  await this.page.waitForURL(/saucedemo\.com\/?(\?.*)?$/);
  assert.match(this.page.url(), /saucedemo\.com\/?(\?.*)?$/, "Expected to be redirected to login page");
});

Then("I should be on the product detail page", async function (this: CustomWorld) {
  await this.page.waitForURL(/inventory-item\.html/);
  assert.match(this.page.url(), /inventory-item\.html/, "Expected to be on product detail page");
});
