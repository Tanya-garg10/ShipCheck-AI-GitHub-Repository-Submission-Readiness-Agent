import { CheckCategory, Finding, ReadinessScore, Severity } from '../types/index';

// ─── Per-category weight (must sum to 100) ───────────────────────────────────

const CATEGORY_WEIGHTS: Record<CheckCategory, number> = {
  readme:       30,
  build_config: 20,
  security:     20,
  links:        10,
  repo_hygiene: 12,
  license:       8,
};

// ─── Penalty points deducted per finding severity ────────────────────────────

const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 20,
  warning:  8,
  info:     2,
  pass:     0,
};

// ─── Grade thresholds ────────────────────────────────────────────────────────

function toGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

/**
 * Compute the readiness score from a list of findings.
 *
 * Algorithm:
 *  - Each category starts at its full weight (e.g. readme = 30 pts).
 *  - For each non-pass finding in a category, subtract the severity penalty
 *    capped so the category score never goes below 0.
 *  - Sum all category scores for the total (0–100).
 */
export function computeScore(findings: Finding[]): ReadinessScore {
  const categoryScores: Record<CheckCategory, number> = {
    readme:       CATEGORY_WEIGHTS.readme,
    build_config: CATEGORY_WEIGHTS.build_config,
    security:     CATEGORY_WEIGHTS.security,
    links:        CATEGORY_WEIGHTS.links,
    repo_hygiene: CATEGORY_WEIGHTS.repo_hygiene,
    license:      CATEGORY_WEIGHTS.license,
  };

  for (const finding of findings) {
    const penalty = SEVERITY_PENALTY[finding.severity];
    if (penalty > 0) {
      categoryScores[finding.category] = Math.max(
        0,
        categoryScores[finding.category] - penalty
      );
    }
  }

  const total = Math.round(
    Object.values(categoryScores).reduce((sum, v) => sum + v, 0)
  );

  return {
    total,
    breakdown: {
      readme:       Math.round(categoryScores.readme),
      build_config: Math.round(categoryScores.build_config),
      security:     Math.round(categoryScores.security),
      links:        Math.round(categoryScores.links),
      repo_hygiene: Math.round(categoryScores.repo_hygiene),
      license:      Math.round(categoryScores.license),
    },
    grade: toGrade(total),
  };
}

/** Returns counts of findings by severity (useful for display). */
export function summariseFindings(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, warning: 0, info: 0, pass: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}
