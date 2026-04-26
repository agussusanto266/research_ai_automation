import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

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

export class CartPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/cart.html`, { waitUntil: "domcontentloaded" });
  }

  async getTitle(): Promise<string> {
    const title = await this.resolver.resolve("cartTitle", CART_TITLE_CANDIDATES);
    return (await title.textContent())?.trim() ?? "";
  }

  async getItemCount(): Promise<number> {
    return this.page.locator('[data-test="cart-item"]').count();
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
    const item = this.page.locator('[data-test="cart-item"]').nth(index);
    return (await item.locator('[data-test="inventory-item-name"]').textContent())?.trim() ?? "";
  }

  async getItemPriceAt(index: number): Promise<string> {
    const item = this.page.locator('[data-test="cart-item"]').nth(index);
    return (await item.locator('[data-test="inventory-item-price"]').textContent())?.trim() ?? "";
  }

  async removeItemAt(index: number): Promise<void> {
    const item = this.page.locator('[data-test="cart-item"]').nth(index);
    await item.getByRole("button", { name: "Remove" }).click();
  }

  async clickProductNameAt(index: number): Promise<void> {
    const item = this.page.locator('[data-test="cart-item"]').nth(index);
    await item.locator('[data-test="inventory-item-name"]').click();
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
