#!/usr/bin/env ts-node
/**
 * PRD Analyzer — Mode 1 Path A
 *
 * Usage:
 *   npx ts-node scripts/prd-analyzer.ts --prd input/prd/filename.txt [--feature featurename]
 *
 * Scoring frameworks: SMART, INVEST, MoSCoW, RBT, BVA/EP
 * Output: APPROVED (console) or NEEDS REVISION (console + output/feedback/ file)
 */

import fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const prdFlagIndex = args.indexOf('--prd');
const featureFlagIndex = args.indexOf('--feature');

if (prdFlagIndex === -1 || !args[prdFlagIndex + 1]) {
  console.error(
    'Usage: npx ts-node scripts/prd-analyzer.ts --prd input/prd/<file>.txt [--feature <name>]',
  );
  process.exit(1);
}

const prdPath = path.resolve(process.cwd(), args[prdFlagIndex + 1]);
const featureName =
  featureFlagIndex !== -1
    ? args[featureFlagIndex + 1]
    : path.basename(prdPath, '.txt');

if (!fs.existsSync(prdPath)) {
  console.error(`File not found: ${prdPath}`);
  process.exit(1);
}

const prd = fs.readFileSync(prdPath, 'utf-8');
const today = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

interface FrameworkScore {
  name: string;
  score: number;
  max: number;
  passed: boolean;
  notes: string;
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

// SMART — Specific, Measurable, Achievable, Relevant, Time-bound
function scoreSMART(text: string): FrameworkScore {
  const lower = text.toLowerCase();
  const checks = [
    {
      label: 'Specific',
      pattern: /acceptance criteria|so that|in order to|defined as|must|shall/i,
    },
    {
      label: 'Measurable',
      pattern:
        /within \d+|≤|<=|at least \d+|exactly \d+|%|seconds|milliseconds|characters/i,
    },
    {
      label: 'Achievable',
      pattern: /story point|estimated|effort|scope|out of scope|won.t have/i,
    },
    {
      label: 'Relevant',
      pattern: /as (a|an) .+,\s*i want|business|user|hr|staff|admin/i,
    },
    {
      label: 'Time-bound',
      pattern:
        /this release|sprint|version \d|date|deadline|within \d+ seconds/i,
    },
  ];
  const met = checks.filter((c) => c.pattern.test(text));
  const score = met.length;
  const notes =
    met.length < 4
      ? `Missing: ${checks
          .filter((c) => !c.pattern.test(text))
          .map((c) => c.label)
          .join(', ')}`
      : 'All key criteria present';
  return { name: 'SMART', score, max: 5, passed: score >= 4, notes };
}

// INVEST — Independent, Negotiable, Valuable, Estimable, Small, Testable
function scoreINVEST(text: string): FrameworkScore {
  const checks = [
    { label: 'Independent', pattern: /out of scope|separate|not depend/i },
    {
      label: 'Negotiable',
      pattern: /could have|should have|won.t have|priority/i,
    },
    {
      label: 'Valuable',
      pattern: /so that|in order to|value|benefit|access|authoris/i,
    },
    {
      label: 'Estimable',
      pattern: /story point|effort|estimated|\d+\s*point/i,
    },
    { label: 'Small', pattern: /0\.5 story|1 story|small|single/i },
    {
      label: 'Testable',
      pattern:
        /acceptance criteria|given|when|then|verify|assert|visible|redirect/i,
    },
    { label: 'Independent-US', pattern: /us-\d{2}/i },
  ];
  const met = checks.filter((c) => c.pattern.test(text));
  const score = met.length;
  const notes =
    score < 4
      ? `Missing: ${checks
          .filter((c) => !c.pattern.test(text))
          .map((c) => c.label)
          .join(', ')}`
      : 'INVEST criteria well represented';
  return { name: 'INVEST', score, max: 7, passed: score >= 4, notes };
}

// MoSCoW — all Must Have items covered with clear acceptance criteria
function scoreMoSCoW(text: string): FrameworkScore {
  const hasMust = /must have/i.test(text);
  const mustItems = text.match(/must have[^\n]*/gi) || [];
  const hasAcceptanceCriteria = /acceptance criteria/i.test(text);
  const mustHaveWithCriteria = hasMust && hasAcceptanceCriteria;
  const hasShouldOrCould = /should have|could have/i.test(text);
  const hasWontHave = /won.t have/i.test(text);

  const score = [
    hasMust,
    mustHaveWithCriteria,
    hasShouldOrCould,
    hasWontHave,
  ].filter(Boolean).length;
  const passed = hasMust && mustHaveWithCriteria;
  const notes = passed
    ? `${mustItems.length} Must Have item(s) found with acceptance criteria`
    : 'Must Have items exist but missing clear acceptance criteria';

  return { name: 'MoSCoW', score, max: 4, passed, notes };
}

// RBT — no High likelihood × High impact risks without mitigation
function scoreRBT(text: string): FrameworkScore {
  const hasRiskSection = /risk|rbt/i.test(text);
  const hasHighHighUnmitigated = /high\s*\|\s*high(?!.*mitigation)/im.test(
    text,
  );
  const hasMitigation = /mitigation|mitigat/i.test(text);

  const passed = hasRiskSection && !hasHighHighUnmitigated;
  const score = [hasRiskSection, hasMitigation, !hasHighHighUnmitigated].filter(
    Boolean,
  ).length;
  const notes = !hasRiskSection
    ? 'No risk section found — add RBT table'
    : hasHighHighUnmitigated
      ? 'High likelihood × High impact risk found without mitigation'
      : 'No unmitigated High×High risks found';

  return { name: 'RBT', score, max: 3, passed, notes };
}

// BVA/EP — all input fields have defined boundary values
function scoreBVAEP(text: string): FrameworkScore {
  const hasInputSection = /input field|bva|boundary|equivalence/i.test(text);
  const hasMinMax = /min(imum)?|max(imum)?|min length|max length/i.test(text);
  const hasBoundaryValues =
    /\blength \d+|bva value|\d+ character|\d+ char/i.test(text);
  const hasEPClasses = /valid ep|invalid ep|equivalence class/i.test(text);

  const score = [
    hasInputSection,
    hasMinMax,
    hasBoundaryValues,
    hasEPClasses,
  ].filter(Boolean).length;
  const passed = score >= 3;
  const notes =
    score >= 3
      ? 'Boundary values and equivalence classes defined'
      : `Incomplete: missing ${[
          !hasInputSection && 'input field definitions',
          !hasMinMax && 'min/max values',
          !hasBoundaryValues && 'explicit boundary values',
          !hasEPClasses && 'equivalence classes',
        ]
          .filter(Boolean)
          .join(', ')}`;

  return { name: 'BVA/EP', score, max: 4, passed, notes };
}

// ---------------------------------------------------------------------------
// Run all frameworks
// ---------------------------------------------------------------------------
const frameworks: FrameworkScore[] = [
  scoreSMART(prd),
  scoreINVEST(prd),
  scoreMoSCoW(prd),
  scoreRBT(prd),
  scoreBVAEP(prd),
];

const allPassed = frameworks.every((f) => f.passed);
const verdict = allPassed ? 'APPROVED' : 'NEEDS REVISION';

// ---------------------------------------------------------------------------
// Build report
// ---------------------------------------------------------------------------
const divider = '-'.repeat(60);

const scoringLines = frameworks
  .map((f) => `${f.name.padEnd(10)}: ${f.score}/${f.max} — ${f.notes}`)
  .join('\n');

const failedItems: string[] = [];
if (!frameworks[0].passed)
  failedItems.push(
    'SMART: fewer than 4/5 criteria met — add measurable targets or time bounds',
  );
if (!frameworks[1].passed)
  failedItems.push(
    'INVEST: fewer than 4/7 criteria met — split stories or add estimability',
  );
if (!frameworks[2].passed)
  failedItems.push('MoSCoW: Must Have items lack clear acceptance criteria');
if (!frameworks[3].passed)
  failedItems.push(
    'RBT: unmitigated High×High risk detected or no risk table present',
  );
if (!frameworks[4].passed)
  failedItems.push(
    'BVA/EP: input fields missing boundary value or equivalence class definitions',
  );

const report = `PRD REVIEW FEEDBACK
Feature  : ${featureName}
Date     : ${today}
Verdict  : ${verdict}

SCORING SUMMARY
${divider}
${scoringLines}

${
  verdict === 'APPROVED'
    ? 'All thresholds met. Proceed with Mode 2 Path A to generate test cases.'
    : `ITEMS THAT NEED CLARIFICATION\n${divider}\n${failedItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nPlease revise the PRD and re-run Mode 1.`
}
`;

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
console.log('\n' + report);

if (verdict === 'NEEDS REVISION') {
  const feedbackDir = path.resolve(process.cwd(), 'output', 'feedback');
  if (!fs.existsSync(feedbackDir))
    fs.mkdirSync(feedbackDir, { recursive: true });
  const feedbackFile = path.join(
    feedbackDir,
    `${featureName}_prd_${today}.txt`,
  );
  fs.writeFileSync(feedbackFile, report, 'utf-8');
  console.log(`Feedback written to: ${feedbackFile}`);
  process.exit(1);
}

process.exit(0);
