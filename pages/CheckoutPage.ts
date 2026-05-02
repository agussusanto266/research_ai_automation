import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate, LocatorUsage } from "../utils/selfHealingLocator";

const FIRST_NAME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "firstName" },
  { name: "fallback-css",   kind: "css",    value: "[data-test='firstName']" }
];

const LAST_NAME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "lastName" },
  { name: "fallback-css",   kind: "css",    value: "[data-test='lastName']" }
];

const ZIP_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "postalCode" },
  { name: "fallback-css",   kind: "css",    value: "[data-test='postalCode']" }
];

const CONTINUE_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "continue" },
  { name: "secondary-role", kind: "role",   role: "button", options: { name: "Continue" } },
  { name: "fallback-css",   kind: "css",    value: "[data-test='continue']" }
];

const CANCEL_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "cancel" },
  { name: "secondary-role", kind: "role",   role: "button", options: { name: "Cancel" } },
  { name: "fallback-css",   kind: "css",    value: "[data-test='cancel']" }
];

const STEP1_ERROR_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid",   kind: "testId", value: "error" },
  { name: "secondary-css",    kind: "css",    value: "[data-test='error']" },
  { name: "fallback-role",    kind: "role",   role: "heading" }
];

const FINISH_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "finish" },
  { name: "secondary-role", kind: "role",   role: "button", options: { name: "Finish" } },
  { name: "fallback-css",   kind: "css",    value: "[data-test='finish']" }
];

const SUBTOTAL_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "subtotal-label" },
  { name: "fallback-css",   kind: "css",    value: ".summary_subtotal_label" }
];

const TAX_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "tax-label" },
  { name: "fallback-css",   kind: "css",    value: ".summary_tax_label" }
];

const TOTAL_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "total-label" },
  { name: "fallback-css",   kind: "css",    value: ".summary_total_label" }
];

export class CheckoutPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  async gotoStep1(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}checkout-step-one.html`, { waitUntil: "domcontentloaded" });
    await this.page.waitForURL(/checkout-step-one\.html/);
  }

  async gotoStep2(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}checkout-step-two.html`, { waitUntil: "domcontentloaded" });
    await this.page.waitForURL(/checkout-step-two\.html/);
  }

  async fillInfo(firstName: string, lastName: string, zip: string): Promise<void> {
    const fn = await this.resolver.resolve("firstNameInput", FIRST_NAME_CANDIDATES);
    const ln = await this.resolver.resolve("lastNameInput", LAST_NAME_CANDIDATES);
    const zp = await this.resolver.resolve("postalCodeInput", ZIP_CANDIDATES);
    await fn.fill(firstName);
    await ln.fill(lastName);
    await zp.fill(zip);
  }

  async clickContinue(): Promise<void> {
    const btn = await this.resolver.resolve("continueButton", CONTINUE_CANDIDATES);
    await btn.click();
  }

  async clickCancel(): Promise<void> {
    const btn = await this.resolver.resolve("cancelButton", CANCEL_CANDIDATES);
    await btn.click();
  }

  async getStep1ErrorMessage(): Promise<string> {
    const el = await this.resolver.resolve("step1Error", STEP1_ERROR_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async clickFinish(): Promise<void> {
    const btn = await this.resolver.resolve("finishButton", FINISH_CANDIDATES);
    await btn.click();
  }

  async getSubtotal(): Promise<string> {
    const el = await this.resolver.resolve("subtotalLabel", SUBTOTAL_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getTax(): Promise<string> {
    const el = await this.resolver.resolve("taxLabel", TAX_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getTotal(): Promise<string> {
    const el = await this.resolver.resolve("totalLabel", TOTAL_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getCartItemCount(): Promise<number> {
    return this.page.locator(".cart_item").count();
  }
}
