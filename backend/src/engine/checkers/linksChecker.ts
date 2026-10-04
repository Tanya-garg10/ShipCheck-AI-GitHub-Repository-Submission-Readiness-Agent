import axios from 'axios';
import { Finding, RepoContext } from '../../types/index';

// Max links to check (avoid hammering servers)
const MAX_LINKS_TO_CHECK = 8;
const LINK_TIMEOUT_MS = 8_000;

const URL_REGEX = /https?:\/\/[^\s\)>\]"'`]+/g;

// Known placeholder / template strings that aren't real URLs
const PLACEHOLDER_PATTERNS = [
  'your-', 'your_', 'example.com', 'placeholder',
  'add-your', 'insert-', 'todo', 'link-here', 'url-here',
  'ADD YOUR', 'DEMO_URL', 'REPO_URL', 'VIDEO_URL',
];

function isPlaceholder(url: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => url.includes(p));
}

async function checkUrl(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  // Clean trailing punctuation that may have been captured by the regex
  const clean = url.replace(/[.,;:!?)]+$/, '');
  try {
    const res = await axios.head(clean, {
      timeout: LINK_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true, // don't throw on 4xx/5xx
      headers: { 'User-Agent': 'ShipCheck-AI/1.0 (link-checker)' },
    });
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status };
  } catch (err: unknown) {
    // HEAD might be blocked — retry with GET
    try {
      const res = await axios.get(clean, {
        timeout: LINK_TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: { 'User-Agent': 'ShipCheck-AI/1.0 (link-checker)' },
        // Only download header, not body
        responseType: 'stream',
      });
      res.data.destroy?.();
      const ok = res.status >= 200 && res.status < 400;
      return { ok, status: res.status };
    } catch {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  }
}

export async function checkLinks(ctx: RepoContext): Promise<Finding[]> {
  const findings: Finding[] = [];
  const readme = ctx.readmeContent ?? '';

  // ── 1. Extract all URLs from README ──────────────────────────────────────

  const rawMatches = readme.match(URL_REGEX) ?? [];
  const allUrls = [...new Set(rawMatches.map((u) => u.replace(/[.,;:!?)]+$/, '')))]
    .filter((u) => !isPlaceholder(u));

  if (allUrls.length === 0) {
    findings.push({
      id: 'links_no_urls_found',
      category: 'links',
      severity: 'info',
      title: 'No URLs found in README',
      description:
        'No external links were detected in the README. Consider adding links to demo, docs, or related resources.',
      suggestion: 'Add a demo URL, documentation link, or related project links to the README.',
    });
    return findings;
  }

  findings.push({
    id: 'links_urls_detected',
    category: 'links',
    severity: 'pass',
    title: `${allUrls.length} URL(s) found in README`,
    description: 'External links were detected and will be validated.',
  });

  // ── 2. Detect placeholder links ───────────────────────────────────────────

  const placeholderUrls = rawMatches.filter(isPlaceholder);
  if (placeholderUrls.length > 0) {
    findings.push({
      id: 'links_placeholder_urls',
      category: 'links',
      severity: 'critical',
      title: 'Placeholder URLs found in README',
      description:
        `${placeholderUrls.length} URL(s) appear to be placeholder text, not real links.`,
      evidence: placeholderUrls.slice(0, 3).join(', '),
      suggestion: 'Replace all placeholder URLs with actual links before submission.',
    });
  }

  // ── 3. Check live reachability ────────────────────────────────────────────

  // Prioritise demo / deployment links
  const priorityKeywords = ['demo', 'live', 'app', 'deploy', 'vercel', 'netlify', 'railway', 'render', 'heroku'];
  const sorted = [...allUrls].sort((a, b) => {
    const aScore = priorityKeywords.some((k) => a.toLowerCase().includes(k)) ? -1 : 0;
    const bScore = priorityKeywords.some((k) => b.toLowerCase().includes(k)) ? -1 : 0;
    return aScore - bScore;
  });

  const toCheck = sorted.slice(0, MAX_LINKS_TO_CHECK);

  const results = await Promise.allSettled(
    toCheck.map(async (url) => ({ url, result: await checkUrl(url) }))
  );

  const broken: string[] = [];
  const checked: string[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { url, result } = r.value;
      checked.push(url);
      if (!result.ok) {
        broken.push(`${url} (${result.status ?? result.error ?? 'unreachable'})`);
      }
    }
  }

  if (broken.length > 0) {
    findings.push({
      id: 'links_broken_urls',
      category: 'links',
      severity: 'warning',
      title: `${broken.length} broken or unreachable URL(s) detected`,
      description:
        'Some links in the README returned errors or could not be reached. Broken links hurt credibility.',
      evidence: broken.slice(0, 5).join(' | '),
      suggestion: 'Verify all links are correct and the deployed services are accessible.',
    });
  } else if (checked.length > 0) {
    findings.push({
      id: 'links_all_ok',
      category: 'links',
      severity: 'pass',
      title: `All ${checked.length} checked URL(s) are reachable`,
      description: 'Every link that was validated returned a successful HTTP response.',
    });
  }

  return findings;
}
