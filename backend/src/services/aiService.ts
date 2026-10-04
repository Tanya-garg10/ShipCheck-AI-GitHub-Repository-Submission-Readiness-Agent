import OpenAI from 'openai';
import {
  AIRecommendation,
  Finding,
  FixSuggestionRequest,
  PrioritizedFix,
  ReadinessScore,
  RepoMetadata,
  Severity,
} from '../types/index';

// ─── Client singleton ────────────────────────────────────────────────────────

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function severityOrder(s: Severity): number {
  return { critical: 0, warning: 1, info: 2, pass: 3 }[s];
}

/** Builds a compact text representation of non-pass findings for the prompt. */
function buildFindingsSummary(findings: Finding[]): string {
  const relevant = findings
    .filter((f) => f.severity !== 'pass')
    .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity))
    .slice(0, 20); // cap to keep prompt size reasonable

  return relevant
    .map(
      (f, i) =>
        `${i + 1}. [${f.severity.toUpperCase()}] (${f.category}) ${f.title}` +
        (f.evidence ? ` — Evidence: ${f.evidence}` : '') +
        (f.suggestion ? ` — Hint: ${f.suggestion}` : '')
    )
    .join('\n');
}

// ─── Generate full AI recommendations ───────────────────────────────────────

export async function generateAIRecommendations(
  findings: Finding[],
  metadata: RepoMetadata,
  score: ReadinessScore
): Promise<AIRecommendation | null> {
  const client = getClient();
  if (!client) return null;

  const nonPassFindings = findings.filter((f) => f.severity !== 'pass');
  if (nonPassFindings.length === 0) {
    return {
      summary: 'This repository looks well-prepared for submission — no significant issues were found.',
      prioritized: [],
      overallAdvice:
        'Double-check that all links are live and your demo is accessible. Good luck with your submission!',
    };
  }

  const findingsSummary = buildFindingsSummary(findings);

  const systemPrompt = `You are ShipCheck AI, an expert code reviewer specialising in hackathon and open-source repository submission readiness.
Your role is to explain repository issues clearly, prioritise them for a developer under time pressure, and suggest concrete, actionable improvements.
Be concise, practical, and encouraging. Focus on impact. Do not repeat the finding title verbatim — add insight.`;

  const userPrompt = `Repository: ${metadata.fullName}
Score: ${score.total}/100 (Grade ${score.grade})
Language: ${metadata.language ?? 'Unknown'}
Description: ${metadata.description ?? 'None'}

Issues found (${nonPassFindings.length} total):
${findingsSummary}

Please respond with a valid JSON object with this exact shape:
{
  "summary": "<2-3 sentence overview of the repository's readiness state>",
  "prioritized": [
    {
      "priority": <1-based integer, 1 = most urgent>,
      "findingId": "<finding id string>",
      "title": "<short title>",
      "explanation": "<why this matters for submission readiness>",
      "suggestedAction": "<concrete step to fix it>"
    }
  ],
  "overallAdvice": "<1-2 sentence closing motivation and top tip>"
}

Include at most the top 8 prioritized fixes. Return only the JSON, no markdown fences.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as {
      summary?: string;
      prioritized?: PrioritizedFix[];
      overallAdvice?: string;
    };

    return {
      summary: parsed.summary ?? 'No summary generated.',
      prioritized: Array.isArray(parsed.prioritized) ? parsed.prioritized : [],
      overallAdvice: parsed.overallAdvice ?? '',
    };
  } catch (err) {
    console.error('[AIService] generateAIRecommendations error:', (err as Error).message);
    return null;
  }
}

// ─── Generate a single fix suggestion ───────────────────────────────────────

export async function generateFixSuggestion(
  request: FixSuggestionRequest,
  findings: Finding[]
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const finding = findings.find((f) => f.id === request.findingId);
  if (!finding) return null;

  const systemPrompt = `You are ShipCheck AI. A developer is asking for a concrete fix for a specific repository issue.
Provide a practical, copy-paste-ready solution or step-by-step instructions.
Be specific, not generic. Format code examples in markdown code blocks.`;

  const userPrompt = `Repository: ${request.repoUrl}
Issue ID: ${finding.id}
Category: ${finding.category}
Severity: ${finding.severity}
Title: ${finding.title}
Description: ${finding.description}
${finding.evidence ? `Evidence: ${finding.evidence}` : ''}
${request.context ? `Additional context from the user: ${request.context}` : ''}

Provide a detailed, actionable fix for this specific issue. Include:
1. Why this issue matters
2. Exact steps or code to fix it
3. How to verify the fix worked`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error('[AIService] generateFixSuggestion error:', (err as Error).message);
    return null;
  }
}

// ─── Graceful fallback recommendations (no API key) ──────────────────────────

export function buildFallbackRecommendations(
  findings: Finding[],
  score: ReadinessScore
): AIRecommendation {
  const critical = findings.filter((f) => f.severity === 'critical');
  const warnings = findings.filter((f) => f.severity === 'warning');

  const prioritized: PrioritizedFix[] = [
    ...critical.slice(0, 5),
    ...warnings.slice(0, 3),
  ].map((f, i) => ({
    priority: i + 1,
    findingId: f.id,
    title: f.title,
    explanation: f.description,
    suggestedAction: f.suggestion ?? 'See the finding description for guidance.',
  }));

  let summary = '';
  if (score.total >= 80) {
    summary = `This repository scores ${score.total}/100 and is largely ready for submission. A few improvements could push it further.`;
  } else if (score.total >= 60) {
    summary = `The repository scores ${score.total}/100. There are ${critical.length} critical issue(s) and ${warnings.length} warning(s) that should be addressed before submission.`;
  } else {
    summary = `This repository scores ${score.total}/100 and needs significant work before it's submission-ready. Focus on the critical issues first.`;
  }

  return {
    summary,
    prioritized,
    overallAdvice:
      critical.length > 0
        ? `Start by resolving the ${critical.length} critical issue(s) — they have the biggest impact on your score.`
        : 'Address the warnings to improve your score and make a stronger impression on reviewers.',
  };
}
