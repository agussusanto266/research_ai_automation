import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
