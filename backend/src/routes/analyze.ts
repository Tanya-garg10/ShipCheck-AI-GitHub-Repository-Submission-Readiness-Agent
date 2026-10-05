import { Router, Request, Response } from 'express';
import { AnalyzeRequest, AnalyzeResponse } from '../types/index';
import { getGitHubService, parseGitHubUrl } from '../services/githubService';
import { assembleReport } from '../engine/reportAssembler';

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req: Request, res: Response) => {
  const { repoUrl, includeAI = true } = req.body as AnalyzeRequest;

  // ── Input validation ────────────────────────────────────────────────────────

  if (!repoUrl || typeof repoUrl !== 'string') {
    const response: AnalyzeResponse = {
      success: false,
      error: 'repoUrl is required and must be a string.',
    };
    return res.status(400).json(response);
  }

  // Validate URL format before hitting GitHub
  try {
    parseGitHubUrl(repoUrl);
  } catch (err) {
    const response: AnalyzeResponse = {
      success: false,
      error: (err as Error).message,
    };
    return res.status(400).json(response);
  }

  // ── Run analysis ────────────────────────────────────────────────────────────

  try {
    console.log('[/analyze] Starting analysis for:', repoUrl);
    const github = getGitHubService();
    const ctx = await github.buildRepoContext(repoUrl);
    console.log('[/analyze] Repository context built successfully');

    // Block analysis of private repos (we can't access their content anyway,
    // but surface a clear error rather than a cryptic 404)
    if (ctx.metadata.isPrivate) {
      const response: AnalyzeResponse = {
        success: false,
        error:
          'This repository is private. ShipCheck AI only supports public repositories.',
      };
      return res.status(422).json(response);
    }

    const report = await assembleReport(ctx, {
      repoUrl,
      includeAI: Boolean(includeAI),
    });
    console.log('[/analyze] Report assembled successfully');

    const response: AnalyzeResponse = { success: true, report };
    return res.status(200).json(response);
  } catch (err: unknown) {
    const message = (err as Error).message ?? 'Unknown error';
    const stack = (err as Error).stack ?? 'No stack trace';

    console.error('[/analyze] Error occurred:', message);
    console.error('[/analyze] Stack trace:', stack);

    // Map GitHub API errors to useful HTTP status codes
    if (message.includes('404') || message.toLowerCase().includes('not found')) {
      return res.status(404).json({
        success: false,
        error: `Repository not found. Make sure the URL is correct and the repo is public.`,
      } as AnalyzeResponse);
    }

    if (message.includes('403') || message.toLowerCase().includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error:
          'GitHub API rate limit reached. Add a GITHUB_TOKEN to the backend .env file to increase the limit to 5,000 requests/hour.',
      } as AnalyzeResponse);
    }

    if (message.includes('401')) {
      return res.status(401).json({
        success: false,
        error: 'GitHub API authentication failed. Check your GITHUB_TOKEN.',
      } as AnalyzeResponse);
    }

    console.error('[/analyze] Unexpected error:', message);
    return res.status(500).json({
      success: false,
      error: `Analysis failed: ${message}`,
    } as AnalyzeResponse);
  }
});
