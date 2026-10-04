import { Finding, RepoContext } from '../../types/index';

/**
 * Repository hygiene checker — evaluates repo description, topics,
 * contributing guide, changelog, and general housekeeping.
 */
export function checkRepoHygiene(ctx: RepoContext): Finding[] {
  const findings: Finding[] = [];
  const { metadata } = ctx;
  const paths = ctx.tree.map((e) => e.path.toLowerCase());
  const hasPath = (p: string) => paths.includes(p.toLowerCase());

  // ── 1. Repository description ─────────────────────────────────────────────

  if (!metadata.description || metadata.description.trim().length < 10) {
    findings.push({
      id: 'hygiene_no_description',
      category: 'repo_hygiene',
      severity: 'warning',
      title: 'Repository has no GitHub description',
      description:
        'The repository description (the short tagline shown on the GitHub page) is missing or too short.',
      suggestion: 'Add a one-line description in the repository settings on GitHub.',
    });
  } else {
    findings.push({
      id: 'hygiene_has_description',
      category: 'repo_hygiene',
      severity: 'pass',
      title: 'Repository has a GitHub description',
      description: `Description: "${metadata.description}"`,
    });
  }

  // ── 2. Topics / tags ──────────────────────────────────────────────────────

  if (!metadata.topics || metadata.topics.length === 0) {
    findings.push({
      id: 'hygiene_no_topics',
      category: 'repo_hygiene',
      severity: 'info',
      title: 'No repository topics set',
      description:
        'Topics help people discover your project. Hackathon repos often tag the event and tech stack.',
      suggestion:
        'Add relevant topics in GitHub repository settings (e.g., "hackathon", "react", "typescript").',
    });
  } else {
    findings.push({
      id: 'hygiene_has_topics',
      category: 'repo_hygiene',
      severity: 'pass',
      title: `Repository has ${metadata.topics.length} topic(s)`,
      description: `Topics: ${metadata.topics.join(', ')}.`,
    });
  }

  // ── 3. CONTRIBUTING.md ────────────────────────────────────────────────────

  const hasContributing =
    hasPath('contributing.md') || hasPath('docs/contributing.md');

  if (!hasContributing) {
    findings.push({
      id: 'hygiene_no_contributing',
      category: 'repo_hygiene',
      severity: 'info',
      title: 'No CONTRIBUTING.md found',
      description:
        'A CONTRIBUTING guide explains how others can contribute and shows the project is open to collaboration.',
      suggestion: 'Add CONTRIBUTING.md with guidelines for pull requests and issue reports.',
    });
  } else {
    findings.push({
      id: 'hygiene_has_contributing',
      category: 'repo_hygiene',
      severity: 'pass',
      title: 'CONTRIBUTING.md is present',
      description: 'Contribution guidelines were found.',
    });
  }

  // ── 4. CHANGELOG.md ───────────────────────────────────────────────────────

  const hasChangelog =
    hasPath('changelog.md') ||
    hasPath('changelog') ||
    hasPath('history.md') ||
    hasPath('releases.md');

  if (!hasChangelog) {
    findings.push({
      id: 'hygiene_no_changelog',
      category: 'repo_hygiene',
      severity: 'info',
      title: 'No CHANGELOG found',
      description:
        'A changelog helps reviewers see what has changed across versions.',
      suggestion: 'Add CHANGELOG.md tracking notable changes, or use GitHub Releases.',
    });
  } else {
    findings.push({
      id: 'hygiene_has_changelog',
      category: 'repo_hygiene',
      severity: 'pass',
      title: 'CHANGELOG is present',
      description: 'A changelog file was found.',
    });
  }

  // ── 5. Source code present ────────────────────────────────────────────────

  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go',
    '.rs', '.rb', '.php', '.cs', '.cpp', '.c', '.swift',
  ];
  const hasSourceCode = ctx.tree.some(
    (e) =>
      e.type === 'blob' &&
      codeExtensions.some((ext) => e.path.toLowerCase().endsWith(ext))
  );

  if (!hasSourceCode) {
    findings.push({
      id: 'hygiene_no_source_code',
      category: 'repo_hygiene',
      severity: 'critical',
      title: 'No source code files detected',
      description:
        'No recognisable source code files were found in the repository tree.',
      suggestion:
        'Ensure all source files are committed and not excluded by .gitignore.',
    });
  } else {
    const fileCount = ctx.tree.filter((e) => e.type === 'blob').length;
    findings.push({
      id: 'hygiene_has_source_code',
      category: 'repo_hygiene',
      severity: 'pass',
      title: 'Source code files are present',
      description: `Repository contains ${fileCount} file(s) including source code.`,
    });
  }

  // ── 6. Repository size sanity check ──────────────────────────────────────

  if (metadata.size === 0) {
    findings.push({
      id: 'hygiene_empty_repo',
      category: 'repo_hygiene',
      severity: 'critical',
      title: 'Repository appears to be empty',
      description: 'GitHub reports the repository size as 0 KB.',
      suggestion: 'Push your project files to the repository.',
    });
  }

  // ── 7. Recent activity ────────────────────────────────────────────────────

  const lastUpdated = new Date(metadata.updatedAt);
  const daysSinceUpdate = Math.floor(
    (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpdate > 180) {
    findings.push({
      id: 'hygiene_stale_repo',
      category: 'repo_hygiene',
      severity: 'info',
      title: 'Repository has not been updated recently',
      description: `Last update was ${daysSinceUpdate} days ago (${lastUpdated.toDateString()}).`,
      suggestion: 'Consider updating the project or adding a note in the README about its status.',
    });
  } else {
    findings.push({
      id: 'hygiene_recent_activity',
      category: 'repo_hygiene',
      severity: 'pass',
      title: 'Repository is recently active',
      description: `Last updated ${daysSinceUpdate} day(s) ago.`,
    });
  }

  // ── 8. Open issues ────────────────────────────────────────────────────────

  if (metadata.openIssues > 20) {
    findings.push({
      id: 'hygiene_many_open_issues',
      category: 'repo_hygiene',
      severity: 'info',
      title: `${metadata.openIssues} open issues`,
      description:
        'A large number of open issues may indicate maintenance debt.',
      suggestion: 'Review and close or label stale issues before submission.',
    });
  }

  return findings;
}
