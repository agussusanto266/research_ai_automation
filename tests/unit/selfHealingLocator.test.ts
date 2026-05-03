import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type { Locator, Page } from "playwright";
import { SelfHealingLocatorResolver } from "../../utils/selfHealingLocator";
import type { LocatorCandidate, LocatorUsage } from "../../utils/selfHealingLocator";

// Minimal stub for a Playwright Locator
function makeLocator(visible: boolean): Locator {
  return {
    first: () => makeLocator(visible),
    waitFor: async ({ state }: { state: string }) => {
      if (state === "visible" && !visible) throw new Error("not visible");
    },
    textContent: async () => "text",
    isVisible: async () => visible,
    click: async () => {},
    fill: async () => {},
  } as unknown as Locator;
}

// Minimal stub for Page
function makePage(visibilityMap: Record<string, boolean> = {}): Page {
  const locatorFn = (selector: string) => {
    const visible = visibilityMap[selector] ?? false;
    return makeLocator(visible);
  };

  return {
    getByTestId: (v: string) => makeLocator(visibilityMap[`testId:${v}`] ?? false),
    getByRole: (role: string) => makeLocator(visibilityMap[`role:${role}`] ?? false),
    getByLabel: (v: string) => makeLocator(visibilityMap[`label:${v}`] ?? false),
    getByText: (v: string) => makeLocator(visibilityMap[`text:${v}`] ?? false),
    locator: locatorFn,
  } as unknown as Page;
}

describe("SelfHealingLocatorResolver", () => {
  let scenarioLogs: string[];
  let sharedUsages: LocatorUsage[];

  beforeEach(() => {
    scenarioLogs = [];
    sharedUsages = [];
  });

  it("resolves using first matching candidate", async () => {
    const page = makePage({ "testId:username": true });
    const resolver = new SelfHealingLocatorResolver(page, scenarioLogs, sharedUsages);

    const candidates: LocatorCandidate[] = [
      { name: "primary-testid", kind: "testId", value: "username" },
      { name: "fallback-css", kind: "css", value: "input[name='user-name']" },
    ];

    const locator = await resolver.resolve("usernameInput", candidates, 100);
    assert.ok(locator, "Expected a locator to be returned");
    assert.ok(
      scenarioLogs.some((l) => l.includes("primary-testid")),
      "Expected resolution log for primary-testid"
    );
  });

  it("falls back to second candidate when first is invisible", async () => {
    const page = makePage({
      "testId:username": false,
      "id:user-name": true,
    });

    // Override locator for id to be visible
    (page as unknown as { locator: (s: string) => Locator }).locator = (selector: string) => {
      if (selector === "#user-name") return makeLocator(true);
      return makeLocator(false);
    };

    const resolver = new SelfHealingLocatorResolver(page, scenarioLogs, sharedUsages);
    const candidates: LocatorCandidate[] = [
      { name: "primary-testid", kind: "testId", value: "username" },
      { name: "secondary-id", kind: "id", value: "user-name" },
    ];

    const locator = await resolver.resolve("usernameInput", candidates, 100);
    assert.ok(locator, "Expected fallback locator");
    assert.ok(
      scenarioLogs.some((l) => l.includes("failed candidate primary-testid")),
      "Expected failure log for primary candidate"
    );
    assert.ok(
      scenarioLogs.some((l) => l.includes("secondary-id")),
      "Expected resolution log for secondary-id"
    );
  });

  it("throws when no candidate matches", async () => {
    const page = makePage({});
    const resolver = new SelfHealingLocatorResolver(page, scenarioLogs, sharedUsages);
    const candidates: LocatorCandidate[] = [
      { name: "primary-testid", kind: "testId", value: "nonexistent" },
    ];

    await assert.rejects(
      () => resolver.resolve("missingElement", candidates, 100),
      /Unable to resolve locator for "missingElement"/
    );
  });

  it("records usage in sharedUsages array", async () => {
    const page = makePage({ "testId:btn": true });
    const resolver = new SelfHealingLocatorResolver(page, scenarioLogs, sharedUsages);
    const candidates: LocatorCandidate[] = [
      { name: "primary-testid", kind: "testId", value: "btn" },
    ];

    await resolver.resolve("buttonElement", candidates, 100);
    assert.strictEqual(sharedUsages.length, 1);
    assert.strictEqual(sharedUsages[0].elementName, "buttonElement");
    assert.strictEqual(sharedUsages[0].candidateName, "primary-testid");
  });
});
