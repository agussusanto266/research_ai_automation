import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { TodoPage } from "../../pages/TodoPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I am on the TodoMVC app", async function (this: CustomWorld) {
  this.todoPage = new TodoPage(this.page, this.scenarioLogs);
  await this.todoPage.goto(env.todoMvcBaseUrl);
});

Given("I have added a todo {string}", async function (this: CustomWorld, text: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.addTodo(text);
});

Given("I have completed the todo {string}", async function (this: CustomWorld, text: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.completeTodo(text);
});

Given("I have clicked the {string} filter", async function (this: CustomWorld, filter: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.clickFilter(filter as "All" | "Active" | "Completed");
});

When(
  "I type {string} in the todo input and press Enter",
  async function (this: CustomWorld, text: string) {
    assert.ok(this.todoPage, "TodoPage is not initialized");
    await this.todoPage.addTodo(text);
  }
);

When("I complete the todo {string}", async function (this: CustomWorld, text: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.completeTodo(text);
});

When("I uncomplete the todo {string}", async function (this: CustomWorld, text: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.uncompleteTodo(text);
});

When("I delete the todo {string}", async function (this: CustomWorld, text: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.deleteTodo(text);
});

When("I click the {string} filter", async function (this: CustomWorld, filter: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.clickFilter(filter as "All" | "Active" | "Completed");
});

When('I click "Clear completed"', async function (this: CustomWorld) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  await this.todoPage.clearCompleted();
});

Then(
  "the todo list item count should be {int}",
  async function (this: CustomWorld, expected: number) {
    assert.ok(this.todoPage, "TodoPage is not initialized");
    // Wait for React to commit the DOM update before asserting
    await this.page.waitForFunction(
      (n) => document.querySelectorAll(".todo-list li").length === n,
      expected,
      { timeout: 5000 }
    );
    const actual = await this.todoPage.getTodoItemCount();
    assert.strictEqual(actual, expected, `Expected ${expected} todo item(s) but found ${actual}`);
  }
);

Then("the footer should show {string}", async function (this: CustomWorld, expectedText: string) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  const footerText = await this.todoPage.getFooterText();
  assert.match(
    footerText,
    new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `Expected footer to contain "${expectedText}" but got "${footerText}"`
  );
});

Then(
  "the todo {string} should be marked as completed",
  async function (this: CustomWorld, text: string) {
    assert.ok(this.todoPage, "TodoPage is not initialized");
    const completed = await this.todoPage.isTodoCompleted(text);
    assert.ok(completed, `Expected todo "${text}" to be completed but it was not`);
  }
);

Then(
  "the todo {string} should not be marked as completed",
  async function (this: CustomWorld, text: string) {
    assert.ok(this.todoPage, "TodoPage is not initialized");
    const completed = await this.todoPage.isTodoCompleted(text);
    assert.ok(!completed, `Expected todo "${text}" to be active but it was completed`);
  }
);

Then("only the active todos should be visible", async function (this: CustomWorld) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  const completed = await this.todoPage.getCompletedTodoTexts();
  assert.strictEqual(
    completed.length,
    0,
    `Expected no completed todos to be visible but found: ${completed.join(", ")}`
  );
});

Then("the completed todos should be hidden", async function (this: CustomWorld) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  const completed = await this.todoPage.getCompletedTodoTexts();
  assert.strictEqual(
    completed.length,
    0,
    `Expected completed todos to be hidden but found: ${completed.join(", ")}`
  );
});

Then("only the completed todos should be visible", async function (this: CustomWorld) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  const active = await this.todoPage.getActiveTodoTexts();
  assert.strictEqual(
    active.length,
    0,
    `Expected no active todos to be visible but found: ${active.join(", ")}`
  );
});

Then("the active todos should be hidden", async function (this: CustomWorld) {
  assert.ok(this.todoPage, "TodoPage is not initialized");
  const active = await this.todoPage.getActiveTodoTexts();
  assert.strictEqual(
    active.length,
    0,
    `Expected active todos to be hidden but found: ${active.join(", ")}`
  );
});

Then(
  "the todo item {string} should be visible",
  async function (this: CustomWorld, text: string) {
    assert.ok(this.todoPage, "TodoPage is not initialized");
    const visible = await this.todoPage.isTodoVisible(text);
    assert.ok(visible, `Expected todo item "${text}" to be visible but it was not`);
  }
);
