import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { OrangeHRMEmployeePage } from "../../pages/orangehrm/OrangeHRMEmployeePage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I navigate to the OrangeHRM employee list", async function (this: CustomWorld) {
  await this.getPage(OrangeHRMEmployeePage).goto(env.orangehrmBaseUrl);
});

When(
  "I search the OrangeHRM employee list by ID {string}",
  { timeout: 90000 },
  async function (this: CustomWorld, id: string) {
    await this.getPage(OrangeHRMEmployeePage).searchByEmployeeId(id);
  }
);

When("I click the OrangeHRM employee search button", async function (this: CustomWorld) {
  await this.getPage(OrangeHRMEmployeePage).clickSearch();
});

When("I reset the OrangeHRM employee search", async function (this: CustomWorld) {
  await this.getPage(OrangeHRMEmployeePage).clickReset();
});

When("I click the OrangeHRM add employee button", async function (this: CustomWorld) {
  await this.getPage(OrangeHRMEmployeePage).clickAddEmployee();
});

Then("the OrangeHRM employee table should be visible", async function (this: CustomWorld) {
  const visible = await this.getPage(OrangeHRMEmployeePage).isTableVisible();
  assert.ok(visible, "Expected OrangeHRM employee table to be visible");
});

Then(
  "the OrangeHRM employee list should have at least {int} record",
  async function (this: CustomWorld, min: number) {
    const count = await this.getPage(OrangeHRMEmployeePage).getEmployeeRowCount();
    assert.ok(count >= min, `Expected at least ${min} employee record(s) but found ${count}`);
  }
);

Then("the OrangeHRM employee list should show no records", async function (this: CustomWorld) {
  const noRecords = await this.getPage(OrangeHRMEmployeePage).hasNoRecordsMessage();
  assert.ok(noRecords, "Expected 'No Records Found' message but it was not visible");
});

Then(
  "the OrangeHRM employee list result should be {string}",
  async function (this: CustomWorld, expected: string) {
    if (expected === "no-records") {
      const noRecords = await this.getPage(OrangeHRMEmployeePage).hasNoRecordsMessage();
      assert.ok(noRecords, "Expected no records but records are visible");
    } else {
      const count = await this.getPage(OrangeHRMEmployeePage).getEmployeeRowCount();
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
