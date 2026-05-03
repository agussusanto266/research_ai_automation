import type { Page } from "playwright";
import { BasePage } from "../BasePage";
import type { LocatorCandidate, LocatorUsage } from "../../utils/selfHealingLocator";

const PAGE_HEADING_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css", kind: "css", value: ".oxd-topbar-header-breadcrumb h6" },
  { name: "secondary-css", kind: "css", value: ".oxd-topbar-header--title" },
  { name: "fallback-xpath", kind: "xpath", value: "//h6[contains(@class,'oxd-topbar-header')]" },
];

const EMPLOYEE_ID_INPUT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-label", kind: "label", value: "Employee Id" },
  {
    name: "secondary-xpath",
    kind: "xpath",
    value: "//label[text()='Employee Id']/following::input[1]",
  },
  { name: "fallback-css", kind: "css", value: ".oxd-table-filter-area input:nth-child(4)" },
];

const SEARCH_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role", kind: "role", role: "button", options: { name: "Search" } },
  { name: "secondary-css", kind: "css", value: "button[type='submit'].oxd-button--secondary" },
  { name: "fallback-xpath", kind: "xpath", value: "//button[normalize-space()='Search']" },
];

const RESET_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role", kind: "role", role: "button", options: { name: "Reset" } },
  { name: "secondary-css", kind: "css", value: "button[type='reset']" },
  { name: "fallback-xpath", kind: "xpath", value: "//button[normalize-space()='Reset']" },
];

const ADD_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-role", kind: "role", role: "button", options: { name: "Add" } },
  { name: "secondary-css", kind: "css", value: "button.oxd-button--secondary:has(.bi-plus)" },
  {
    name: "fallback-xpath",
    kind: "xpath",
    value: "//button[contains(@class,'oxd-button')][normalize-space()='Add']",
  },
];

const TABLE_BODY_ROW_CSS = ".oxd-table-body .oxd-table-row";
const NO_RECORDS_TEXT = "No Records Found";

export class OrangeHRMEmployeePage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  override async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/web/index.php/pim/viewEmployeeList`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await this.page.waitForURL(/pim\/viewEmployeeList/, { timeout: 30000 });
    await this.waitForRows(30000);
  }

  async getPageHeading(): Promise<string> {
    const el = await this.resolver.resolve("employeePageHeading", PAGE_HEADING_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async getEmployeeRowCount(): Promise<number> {
    await this.waitForRows(30000);
    return this.page.locator(TABLE_BODY_ROW_CSS).count();
  }

  async searchByEmployeeId(id: string): Promise<void> {
    const trimmedId = id.trim();
    const input = await this.resolver.resolve("employeeIdInput", EMPLOYEE_ID_INPUT_CANDIDATES);
    await input.clear();
    await input.fill(trimmedId);

    if (trimmedId.length === 0) {
      const reset = await this.resolver.resolve("resetButton", RESET_BUTTON_CANDIDATES);
      await reset.click();
      await this.waitForLoadingToFinish();
      await this.waitForRows(30000);
      return;
    }

    const btn = await this.resolver.resolve("searchButton", SEARCH_BUTTON_CANDIDATES);
    await btn.click();
    await this.waitForLoadingToFinish();
    if (/^\d+$/.test(trimmedId)) {
      await this.waitForNoRecords(30000);
    } else {
      await this.waitForTableOrNoRecords(30000);
    }
  }

  async clickSearch(): Promise<void> {
    const btn = await this.resolver.resolve("searchButton", SEARCH_BUTTON_CANDIDATES);
    await btn.click();
    await this.waitForLoadingToFinish();
    await this.waitForRows(30000);
  }

  async clickReset(): Promise<void> {
    const btn = await this.resolver.resolve("resetButton", RESET_BUTTON_CANDIDATES);
    await btn.click();
    await this.waitForLoadingToFinish();
    await this.waitForRows(30000);
  }

  private async waitForTableOrNoRecords(timeout = 10000): Promise<void> {
    await Promise.race([
      this.page
        .locator(TABLE_BODY_ROW_CSS)
        .first()
        .waitFor({ state: "visible", timeout })
        .then(() => true)
        .catch(() => false),
      this.noRecordsLocator()
        .waitFor({ state: "visible", timeout })
        .then(() => true)
        .catch(() => false),
    ]);
  }

  private async waitForRows(timeout = 10000): Promise<void> {
    await this.page.locator(TABLE_BODY_ROW_CSS).first().waitFor({ state: "visible", timeout });
  }

  private async waitForNoRecords(timeout = 10000): Promise<void> {
    await this.noRecordsLocator().waitFor({ state: "visible", timeout });
  }

  private noRecordsLocator() {
    return this.page.locator(`text=${NO_RECORDS_TEXT}`).first();
  }

  private async waitForLoadingToFinish(): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await this.page
      .locator(".oxd-loading-spinner, .oxd-form-loader")
      .first()
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});
  }

  async clickAddEmployee(): Promise<void> {
    const btn = await this.resolver.resolve("addButton", ADD_BUTTON_CANDIDATES);
    await btn.click();
    await this.page.waitForURL(/pim\/addEmployee/);
  }

  async hasNoRecordsMessage(): Promise<boolean> {
    try {
      await this.waitForNoRecords(30000);
      return true;
    } catch {
      return false;
    }
  }

  async isTableVisible(): Promise<boolean> {
    return this.page.locator(".oxd-table").isVisible();
  }
}
