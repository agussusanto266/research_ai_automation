import type { Page } from "playwright";
import { SelfHealingLocatorResolver } from "../utils/selfHealingLocator";
import type { LocatorUsage } from "../utils/selfHealingLocator";

export class BasePage {
  protected readonly page: Page;
  protected readonly resolver: SelfHealingLocatorResolver;

  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    this.page = page;
    this.resolver = new SelfHealingLocatorResolver(page, scenarioLogs, locatorUsages);
  }
}
