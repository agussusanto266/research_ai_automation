import type { Locator, Page } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";

export type LocatorCandidate =
  | { name: string; kind: "testId"; value: string }
  | { name: string; kind: "id"; value: string }
  | { name: string; kind: "role"; role: Parameters<Page["getByRole"]>[0]; options?: Parameters<Page["getByRole"]>[1] }
  | { name: string; kind: "label"; value: string }
  | { name: string; kind: "text"; value: string }
  | { name: string; kind: "css"; value: string }
  | { name: string; kind: "xpath"; value: string };

type LocatorUsage = {
  elementName: string;
  candidateName: string;
  kind: LocatorCandidate["kind"];
  value: string;
  at: string;
};

type LocatorHistory = Record<string, LocatorUsage[]>;

const HISTORY_PATH = path.resolve(process.cwd(), "reports", "locator-history.json");

export class SelfHealingLocatorResolver {
  private readonly runtimeUsage: LocatorUsage[] = [];

  constructor(
    private readonly page: Page,
    private readonly scenarioLogs: string[]
  ) {}

  getUsageLogs(): LocatorUsage[] {
    return [...this.runtimeUsage];
  }

  async resolve(elementName: string, candidates: LocatorCandidate[], timeoutMs = 1200): Promise<Locator> {
    for (const candidate of candidates) {
      const locator = this.toLocator(candidate);
      try {
        await locator.first().waitFor({ state: "attached", timeout: timeoutMs });
        const usage: LocatorUsage = {
          elementName,
          candidateName: candidate.name,
          kind: candidate.kind,
          value: this.describeCandidate(candidate),
          at: new Date().toISOString()
        };
        this.runtimeUsage.push(usage);
        this.scenarioLogs.push(
          `[self-heal] ${elementName} resolved with ${candidate.name} (${candidate.kind}: ${usage.value})`
        );
        await this.persistUsage(usage);
        return locator.first();
      } catch {
        this.scenarioLogs.push(`[self-heal] ${elementName} failed candidate ${candidate.name}`);
      }
    }

    throw new Error(
      `Unable to resolve locator for "${elementName}". Tried: ${candidates
        .map((candidate) => `${candidate.name}:${candidate.kind}`)
        .join(", ")}`
    );
  }

  private toLocator(candidate: LocatorCandidate): Locator {
    switch (candidate.kind) {
      case "testId":
        return this.page.getByTestId(candidate.value);
      case "id":
        return this.page.locator(`#${candidate.value}`);
      case "role":
        return this.page.getByRole(candidate.role, candidate.options);
      case "label":
        return this.page.getByLabel(candidate.value);
      case "text":
        return this.page.getByText(candidate.value, { exact: true });
      case "css":
        return this.page.locator(candidate.value);
      case "xpath":
        return this.page.locator(`xpath=${candidate.value}`);
    }
  }

  private describeCandidate(candidate: LocatorCandidate): string {
    if (candidate.kind === "role") {
      return `${candidate.role} ${JSON.stringify(candidate.options ?? {})}`;
    }
    return candidate.value;
  }

  private async persistUsage(usage: LocatorUsage): Promise<void> {
    await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
    let current: LocatorHistory = {};
    try {
      const existing = await fs.readFile(HISTORY_PATH, "utf-8");
      current = JSON.parse(existing) as LocatorHistory;
    } catch {
      current = {};
    }

    const history = current[usage.elementName] ?? [];
    history.push(usage);
    current[usage.elementName] = history.slice(-30);
    await fs.writeFile(HISTORY_PATH, JSON.stringify(current, null, 2), "utf-8");
  }
}
