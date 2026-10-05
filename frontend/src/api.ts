import { AnalyzeResponse, FixSuggestionResponse } from './types';

const BASE = '/api';

export async function analyzeRepo(
  repoUrl: string,
  includeAI = true
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl, includeAI }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[analyzeRepo] Error response:', errorText);
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<AnalyzeResponse>;
}

export async function fetchFixSuggestion(
  repoUrl: string,
  findingId: string,
  context?: string
): Promise<FixSuggestionResponse> {
  const res = await fetch(`${BASE}/fix-suggestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl, findingId, context }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[fetchFixSuggestion] Error response:', errorText);
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<FixSuggestionResponse>;
}
