import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

const NEW_TODO_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",    kind: "css",   value: ".new-todo" },
  { name: "secondary-role", kind: "role",  role: "textbox", options: { name: /new todo|what needs/i } },
  { name: "fallback-xpath", kind: "xpath", value: "//input[contains(@class,'new-todo')]" }
];

const FOOTER_COUNT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",    kind: "css",   value: ".todo-count" },
  { name: "fallback-xpath", kind: "xpath", value: "//*[contains(@class,'todo-count')]" }
];

const CLEAR_COMPLETED_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css",    kind: "css",   value: ".clear-completed" },
  { name: "secondary-role", kind: "role",  role: "button", options: { name: /clear completed/i } },
  { name: "fallback-xpath", kind: "xpath", value: "//button[contains(@class,'clear-completed')]" }
];

export class TodoPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await this.page.locator(".new-todo").waitFor({ state: "visible" });
  }

  async addTodo(text: string): Promise<void> {
    const input = this.page.locator(".new-todo");
    await input.click();
    // pressSequentially fires real keydown/keypress/keyup events (unlike keyboard.type
    // which uses CDP insertText). The 80ms delay after each character gives React 18
    // time to flush its concurrent state update before Enter fires.
    if (text.length > 0) {
      await input.pressSequentially(text, { delay: 80 });
    }
    await input.press("Enter");
  }

  async getTodoItemCount(): Promise<number> {
    return this.page.locator(".todo-list li").count();
  }

  async getTodoItemTexts(): Promise<string[]> {
    const labels = this.page.locator(".todo-list li label");
    const count = await labels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await labels.nth(i).textContent())?.trim() ?? "");
    }
    return texts;
  }

  async isTodoVisible(text: string): Promise<boolean> {
    const labels = this.page.locator(".todo-list li label");
    const count = await labels.count();
    for (let i = 0; i < count; i++) {
      const labelText = (await labels.nth(i).innerText()).trim();
      if (labelText === text) return true;
    }
    return false;
  }

  async completeTodo(text: string): Promise<void> {
    const row = this.page.locator(".todo-list li").filter({ hasText: text });
    await row.locator(".toggle").click();
  }

  async uncompleteTodo(text: string): Promise<void> {
    const row = this.page.locator(".todo-list li.completed").filter({ hasText: text });
    await row.locator(".toggle").click();
  }

  async isTodoCompleted(text: string): Promise<boolean> {
    const completedRow = this.page.locator(".todo-list li.completed").filter({ hasText: text });
    return completedRow.isVisible();
  }

  async deleteTodo(text: string): Promise<void> {
    const row = this.page.locator(".todo-list li").filter({ hasText: text });
    await row.hover();
    await row.locator("button.destroy").click();
  }

  async getFooterText(): Promise<string> {
    const footer = await this.resolver.resolve("todoCount", FOOTER_COUNT_CANDIDATES);
    return (await footer.textContent())?.trim() ?? "";
  }

  async isFooterVisible(): Promise<boolean> {
    return this.page.locator("footer.footer").isVisible();
  }

  async clickFilter(filter: "All" | "Active" | "Completed"): Promise<void> {
    const hrefMap: Record<string, string> = {
      All: "a[href='#/']",
      Active: "a[href='#/active']",
      Completed: "a[href='#/completed']",
    };
    await this.page.locator(hrefMap[filter]).click();
  }

  async clearCompleted(): Promise<void> {
    const btn = await this.resolver.resolve("clearCompleted", CLEAR_COMPLETED_CANDIDATES);
    await btn.click();
  }

  async getActiveTodoTexts(): Promise<string[]> {
    const labels = this.page.locator(".todo-list li:not(.completed) label");
    const count = await labels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await labels.nth(i).textContent())?.trim() ?? "");
    }
    return texts;
  }

  async getCompletedTodoTexts(): Promise<string[]> {
    const labels = this.page.locator(".todo-list li.completed label");
    const count = await labels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await labels.nth(i).textContent())?.trim() ?? "");
    }
    return texts;
  }
}
