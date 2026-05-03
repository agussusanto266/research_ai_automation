import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { TodoPage } from "../../pages/todomvc/TodoPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I am on the TodoMVC app", async function (this: CustomWorld) {
  await this.getPage(TodoPage).goto(env.todoMvcBaseUrl);
});

Given("I have added a todo {string}", async function (this: CustomWorld, text: string) {
  await this.getPage(TodoPage).addTodo(text);
});

Given("I have completed the todo {string}", async function (this: CustomWorld, text: string) {
  await this.getPage(TodoPage).completeTodo(text);
});

Given("I have clicked the {string} filter", async function (this: CustomWorld, filter: string) {
  await this.getPage(TodoPage).clickFilter(filter as "All" | "Active" | "Completed");
});

When(
  "I type {string} in the todo input and press Enter",
  async function (this: CustomWorld, text: string) {
    await this.getPage(TodoPage).addTodo(text);
  }
);

When("I complete the todo {string}", async function (this: CustomWorld, text: string) {
  await this.getPage(TodoPage).completeTodo(text);
});

When("I uncomplete the todo {string}", async function (this: CustomWorld, text: string) {
  await this.getPage(TodoPage).uncompleteTodo(text);
});

When("I delete the todo {string}", async function (this: CustomWorld, text: string) {
  await this.getPage(TodoPage).deleteTodo(text);
});

When("I click the {string} filter", async function (this: CustomWorld, filter: string) {
  await this.getPage(TodoPage).clickFilter(filter as "All" | "Active" | "Completed");
});

When('I click "Clear completed"', async function (this: CustomWorld) {
  await this.getPage(TodoPage).clearCompleted();
});

Then(
  "the todo list item count should be {int}",
  async function (this: CustomWorld, expected: number) {
    // Wait for React to commit the DOM update before asserting
    await this.page.waitForFunction(
      (n) => document.querySelectorAll(".todo-list li").length === n,
      expected,
      { timeout: 5000 }
    );
    const actual = await this.getPage(TodoPage).getTodoItemCount();
    assert.strictEqual(actual, expected, `Expected ${expected} todo item(s) but found ${actual}`);
  }
);

Then("the footer should show {string}", async function (this: CustomWorld, expectedText: string) {
  const footerText = await this.getPage(TodoPage).getFooterText();
  assert.match(
    footerText,
    new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `Expected footer to contain "${expectedText}" but got "${footerText}"`
  );
});

Then(
  "the todo {string} should be marked as completed",
  async function (this: CustomWorld, text: string) {
    const completed = await this.getPage(TodoPage).isTodoCompleted(text);
    assert.ok(completed, `Expected todo "${text}" to be completed but it was not`);
  }
);

Then(
  "the todo {string} should not be marked as completed",
  async function (this: CustomWorld, text: string) {
    const completed = await this.getPage(TodoPage).isTodoCompleted(text);
    assert.ok(!completed, `Expected todo "${text}" to be active but it was completed`);
  }
);

Then("only the active todos should be visible", async function (this: CustomWorld) {
  const active = await this.getPage(TodoPage).getActiveTodoTexts();
  assert.ok(active.length > 0, "Expected at least one active todo to be visible but found none");
  const completed = await this.getPage(TodoPage).getCompletedTodoTexts();
  assert.strictEqual(
    completed.length,
    0,
    `Expected no completed todos to be visible but found: ${completed.join(", ")}`
  );
});

Then("the completed todos should be hidden", async function (this: CustomWorld) {
  const completed = await this.getPage(TodoPage).getCompletedTodoTexts();
  assert.strictEqual(
    completed.length,
    0,
    `Expected completed todos to be hidden but found: ${completed.join(", ")}`
  );
});

Then("only the completed todos should be visible", async function (this: CustomWorld) {
  const completed = await this.getPage(TodoPage).getCompletedTodoTexts();
  assert.ok(
    completed.length > 0,
    "Expected at least one completed todo to be visible but found none"
  );
  const active = await this.getPage(TodoPage).getActiveTodoTexts();
  assert.strictEqual(
    active.length,
    0,
    `Expected no active todos to be visible but found: ${active.join(", ")}`
  );
});

Then("the active todos should be hidden", async function (this: CustomWorld) {
  const active = await this.getPage(TodoPage).getActiveTodoTexts();
  assert.strictEqual(
    active.length,
    0,
    `Expected active todos to be hidden but found: ${active.join(", ")}`
  );
});

Then("the todo item {string} should be visible", async function (this: CustomWorld, text: string) {
  const visible = await this.getPage(TodoPage).isTodoVisible(text);
  assert.ok(visible, `Expected todo item "${text}" to be visible but it was not`);
});
