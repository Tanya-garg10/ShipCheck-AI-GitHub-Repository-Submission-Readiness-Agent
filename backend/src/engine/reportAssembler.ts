import { ReadinessReport, RepoContext } from '../types/index';
import { runRuleEngine } from './ruleEngine';
import { computeScore } from './scorer';
import { buildFallbackRecommendations, generateAIRecommendations } from '../services/aiService';

export interface AssembleOptions {
  repoUrl: string;
  includeAI: boolean;
}

/**
 * Orchestrates the full analysis pipeline:
 *   RepoContext → Rule Engine → Scorer → (optional) AI Layer → ReadinessReport
 */
export async function assembleReport(
  ctx: RepoContext,
  options: AssembleOptions
): Promise<ReadinessReport> {
  const start = Date.now();

  // 1. Run all deterministic checks
  const { findings } = await runRuleEngine(ctx);

  // 2. Compute score from findings
  const score = computeScore(findings);

  // 3. AI recommendations — fall back to rule-based summary if AI is unavailable
  let aiRecommendations = null;
  if (options.includeAI) {
    const aiResult = await generateAIRecommendations(findings, ctx.metadata, score).catch(
      (err) => {
        console.warn('[ReportAssembler] AI recommendations failed:', (err as Error).message);
        return null;
      }
    );
    // Use deterministic fallback when no API key or AI call failed
    aiRecommendations = aiResult ?? buildFallbackRecommendations(findings, score);
  }

  return {
    repoUrl: options.repoUrl,
    analyzedAt: new Date().toISOString(),
    metadata: ctx.metadata,
    findings,
    score,
    aiRecommendations,
    checkDurationMs: Date.now() - start,
  };
}
