import type { Page } from "playwright";
import type { LocatorUsage } from "../../utils/selfHealingLocator";
import { InventoryPage } from "../../pages/InventoryPage";
import { env } from "../../config/env";

/**
 * Test data factory for cart state.
 * Routes all cart setup through InventoryPage POM — no raw locators in steps.
 */
export class CartFixture {
  private readonly inventoryPage: InventoryPage;

  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    this.inventoryPage = new InventoryPage(page, scenarioLogs, locatorUsages);
  }

  async addItems(count: number): Promise<void> {
    if (count === 0) return;
    await this.inventoryPage.goto(env.baseUrl);
    for (let i = 0; i < count; i++) {
      await this.inventoryPage.addProductToCart(i + 1);
    }
  }
}
