import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

const PAGE_TITLE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "title" },
  { name: "secondary-role", kind: "role", role: "heading", options: { name: "Checkout: Complete!" } },
  { name: "fallback-css", kind: "css", value: ".title" }
];

const COMPLETE_HEADER_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "complete-header" },
  { name: "secondary-css", kind: "css", value: ".complete-header" },
  { name: "fallback-role", kind: "role", role: "heading", options: { name: "Thank you for your order!" } }
];

const COMPLETE_TEXT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "complete-text" },
  { name: "fallback-css", kind: "css", value: ".complete-text" }
];

const PONY_IMAGE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "pony-express" },
  { name: "secondary-role", kind: "role", role: "img", options: { name: "Pony Express" } },
  { name: "fallback-css", kind: "css", value: "[data-test='checkout-complete-container'] img" }
];

const BACK_HOME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "back-to-products" },
  { name: "secondary-role", kind: "role", role: "button", options: { name: "Back Home" } },
  { name: "fallback-css", kind: "css", value: "#back-to-products" }
];

export class CheckoutCompletePage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}checkout-complete.html`, { waitUntil: "domcontentloaded" });
  }

  async getTitle(): Promise<string> {
    const el = await this.resolver.resolve("pageTitle", PAGE_TITLE_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getCompleteHeader(): Promise<string> {
    const el = await this.resolver.resolve("completeHeader", COMPLETE_HEADER_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getCompleteText(): Promise<string> {
    const el = await this.resolver.resolve("completeText", COMPLETE_TEXT_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async isConfirmationImageVisible(): Promise<boolean> {
    const el = await this.resolver.resolve("ponyImage", PONY_IMAGE_CANDIDATES);
    return el.isVisible();
  }

  async clickBackHome(): Promise<void> {
    const btn = await this.resolver.resolve("backHomeButton", BACK_HOME_CANDIDATES);
    await btn.click();
  }

  async isBadgeVisible(): Promise<boolean> {
    return this.page.locator('[data-test="shopping-cart-badge"]').isVisible();
  }
}
