import type { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

export type A11yViolation = {
  id: string;
  impact: string | null;
  description: string;
  nodes: number;
};

export async function checkAccessibility(page: Page): Promise<A11yViolation[]> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    description: v.description,
    nodes: v.nodes.length,
  }));
}
