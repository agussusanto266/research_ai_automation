import type { Page } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";

const BASELINE_DIR = path.resolve(process.cwd(), "visual-baselines");
const DIFF_DIR = path.resolve(process.cwd(), "reports", "visual-diffs");

export type VisualResult = {
  matched: boolean;
  isNewBaseline: boolean;
  diffPixels: number;
  diffPercent: number;
  diffPath?: string;
};

/**
 * Captures a full-page screenshot and compares it to the stored baseline.
 *
 * @param threshold          Per-pixel colour distance tolerance 0–1 (default 0.1 = 10%).
 *                           Controls how "different" a pixel must be before it counts.
 * @param allowedDiffPercent Maximum percentage of pixels that may differ before the
 *                           comparison is considered a failure (default 0.5 %).
 *                           Provides tolerance for sub-pixel rendering differences
 *                           across operating systems and font engines.
 *
 * On first run: screenshot is saved as the new baseline; matched = true.
 * On dimension mismatch: returns matched = false WITHOUT overwriting the baseline.
 *   The baseline must be intentionally refreshed via updateBaseline().
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  threshold = 0.1,
  allowedDiffPercent = 0.5
): Promise<VisualResult> {
  const { PNG } = await import("pngjs");
  const pixelmatch = (await import("pixelmatch")).default;

  await fs.mkdir(BASELINE_DIR, { recursive: true });
  await fs.mkdir(DIFF_DIR, { recursive: true });

  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  const currentBuf = await page.screenshot({ fullPage: true, animations: "disabled" });

  const baselineExists = await fs
    .access(baselinePath)
    .then(() => true)
    .catch(() => false);

  if (!baselineExists) {
    await fs.writeFile(baselinePath, currentBuf);
    return { matched: true, isNewBaseline: true, diffPixels: 0, diffPercent: 0 };
  }

  const baselineBuf = await fs.readFile(baselinePath);
  const baseline = PNG.sync.read(baselineBuf);
  const current = PNG.sync.read(currentBuf);

  // Dimension mismatch: report failure but do NOT overwrite baseline automatically.
  // The engineer must call updateBaseline() after reviewing the intentional change.
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      matched: false,
      isNewBaseline: false,
      diffPixels: baseline.width * baseline.height,
      diffPercent: 100,
    };
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold }
  );

  const totalPixels = baseline.width * baseline.height;
  const diffPercent = (diffPixels / totalPixels) * 100;
  const matched = diffPercent <= allowedDiffPercent;

  let diffPath: string | undefined;
  if (!matched) {
    diffPath = path.join(DIFF_DIR, `${name}-diff-${Date.now()}.png`);
    await fs.writeFile(diffPath, PNG.sync.write(diff));
  }

  return { matched, isNewBaseline: false, diffPixels, diffPercent, diffPath };
}

export async function updateBaseline(page: Page, name: string): Promise<void> {
  await fs.mkdir(BASELINE_DIR, { recursive: true });
  const buf = await page.screenshot({ fullPage: true, animations: "disabled" });
  await fs.writeFile(path.join(BASELINE_DIR, `${name}.png`), buf);
}
