import type { Page } from "playwright";
import { BasePage } from "../BasePage";
import type { LocatorUsage } from "../../utils/selfHealingLocator";

export class HomePage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
