import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate, LocatorUsage } from "../utils/selfHealingLocator";

const SORT_DROPDOWN_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "product-sort-container" },
  { name: "fallback-css",   kind: "css",    value: "[data-test='product-sort-container']" }
];

const PAGE_TITLE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "title" },
  { name: "secondary-role", kind: "role",   role: "heading", options: { name: "Products" } },
  { name: "fallback-css",   kind: "css",    value: ".title" }
];

export type SortOption = "az" | "za" | "lohi" | "hilo";

export class InventoryPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}inventory.html`, { waitUntil: "domcontentloaded" });
    await this.page.waitForURL(/inventory\.html/);
  }

  async getTitle(): Promise<string> {
    const el = await this.resolver.resolve("inventoryTitle", PAGE_TITLE_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getProductCount(): Promise<number> {
    return this.page.locator(".inventory_item").count();
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getProductPrices(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-price"]').allTextContents();
  }

  async sortBy(option: SortOption): Promise<void> {
    const dropdown = await this.resolver.resolve("sortDropdown", SORT_DROPDOWN_CANDIDATES);
    await dropdown.selectOption(option);
  }

  async addFirstProductToCart(): Promise<void> {
    await this.page.locator('[data-test^="add-to-cart"]').first().click();
    await this.page.locator('[data-test="shopping-cart-badge"]').waitFor({ state: "visible" });
  }

  // Use when adding multiple products sequentially; waits for badge to reach expectedCount.
  async addProductToCart(expectedCount: number): Promise<void> {
    await this.page.locator('[data-test^="add-to-cart"]').first().click();
    await this.page.locator('[data-test="shopping-cart-badge"]')
      .filter({ hasText: String(expectedCount) })
      .waitFor({ state: "visible" });
  }

  async isProductImageVisibleAt(index: number): Promise<boolean> {
    return this.page.locator(".inventory_item_img img").nth(index).isVisible();
  }

  async hasAddToCartButtonAt(index: number): Promise<boolean> {
    return this.page.locator('[data-test^="add-to-cart"]').nth(index).isVisible();
  }
}
