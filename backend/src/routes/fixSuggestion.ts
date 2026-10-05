import { Router, Request, Response } from 'express';
import {
  FixSuggestionRequest,
  FixSuggestionResponse,
} from '../types/index';
import { getGitHubService } from '../services/githubService';
import { runRuleEngine } from '../engine/ruleEngine';
import { generateFixSuggestion } from '../services/aiService';

export const fixSuggestionRouter = Router();

fixSuggestionRouter.post('/', async (req: Request, res: Response) => {
  const { repoUrl, findingId, context } = req.body as FixSuggestionRequest;

  // ── Input validation ────────────────────────────────────────────────────────

  if (!repoUrl || typeof repoUrl !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'repoUrl is required.',
    } as FixSuggestionResponse);
  }

  if (!findingId || typeof findingId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'findingId is required.',
    } as FixSuggestionResponse);
  }

  // ── Check that AI key is configured ────────────────────────────────────────

  const hasAIKey = !!(process.env.OPENAI_API_KEY ?? process.env.FEATHERLESS_API_KEY);
  if (!hasAIKey) {
    return res.status(503).json({
      success: false,
      error: 'AI fix suggestions require an API key. Set OPENAI_API_KEY in the backend .env file.',
    } as FixSuggestionResponse);
  }

  // ── Re-run rule engine to get findings for this repo ─────────────────────

  try {
    const github = getGitHubService();
    const ctx = await github.buildRepoContext(repoUrl);
    const { findings } = await runRuleEngine(ctx);

    // Check the requested finding exists
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) {
      return res.status(404).json({
        success: false,
        error: `Finding "${findingId}" was not found for this repository.`,
      } as FixSuggestionResponse);
    }

    const suggestion = await generateFixSuggestion({ repoUrl, findingId, context }, findings);

    if (!suggestion) {
      // Fallback: return the finding's suggestion as the fix
      const fallbackSuggestion = `**Issue:** ${finding.title}\n\n**Description:** ${finding.description}\n\n**Suggested Fix:** ${finding.suggestion || 'See the finding description for guidance.'}\n\n**Note:** AI-generated fix suggestions are currently unavailable. Please use the finding suggestion above.`;

      return res.status(200).json({
        success: true,
        suggestion: fallbackSuggestion,
      } as FixSuggestionResponse);
    }

    return res.status(200).json({
      success: true,
      suggestion,
    } as FixSuggestionResponse);
  } catch (err: unknown) {
    const message = (err as Error).message ?? 'Unknown error';
    console.error('[/fix-suggestion] Error:', message);
    return res.status(500).json({
      success: false,
      error: `Fix suggestion failed: ${message}`,
    } as FixSuggestionResponse);
  }
});
