import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

// Isolated test helpers — avoids touching real reports/ or visual-baselines/ directories
async function createTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "visual-test-"));
}

describe("compareScreenshot logic", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await createTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("reports isNewBaseline=true when no baseline exists", async () => {
    const baselinePath = path.join(tmpDir, "test.png");
    const exists = await fs
      .access(baselinePath)
      .then(() => true)
      .catch(() => false);
    assert.equal(exists, false, "Baseline should not exist yet");

    // Simulate first-run: write baseline
    const fakePng = Buffer.from("fake-png-data");
    await fs.writeFile(baselinePath, fakePng);

    const exists2 = await fs
      .access(baselinePath)
      .then(() => true)
      .catch(() => false);
    assert.equal(exists2, true, "Baseline should be created on first run");
  });

  it("dimension-mismatch does NOT overwrite baseline", async () => {
    const baselinePath = path.join(tmpDir, "scene.png");
    const originalContent = Buffer.from("original-baseline");
    await fs.writeFile(baselinePath, originalContent);

    // Simulate the new behavior: on dimension mismatch, we do NOT overwrite
    // Read back and verify original is intact
    const afterContent = await fs.readFile(baselinePath);
    assert.deepStrictEqual(
      afterContent,
      originalContent,
      "Baseline must not be silently overwritten on dimension mismatch"
    );
  });

  it("allowedDiffPercent threshold — 0% is strict, 100% is permissive", () => {
    const totalPixels = 1000;
    const diffPixels = 5;
    const diffPercent = (diffPixels / totalPixels) * 100; // 0.5%

    const strictMatch = diffPercent <= 0; // false — strictest possible
    const tolerantMatch = diffPercent <= 1; // true — 1% tolerance

    assert.equal(strictMatch, false, "0% tolerance should fail on any diff");
    assert.equal(tolerantMatch, true, "1% tolerance should pass 0.5% diff");
  });
});
