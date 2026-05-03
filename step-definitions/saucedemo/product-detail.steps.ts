import { When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { CartPage } from "../../pages/saucedemo/CartPage";
import { ProductDetailPage } from "../../pages/saucedemo/ProductDetailPage";
import { CustomWorld } from "../../support/CustomWorld";

When(
  "I navigate to the product detail page for item {int}",
  async function (this: CustomWorld, id: number) {
    await this.getPage(ProductDetailPage).gotoProduct(env.baseUrl, id);
  }
);

When("I add the product to cart from the detail page", async function (this: CustomWorld) {
  await this.getPage(ProductDetailPage).addToCart();
});

When("I remove the product from the detail page", async function (this: CustomWorld) {
  await this.getPage(ProductDetailPage).remove();
});

When("I click Back to Products", async function (this: CustomWorld) {
  await this.getPage(ProductDetailPage).clickBackToProducts();
});

When("I navigate to the cart by clicking the cart icon", async function (this: CustomWorld) {
  await this.page.locator('[data-test="shopping-cart-link"]').click();
  await this.page.waitForURL(/cart\.html/);
  // Pre-warm CartPage in factory cache for subsequent assertions
  this.getPage(CartPage);
});

When("I click the first product name on the inventory", async function (this: CustomWorld) {
  await this.page.locator('[data-test="inventory-item-name"]').first().click();
});

When("I click the first product image on the inventory", async function (this: CustomWorld) {
  await this.page.locator(".inventory_item_img").first().click();
});

Then("the product name should not be empty", async function (this: CustomWorld) {
  const name = await this.getPage(ProductDetailPage).getProductName();
  assert.ok(name.length > 0, "Expected product name to be non-empty but got empty string");
});

Then("the product description should not be empty", async function (this: CustomWorld) {
  const desc = await this.getPage(ProductDetailPage).getProductDescription();
  assert.ok(desc.length > 0, "Expected product description to be non-empty but got empty string");
});

Then("the product price should not be empty", async function (this: CustomWorld) {
  const price = await this.getPage(ProductDetailPage).getProductPrice();
  assert.ok(price.length > 0, "Expected product price to be non-empty but got empty string");
});

Then("the product image should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(ProductDetailPage).isImageVisible();
  assert.ok(visible, "Expected product image to be visible but it was not");
});

Then("the add to cart button should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(ProductDetailPage).isAddToCartVisible();
  assert.ok(visible, "Expected Add to Cart button to be visible but it was not");
});

Then("the add to cart button should not be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(ProductDetailPage).isAddToCartVisible();
  assert.ok(!visible, "Expected Add to Cart button to be hidden but it was visible");
});

Then("the remove button should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(ProductDetailPage).isRemoveVisible();
  assert.ok(visible, "Expected Remove button to be visible but it was not");
});

Then("the remove button should not be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(ProductDetailPage).isRemoveVisible();
  assert.ok(!visible, "Expected Remove button to be hidden but it was visible");
});
