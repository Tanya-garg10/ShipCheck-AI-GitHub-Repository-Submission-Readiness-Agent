// Mirrors backend types/index.ts — keep in sync

export type Severity = 'critical' | 'warning' | 'info' | 'pass';

export type CheckCategory =
  | 'readme'
  | 'build_config'
  | 'security'
  | 'links'
  | 'repo_hygiene'
  | 'license';

export interface Finding {
  id: string;
  category: CheckCategory;
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;
  suggestion?: string;
}

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
  size: number;
}

export interface ReadinessScore {
  total: number;
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

export interface PrioritizedFix {
  priority: number;
  findingId: string;
  title: string;
  explanation: string;
  suggestedAction: string;
}

export interface AIRecommendation {
  summary: string;
  prioritized: PrioritizedFix[];
  overallAdvice: string;
}

export interface ReadinessReport {
  repoUrl: string;
  analyzedAt: string;
  metadata: RepoMetadata;
  findings: Finding[];
  score: ReadinessScore;
  aiRecommendations: AIRecommendation | null;
  checkDurationMs: number;
}

export interface AnalyzeResponse {
  success: boolean;
  report?: ReadinessReport;
  error?: string;
}

export interface FixSuggestionResponse {
  success: boolean;
  suggestion?: string;
  error?: string;
}
