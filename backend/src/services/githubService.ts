import axios, { AxiosInstance } from 'axios';
import { RepoContext, RepoMetadata, TreeEntry } from '../types/index';

// ─── Files we proactively fetch content for ──────────────────────────────────

const IMPORTANT_FILES = [
  'README.md', 'readme.md', 'README.MD',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.env.example', '.env.sample', '.env.template',
  '.gitignore',
  'LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'Dockerfile',
  'docker-compose.yml', 'docker-compose.yaml',
  '.github/workflows',
  'requirements.txt',
  'setup.py',
  'pyproject.toml',
  'Makefile',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
];

const MAX_FILE_SIZE_BYTES = 150_000; // 150 KB cap per file

// ─── Parse owner/repo from a GitHub URL ──────────────────────────────────────

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const cleaned = url
    .trim()
    .replace(/\/$/, '')
    .replace(/\.git$/, '');

  // Handles:
  //   https://github.com/owner/repo
  //   github.com/owner/repo
  //   owner/repo
  const match = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/
  ) ?? cleaned.match(/^([^/]+)\/([^/]+)$/);

  if (!match) {
    throw new Error(
      `Invalid GitHub URL. Expected format: https://github.com/owner/repo — got: "${url}"`
    );
  }

  return { owner: match[1], repo: match[2] };
}

// ─── GitHub service class ────────────────────────────────────────────────────

export class GitHubService {
  private client: AxiosInstance;

  constructor(token?: string) {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers,
      timeout: 15_000,
    });
  }

  // ── Fetch repository metadata ───────────────────────────────────────────────

  async getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
    const { data } = await this.client.get(`/repos/${owner}/${repo}`);

    return {
      owner,
      name: data.name as string,
      fullName: data.full_name as string,
      description: (data.description as string | null) ?? null,
      defaultBranch: (data.default_branch as string) ?? 'main',
      isPrivate: data.private as boolean,
      stars: data.stargazers_count as number,
      forks: data.forks_count as number,
      openIssues: data.open_issues_count as number,
      language: (data.language as string | null) ?? null,
      topics: (data.topics as string[]) ?? [],
      hasWiki: data.has_wiki as boolean,
      license: (data.license as { spdx_id?: string } | null)?.spdx_id ?? null,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      size: data.size as number,
    };
  }

  // ── Fetch flat file tree (recursive) ───────────────────────────────────────

  async getFileTree(owner: string, repo: string, branch: string): Promise<TreeEntry[]> {
    try {
      const { data } = await this.client.get(
        `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      );

      if (data.truncated) {
        console.warn(`[GitHubService] Tree truncated for ${owner}/${repo} — very large repo`);
      }

      return ((data.tree as Array<{ path: string; type: string; size?: number }>) ?? [])
        .filter((e) => e.path && e.type)
        .map((e) => ({
          path: e.path,
          type: e.type as 'blob' | 'tree',
          size: e.size,
        }));
    } catch {
      console.warn(`[GitHubService] Could not fetch tree for branch "${branch}", returning empty`);
      return [];
    }
  }

  // ── Fetch raw file content (base64 decoded) ─────────────────────────────────

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const { data } = await this.client.get(
        `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`
      );

      if (data.type !== 'file') return null;
      if ((data.size as number) > MAX_FILE_SIZE_BYTES) {
        console.warn(`[GitHubService] Skipping ${path} — too large (${data.size} bytes)`);
        return null;
      }

      const content = (data.content as string).replace(/\n/g, '');
      return Buffer.from(content, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  // ── Build full RepoContext ──────────────────────────────────────────────────

  async buildRepoContext(repoUrl: string): Promise<RepoContext> {
    const { owner, repo } = parseGitHubUrl(repoUrl);

    // Fetch metadata first so we know the default branch
    const metadata = await this.getRepoMetadata(owner, repo);
    const { defaultBranch } = metadata;

    // Fetch file tree
    const tree = await this.getFileTree(owner, repo, defaultBranch);

    // Build a set of paths that exist in the repo for quick lookups
    const existingPaths = new Set(tree.map((e) => e.path.toLowerCase()));

    // Determine which important files exist and fetch them in parallel
    const toFetch = IMPORTANT_FILES.filter((f) => {
      // Also try exact casing
      return existingPaths.has(f.toLowerCase()) || tree.some((e) => e.path === f);
    });

    // Also scan tree for any workflow YAML files
    const workflowFiles = tree
      .filter((e) => e.type === 'blob' && e.path.startsWith('.github/workflows/'))
      .slice(0, 3) // limit to 3 workflow files
      .map((e) => e.path);

    const allToFetch = [...new Set([...toFetch, ...workflowFiles])];

    // Resolve actual cased path from tree
    const resolveActualPath = (target: string): string => {
      const found = tree.find(
        (e) => e.path.toLowerCase() === target.toLowerCase()
      );
      return found?.path ?? target;
    };

    const fetchResults = await Promise.allSettled(
      allToFetch.map(async (f) => {
        const actualPath = resolveActualPath(f);
        const content = await this.getFileContent(owner, repo, actualPath);
        return { path: actualPath, content };
      })
    );

    const fileContents: Record<string, string> = {};
    for (const result of fetchResults) {
      if (result.status === 'fulfilled' && result.value.content !== null) {
        fileContents[result.value.path] = result.value.content;
      }
    }

    // Extract commonly used files for convenience
    const readmeKey = Object.keys(fileContents).find((k) =>
      k.toLowerCase() === 'readme.md'
    );
    const pkgKey = Object.keys(fileContents).find((k) => k === 'package.json');

    return {
      metadata,
      tree,
      readmeContent: readmeKey ? fileContents[readmeKey] : null,
      packageJsonContent: pkgKey ? fileContents[pkgKey] : null,
      fileContents,
    };
  }
}

// ─── Singleton factory ───────────────────────────────────────────────────────

let _instance: GitHubService | null = null;

export function getGitHubService(): GitHubService {
  if (!_instance) {
    _instance = new GitHubService(process.env.GITHUB_TOKEN);
  }
  return _instance;
}
