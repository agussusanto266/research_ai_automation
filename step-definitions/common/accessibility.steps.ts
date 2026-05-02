import { Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { CustomWorld } from "../../support/CustomWorld";
import { checkAccessibility } from "../../support/accessibility";

Then("the page should have no accessibility violations", async function (this: CustomWorld) {
  const violations = await checkAccessibility(this.page);
  assert.strictEqual(
    violations.length,
    0,
    `Found ${violations.length} accessibility violation(s):\n` +
      violations
        .map((v) => `  [${v.impact ?? "unknown"}] ${v.id}: ${v.description} (${v.nodes} node(s))`)
        .join("\n")
  );
});
