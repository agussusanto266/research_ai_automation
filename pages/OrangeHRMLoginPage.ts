import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate, LocatorUsage } from "../utils/selfHealingLocator";

const USERNAME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",     kind: "css",   value: "input[name='username']" },
  { name: "secondary-label", kind: "label", value: "Username" },
  { name: "fallback-xpath",  kind: "xpath", value: "//input[@name='username']" }
];

const PASSWORD_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",     kind: "css",   value: "input[name='password']" },
  { name: "secondary-label", kind: "label", value: "Password" },
  { name: "fallback-xpath",  kind: "xpath", value: "//input[@name='password']" }
];

const LOGIN_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",     kind: "css",   value: "button[type='submit']" },
  { name: "secondary-role",  kind: "role",  role: "button", options: { name: "Login" } },
  { name: "fallback-xpath",  kind: "xpath", value: "//button[@type='submit']" }
];

const INLINE_ERROR_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",     kind: "css",   value: ".oxd-input-field-error-message" },
  { name: "secondary-css",   kind: "css",   value: "span.oxd-text--span" },
  { name: "fallback-xpath",  kind: "xpath", value: "//*[contains(@class,'error-message')]" }
];

const ALERT_ERROR_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",     kind: "css",   value: ".oxd-alert-content-text" },
  { name: "secondary-css",   kind: "css",   value: "p.oxd-text--toast-message" },
  { name: "fallback-xpath",  kind: "xpath", value: "//*[contains(@class,'oxd-alert')]//p" }
];

const FORGOT_PASSWORD_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role",    kind: "role",  role: "link", options: { name: /forgot/i } },
  { name: "secondary-css",   kind: "css",   value: "p.orangehrm-login-forgot-header" },
  { name: "fallback-xpath",  kind: "xpath", value: "//p[contains(text(),'Forgot')]" }
];

export class OrangeHRMLoginPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/web/index.php/auth/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await this.page.waitForURL(/auth\/login/, { timeout: 30000 });
    await this.page.locator("input[name='username']").waitFor({ state: "visible", timeout: 30000 });
  }

  async signIn(username: string, password: string): Promise<void> {
    const usernameField = await this.resolver.resolve("usernameInput", USERNAME_CANDIDATES);
    const passwordField = await this.resolver.resolve("passwordInput", PASSWORD_CANDIDATES);
    const loginButton   = await this.resolver.resolve("loginButton",   LOGIN_BUTTON_CANDIDATES);

    await usernameField.fill(username);
    await passwordField.fill(password);
    await loginButton.click();
  }

  async isLoginSuccessful(timeout = 45000): Promise<boolean> {
    try {
      await this.page.waitForURL(/dashboard\/index/, { timeout });
      return true;
    } catch {
      return /dashboard\/index/.test(this.page.url());
    }
  }

  async getAnyErrorText(): Promise<string> {
    // Try alert-level error first (e.g. "Invalid credentials"), then inline (e.g. "Required")
    try {
      const alert = await this.resolver.resolve("alertError", ALERT_ERROR_CANDIDATES);
      const text = (await alert.textContent())?.trim() ?? "";
      if (text.length > 0) return text;
    } catch {
      // no alert-level error — fall through to inline
    }
    const inline = await this.resolver.resolve("inlineError", INLINE_ERROR_CANDIDATES);
    return (await inline.textContent())?.trim() ?? "";
  }

  async isFormVisible(): Promise<boolean> {
    const usernameField = await this.resolver.resolve("usernameInput", USERNAME_CANDIDATES);
    return usernameField.isVisible();
  }

  async clickForgotPassword(): Promise<void> {
    const link = await this.resolver.resolve("forgotPasswordLink", FORGOT_PASSWORD_CANDIDATES);
    await link.click();
  }

  async navigateToDashboard(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/web/index.php/dashboard/index`, { waitUntil: "domcontentloaded" });
  }
}
