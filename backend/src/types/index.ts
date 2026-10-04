// ─── Severity levels ────────────────────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info' | 'pass';

// ─── A single check finding ──────────────────────────────────────────────────

export interface Finding {
  id: string;
  category: CheckCategory;
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;        // concrete snippet/path that triggered the finding
  suggestion?: string;      // one-line quick fix hint
}

// ─── Check categories ────────────────────────────────────────────────────────

export type CheckCategory =
  | 'readme'
  | 'build_config'
  | 'security'
  | 'links'
  | 'repo_hygiene'
  | 'license';

// ─── Repository metadata fetched from GitHub ────────────────────────────────

export interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  topics: string[];
  hasWiki: boolean;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  size: number;   // KB
}

// ─── File tree entry ─────────────────────────────────────────────────────────

export interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

// ─── Collected repository context (raw evidence passed to rule engine) ───────

export interface RepoContext {
  metadata: RepoMetadata;
  tree: TreeEntry[];
  readmeContent: string | null;
  packageJsonContent: string | null;
  /** Map from file path → raw content for a select set of important files */
  fileContents: Record<string, string>;
}

// ─── Readiness score ─────────────────────────────────────────────────────────

export interface ReadinessScore {
  total: number;          // 0–100
  breakdown: {
    readme: number;
    build_config: number;
    security: number;
    links: number;
    repo_hygiene: number;
    license: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ─── AI recommendation ───────────────────────────────────────────────────────

export interface AIRecommendation {
  summary: string;
  prioritized: PrioritizedFix[];
  overallAdvice: string;
}

export interface PrioritizedFix {
  priority: number;   // 1 = highest
  findingId: string;
  title: string;
  explanation: string;
  suggestedAction: string;
}

// ─── Final readiness report (API response) ──────────────────────────────────

export interface ReadinessReport {
  repoUrl: string;
  analyzedAt: string;
  metadata: RepoMetadata;
  findings: Finding[];
  score: ReadinessScore;
  aiRecommendations: AIRecommendation | null;
  checkDurationMs: number;
}

// ─── API request / response shapes ──────────────────────────────────────────

export interface AnalyzeRequest {
  repoUrl: string;
  includeAI?: boolean;   // default true
}

export interface AnalyzeResponse {
  success: boolean;
  report?: ReadinessReport;
  error?: string;
}

export interface FixSuggestionRequest {
  repoUrl: string;
  findingId: string;
  context?: string;
}

export interface FixSuggestionResponse {
  success: boolean;
  suggestion?: string;
  error?: string;
}
