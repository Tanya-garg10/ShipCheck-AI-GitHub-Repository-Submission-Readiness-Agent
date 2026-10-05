import { AnalyzeResponse, FixSuggestionResponse } from './types';

// In development, Vite proxies /api → localhost:3001
// In production, VITE_API_URL must be set to the backend URL (e.g. https://shipcheck-backend.onrender.com)
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

export async function analyzeRepo(
  repoUrl: string,
  includeAI = true
): Promise<AnalyzeResponse> {
  try {
    const res = await fetch(`${BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, includeAI }),
    });

    return res.json() as Promise<AnalyzeResponse>;
  } catch (err) {
    console.error('[analyzeRepo] Error:', err);
    return { success: false, error: 'Network error — could not reach the backend.' };
  }
}

export async function fetchFixSuggestion(
  repoUrl: string,
  findingId: string,
  context?: string
): Promise<FixSuggestionResponse> {
  try {
    const res = await fetch(`${BASE}/fix-suggestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, findingId, context }),
    });

    return res.json() as Promise<FixSuggestionResponse>;
  } catch (err) {
    console.error('[fetchFixSuggestion] Error:', err);
    return { success: false, error: 'Network error — could not reach the backend.' };
  }
}
