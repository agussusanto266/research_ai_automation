import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { OrangeHRMEmployeePage } from "../../pages/OrangeHRMEmployeePage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I navigate to the OrangeHRM employee list", async function (this: CustomWorld) {
  this.orangehrmEmployeePage = new OrangeHRMEmployeePage(this.page, this.scenarioLogs, this.locatorUsages);
  await this.orangehrmEmployeePage.goto(env.orangehrmBaseUrl);
});

When(
  "I search the OrangeHRM employee list by ID {string}",
  { timeout: 90000 },
  async function (this: CustomWorld, id: string) {
    assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
    await this.orangehrmEmployeePage.searchByEmployeeId(id);
  }
);

When("I click the OrangeHRM employee search button", async function (this: CustomWorld) {
  assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
  await this.orangehrmEmployeePage.clickSearch();
});

When("I reset the OrangeHRM employee search", async function (this: CustomWorld) {
  assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
  await this.orangehrmEmployeePage.clickReset();
});

When("I click the OrangeHRM add employee button", async function (this: CustomWorld) {
  assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
  await this.orangehrmEmployeePage.clickAddEmployee();
});

Then("the OrangeHRM employee table should be visible", async function (this: CustomWorld) {
  assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
  const visible = await this.orangehrmEmployeePage.isTableVisible();
  assert.ok(visible, "Expected OrangeHRM employee table to be visible");
});

Then(
  "the OrangeHRM employee list should have at least {int} record",
  async function (this: CustomWorld, min: number) {
    assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
    const count = await this.orangehrmEmployeePage.getEmployeeRowCount();
    assert.ok(
      count >= min,
      `Expected at least ${min} employee record(s) but found ${count}`
    );
  }
);

Then("the OrangeHRM employee list should show no records", async function (this: CustomWorld) {
  assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
  const noRecords = await this.orangehrmEmployeePage.hasNoRecordsMessage();
  assert.ok(noRecords, "Expected 'No Records Found' message but it was not visible");
});

Then(
  "the OrangeHRM employee list result should be {string}",
  async function (this: CustomWorld, expected: string) {
    assert.ok(this.orangehrmEmployeePage, "OrangeHRMEmployeePage is not initialized");
    if (expected === "no-records") {
      const noRecords = await this.orangehrmEmployeePage.hasNoRecordsMessage();
      assert.ok(noRecords, "Expected no records but records are visible");
    } else {
      const count = await this.orangehrmEmployeePage.getEmployeeRowCount();
      assert.ok(count > 0, "Expected records but none found");
    }
  }
);

Then("I should be on the OrangeHRM add employee page", async function (this: CustomWorld) {
  await this.page.waitForURL(/pim\/addEmployee/, { timeout: 10000 });
  assert.match(
    this.page.url(),
    /pim\/addEmployee/,
    `Expected add employee URL but got ${this.page.url()}`
  );
});
