import { When, Then, Given } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { InventoryPage } from "../../pages/InventoryPage";
import type { SortOption } from "../../pages/InventoryPage";
import { CustomWorld } from "../../support/CustomWorld";

When("I navigate to the inventory page", async function (this: CustomWorld) {
  this.inventoryPage = new InventoryPage(this.page, this.scenarioLogs, this.locatorUsages);
  await this.inventoryPage.goto(env.baseUrl);
});

Given("I navigate directly to the inventory URL", async function (this: CustomWorld) {
  await this.page.goto(`${env.baseUrl}inventory.html`, { waitUntil: "domcontentloaded" });
});

When("I sort products by {string}", async function (this: CustomWorld, option: string) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  await this.inventoryPage.sortBy(option as SortOption);
});

Then("the inventory should contain {int} products", async function (this: CustomWorld, expected: number) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const actual = await this.inventoryPage.getProductCount();
  assert.strictEqual(actual, expected, `Expected ${expected} products but found ${actual}`);
});

Then("the first product name should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const names = await this.inventoryPage.getProductNames();
  assert.ok(names.length > 0, "Expected at least one product name but got none");
  assert.strictEqual(names[0], expected, `Expected first product "${expected}" but got "${names[0]}"`);
});

Then("the first product name should start with {string}", async function (this: CustomWorld, prefix: string) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const names = await this.inventoryPage.getProductNames();
  assert.ok(names.length > 0, "Expected at least one product name but got none");
  assert.ok(
    names[0].startsWith(prefix),
    `Expected first product to start with "${prefix}" but got "${names[0]}"`
  );
});

Then("the first product price should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const prices = await this.inventoryPage.getProductPrices();
  assert.ok(prices.length > 0, "Expected at least one product price but got none");
  assert.strictEqual(prices[0], expected, `Expected first price "${expected}" but got "${prices[0]}"`);
});

Then("the first product should have a visible image", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const visible = await this.inventoryPage.isProductImageVisibleAt(0);
  assert.ok(visible, "Expected first product image to be visible but it was not");
});

Then("the first product should have an add-to-cart button", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const visible = await this.inventoryPage.hasAddToCartButtonAt(0);
  assert.ok(visible, "Expected first product to have an Add to Cart button but it was not visible");
});

Then("the inventory page title should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const title = await this.inventoryPage.getTitle();
  assert.strictEqual(title, expected, `Expected page title "${expected}" but got "${title}"`);
});

Then("the product names should be sorted A to Z", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const names = await this.inventoryPage.getProductNames();
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepStrictEqual(names, sorted, `Expected A→Z order but got: ${names.join(", ")}`);
});

Then("the product names should be sorted Z to A", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const names = await this.inventoryPage.getProductNames();
  const sorted = [...names].sort((a, b) => b.localeCompare(a));
  assert.deepStrictEqual(names, sorted, `Expected Z→A order but got: ${names.join(", ")}`);
});

Then("the product prices should be sorted low to high", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const prices = await this.inventoryPage.getProductPrices();
  const parsed = prices.map((p) => parseFloat(p.replace("$", "")));
  const sorted = [...parsed].sort((a, b) => a - b);
  assert.deepStrictEqual(parsed, sorted, `Expected low→high price order but got: ${prices.join(", ")}`);
});

Then("the product prices should be sorted high to low", async function (this: CustomWorld) {
  assert.ok(this.inventoryPage, "InventoryPage is not initialized");
  const prices = await this.inventoryPage.getProductPrices();
  const parsed = prices.map((p) => parseFloat(p.replace("$", "")));
  const sorted = [...parsed].sort((a, b) => b - a);
  assert.deepStrictEqual(parsed, sorted, `Expected high→low price order but got: ${prices.join(", ")}`);
});
