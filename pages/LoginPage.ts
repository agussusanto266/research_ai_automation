import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";
import assert from "node:assert";

const USERNAME_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "username" },
  { name: "secondary-id", kind: "id", value: "user-name" },
  { name: "fallback-css", kind: "css", value: "input[name='user-name']" }
];

const PASSWORD_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "password" },
  { name: "secondary-id", kind: "id", value: "password" },
  { name: "fallback-css", kind: "css", value: "input[name='password']" }
];

const LOGIN_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "login-button" },
  { name: "secondary-role", kind: "role", role: "button", options: { name: "Login" } },
  { name: "fallback-css", kind: "css", value: "input[type='submit']" }
];

const ERROR_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "error" },
  { name: "secondary-css", kind: "css", value: "[data-test='error']" },
  { name: "fallback-role", kind: "role", role: "heading" }
];

export class LoginPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await this.page.waitForURL(/saucedemo\.com/);
  }

  async login(username: string, password: string): Promise<void> {
    const usernameField = await this.resolver.resolve("usernameInput", USERNAME_CANDIDATES);
    const passwordField = await this.resolver.resolve("passwordInput", PASSWORD_CANDIDATES);
    const loginButton = await this.resolver.resolve("loginButton", LOGIN_BUTTON_CANDIDATES);

    await usernameField.fill(username);
    await passwordField.fill(password);
    await loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = await this.resolver.resolve("loginErrorMessage", ERROR_CANDIDATES);
    const message = (await errorElement.textContent())?.trim() ?? "";
    assert.ok(message.length > 0, "Expected an error message but received empty text");
    return message;
  }

  async isLoginSuccessful(): Promise<boolean> {
    await this.page.waitForLoadState("domcontentloaded");
    return /inventory\.html/.test(this.page.url());
  }
}
