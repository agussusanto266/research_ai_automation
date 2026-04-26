import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

const BACK_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "back-to-products" },
  { name: "secondary-css", kind: "css", value: "[data-test='back-to-products']" },
  { name: "fallback-role", kind: "role", role: "button", options: { name: "Back to products" } }
];

const PRODUCT_NAME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "inventory-item-name" },
  { name: "secondary-css", kind: "css", value: "[data-test='inventory-item-name']" },
  { name: "fallback-css", kind: "css", value: ".inventory_details_name" }
];

const PRODUCT_DESC_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "inventory-item-desc" },
  { name: "secondary-css", kind: "css", value: "[data-test='inventory-item-desc']" },
  { name: "fallback-css", kind: "css", value: ".inventory_details_desc" }
];

const PRODUCT_PRICE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "inventory-item-price" },
  { name: "secondary-css", kind: "css", value: "[data-test='inventory-item-price']" },
  { name: "fallback-css", kind: "css", value: ".inventory_details_price" }
];

const ADD_TO_CART_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role", kind: "role", role: "button", options: { name: "Add to cart" } },
  { name: "fallback-css", kind: "css", value: "[data-test^='add-to-cart']" }
];

const REMOVE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role", kind: "role", role: "button", options: { name: "Remove" } },
  { name: "fallback-css", kind: "css", value: "[data-test^='remove']" }
];

export class ProductDetailPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(baseUrl: string, productId: number): Promise<void> {
    await this.page.goto(`${baseUrl}inventory-item.html?id=${productId}`, { waitUntil: "domcontentloaded" });
  }

  async getProductName(): Promise<string> {
    const el = await this.resolver.resolve("productName", PRODUCT_NAME_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getProductDescription(): Promise<string> {
    const el = await this.resolver.resolve("productDescription", PRODUCT_DESC_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getProductPrice(): Promise<string> {
    const el = await this.resolver.resolve("productPrice", PRODUCT_PRICE_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async isImageVisible(): Promise<boolean> {
    return this.page.locator(".inventory_details_img").isVisible();
  }

  async isAddToCartVisible(): Promise<boolean> {
    return this.page.locator("[data-test^='add-to-cart']").isVisible();
  }

  async isRemoveVisible(): Promise<boolean> {
    return this.page.locator("[data-test^='remove']").isVisible();
  }

  async addToCart(): Promise<void> {
    const btn = await this.resolver.resolve("addToCartButton", ADD_TO_CART_CANDIDATES);
    await btn.click();
  }

  async remove(): Promise<void> {
    const btn = await this.resolver.resolve("removeButton", REMOVE_CANDIDATES);
    await btn.click();
  }

  async clickBackToProducts(): Promise<void> {
    const btn = await this.resolver.resolve("backToProductsButton", BACK_BUTTON_CANDIDATES);
    await btn.click();
  }
}
