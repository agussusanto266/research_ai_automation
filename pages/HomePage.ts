import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
