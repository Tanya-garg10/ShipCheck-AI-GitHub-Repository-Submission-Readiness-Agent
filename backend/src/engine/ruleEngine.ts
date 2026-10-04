import { Finding, RepoContext } from '../types/index';
import { checkReadme } from './checkers/readmeChecker';
import { checkBuildConfig } from './checkers/buildConfigChecker';
import { checkSecurity } from './checkers/securityChecker';
import { checkLinks } from './checkers/linksChecker';
import { checkRepoHygiene } from './checkers/repoHygieneChecker';
import { checkLicense } from './checkers/licenseChecker';

export interface RuleEngineResult {
  findings: Finding[];
  durationMs: number;
}

/**
 * Orchestrates all deterministic checkers and aggregates their findings.
 * Link checking is async (HTTP requests); all others are synchronous.
 */
export async function runRuleEngine(ctx: RepoContext): Promise<RuleEngineResult> {
  const start = Date.now();

  // Run synchronous checkers immediately
  const syncFindings: Finding[] = [
    ...checkReadme(ctx),
    ...checkBuildConfig(ctx),
    ...checkSecurity(ctx),
    ...checkRepoHygiene(ctx),
    ...checkLicense(ctx),
  ];

  // Run async link checker in parallel with the above (already done by the time we get here)
  const linkFindings = await checkLinks(ctx);

  const findings = [...syncFindings, ...linkFindings];

  return {
    findings,
    durationMs: Date.now() - start,
  };
}
