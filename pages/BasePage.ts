import type { Page } from "playwright";
import { SelfHealingLocatorResolver } from "../utils/selfHealingLocator";

export class BasePage {
  protected readonly page: Page;
  protected readonly resolver: SelfHealingLocatorResolver;

  constructor(page: Page, scenarioLogs: string[] = []) {
    this.page = page;
    this.resolver = new SelfHealingLocatorResolver(page, scenarioLogs);
  }
}
