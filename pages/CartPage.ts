import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate, LocatorUsage } from "../utils/selfHealingLocator";

const CART_TITLE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "title" },
  { name: "secondary-role", kind: "role", role: "heading", options: { name: "Your Cart" } },
  { name: "fallback-css", kind: "css", value: ".title" }
];

const CART_BADGE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "shopping-cart-badge" },
  { name: "fallback-css", kind: "css", value: ".shopping_cart_badge" }
];

const CONTINUE_SHOPPING_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "continue-shopping" },
  { name: "secondary-role", kind: "role", role: "button", options: { name: "Continue Shopping" } },
  { name: "fallback-css", kind: "css", value: "[data-test='continue-shopping']" }
];

const CHECKOUT_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "checkout" },
  { name: "secondary-role", kind: "role", role: "button", options: { name: "Checkout" } },
  { name: "fallback-css", kind: "css", value: "[data-test='checkout']" }
];

const CART_ITEM_CSS = ".cart_item";
const ITEM_NAME_CSS = '[data-test="inventory-item-name"]';
const ITEM_PRICE_CSS = '[data-test="inventory-item-price"]';

export class CartPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  async goto(baseUrl: string): Promise<void> {
    const cartLink = this.page.locator('[data-test="shopping-cart-link"]');
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await this.page.waitForURL(/\/cart\.html/);
      await this.page.locator('[data-test="title"]').waitFor({ state: "visible" });
    } else {
      await this.page.goto(`${baseUrl}cart.html`, { waitUntil: "domcontentloaded" });
    }
  }

  async getTitle(): Promise<string> {
    const title = await this.resolver.resolve("cartTitle", CART_TITLE_CANDIDATES);
    return (await title.textContent())?.trim() ?? "";
  }

  async getItemCount(): Promise<number> {
    return this.page.locator('.cart_item').count();
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.getItemCount()) === 0;
  }

  async isBadgeVisible(): Promise<boolean> {
    return this.page.locator('[data-test="shopping-cart-badge"]').isVisible();
  }

  async getBadgeCount(): Promise<string> {
    const visible = await this.isBadgeVisible();
    if (!visible) return "0";
    const badge = await this.resolver.resolve("cartBadge", CART_BADGE_CANDIDATES);
    return (await badge.textContent())?.trim() ?? "0";
  }

  async getItemNameAt(index: number): Promise<string> {
    const item = this.page.locator(CART_ITEM_CSS).nth(index);
    return (await item.locator(ITEM_NAME_CSS).textContent())?.trim() ?? "";
  }

  async getItemPriceAt(index: number): Promise<string> {
    const item = this.page.locator(CART_ITEM_CSS).nth(index);
    return (await item.locator(ITEM_PRICE_CSS).textContent())?.trim() ?? "";
  }

  async removeItemAt(index: number): Promise<void> {
    const item = this.page.locator(CART_ITEM_CSS).nth(index);
    await item.getByRole("button", { name: "Remove" }).click();
  }

  async clickProductNameAt(index: number): Promise<void> {
    const item = this.page.locator(CART_ITEM_CSS).nth(index);
    await item.locator(ITEM_NAME_CSS).click();
  }

  async hasRemoveButtonAt(index: number): Promise<boolean> {
    const item = this.page.locator(CART_ITEM_CSS).nth(index);
    return item.getByRole("button", { name: "Remove" }).isVisible();
  }

  async continueShopping(): Promise<void> {
    const btn = await this.resolver.resolve("continueShoppingButton", CONTINUE_SHOPPING_CANDIDATES);
    await btn.click();
  }

  async checkout(): Promise<void> {
    const btn = await this.resolver.resolve("checkoutButton", CHECKOUT_BUTTON_CANDIDATES);
    await btn.click();
  }
}
