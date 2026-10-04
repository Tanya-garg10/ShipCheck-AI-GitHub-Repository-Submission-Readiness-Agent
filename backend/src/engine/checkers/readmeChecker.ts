import { Finding, RepoContext } from '../../types/index';

/**
 * README checker — evaluates presence, length, and content completeness
 * of the repository README.
 */
export function checkReadme(ctx: RepoContext): Finding[] {
  const findings: Finding[] = [];
  const readme = ctx.readmeContent;

  // ── 1. README existence ───────────────────────────────────────────────────

  const hasReadme = ctx.tree.some((e) =>
    e.path.toLowerCase() === 'readme.md' ||
    e.path.toLowerCase() === 'readme.txt' ||
    e.path.toLowerCase() === 'readme'
  );

  if (!hasReadme || !readme) {
    findings.push({
      id: 'readme_missing',
      category: 'readme',
      severity: 'critical',
      title: 'README file is missing',
      description:
        'No README was found at the repository root. A README is the first thing reviewers and users see.',
      suggestion: 'Add a README.md at the root with project description, setup, and usage.',
    });
    // No point running further checks without content
    return findings;
  }

  const lower = readme.toLowerCase();
  const wordCount = readme.split(/\s+/).filter(Boolean).length;

  // ── 2. README length ──────────────────────────────────────────────────────

  if (wordCount < 50) {
    findings.push({
      id: 'readme_too_short',
      category: 'readme',
      severity: 'critical',
      title: 'README is too short',
      description: `The README contains only ~${wordCount} words. A meaningful README needs at least 50–100 words.`,
      evidence: `Word count: ${wordCount}`,
      suggestion: 'Expand the README with a project description, features, installation, and usage sections.',
    });
  } else if (wordCount < 150) {
    findings.push({
      id: 'readme_brief',
      category: 'readme',
      severity: 'warning',
      title: 'README is quite brief',
      description: `The README has ~${wordCount} words. A comprehensive README typically has 200+ words.`,
      evidence: `Word count: ${wordCount}`,
      suggestion: 'Consider expanding with more detail about architecture, contributing, and deployment.',
    });
  } else {
    findings.push({
      id: 'readme_length_ok',
      category: 'readme',
      severity: 'pass',
      title: 'README has sufficient length',
      description: `README contains ~${wordCount} words — enough to be informative.`,
    });
  }

  // ── 3. Project description ────────────────────────────────────────────────

  const hasDescription =
    lower.includes('about') ||
    lower.includes('overview') ||
    lower.includes('description') ||
    lower.includes('what is') ||
    lower.includes('introduction') ||
    (readme.split('\n').filter((l) => l.startsWith('#')).length > 0 && wordCount > 100);

  if (!hasDescription) {
    findings.push({
      id: 'readme_no_description',
      category: 'readme',
      severity: 'warning',
      title: 'README lacks a clear project description',
      description:
        'No obvious description, overview, or "About" section was detected.',
      suggestion: 'Add a short paragraph at the top explaining what the project does.',
    });
  } else {
    findings.push({
      id: 'readme_has_description',
      category: 'readme',
      severity: 'pass',
      title: 'README includes a project description',
      description: 'A description or overview section was detected.',
    });
  }

  // ── 4. Installation / Setup instructions ─────────────────────────────────

  const hasInstall =
    lower.includes('install') ||
    lower.includes('setup') ||
    lower.includes('getting started') ||
    lower.includes('quick start') ||
    lower.includes('npm install') ||
    lower.includes('pip install') ||
    lower.includes('yarn add') ||
    lower.includes('pnpm install') ||
    lower.includes('clone');

  if (!hasInstall) {
    findings.push({
      id: 'readme_no_install',
      category: 'readme',
      severity: 'critical',
      title: 'README missing installation instructions',
      description:
        'No installation or setup section was found. Reviewers need to know how to run the project.',
      suggestion: 'Add an ## Installation or ## Getting Started section with step-by-step commands.',
    });
  } else {
    findings.push({
      id: 'readme_has_install',
      category: 'readme',
      severity: 'pass',
      title: 'README includes installation instructions',
      description: 'Installation or setup instructions were detected.',
    });
  }

  // ── 5. Usage instructions ─────────────────────────────────────────────────

  const hasUsage =
    lower.includes('usage') ||
    lower.includes('how to use') ||
    lower.includes('getting started') ||
    lower.includes('run') ||
    lower.includes('example') ||
    lower.includes('demo') ||
    lower.includes('```');

  if (!hasUsage) {
    findings.push({
      id: 'readme_no_usage',
      category: 'readme',
      severity: 'warning',
      title: 'README missing usage instructions or examples',
      description: 'No usage section or code examples were detected.',
      suggestion: 'Add a ## Usage section with example commands or screenshots.',
    });
  } else {
    findings.push({
      id: 'readme_has_usage',
      category: 'readme',
      severity: 'pass',
      title: 'README includes usage information',
      description: 'Usage instructions or examples were detected.',
    });
  }

  // ── 6. Tech stack / Technologies ─────────────────────────────────────────

  const hasTechStack =
    lower.includes('tech stack') ||
    lower.includes('built with') ||
    lower.includes('technologies') ||
    lower.includes('framework') ||
    lower.includes('language') ||
    lower.includes('dependencies');

  if (!hasTechStack) {
    findings.push({
      id: 'readme_no_tech_stack',
      category: 'readme',
      severity: 'info',
      title: 'README does not mention the tech stack',
      description:
        'No tech stack or "built with" section was detected. Listing technologies helps reviewers assess the project quickly.',
      suggestion: 'Add a ## Tech Stack section listing the main languages, frameworks, and tools.',
    });
  } else {
    findings.push({
      id: 'readme_has_tech_stack',
      category: 'readme',
      severity: 'pass',
      title: 'README mentions the tech stack',
      description: 'Technology stack information was detected.',
    });
  }

  // ── 7. Demo link ──────────────────────────────────────────────────────────

  const hasDemoLink =
    lower.includes('demo') ||
    lower.includes('live') ||
    lower.includes('deployed') ||
    lower.includes('vercel.app') ||
    lower.includes('netlify.app') ||
    lower.includes('railway.app') ||
    lower.includes('render.com') ||
    lower.includes('heroku') ||
    lower.includes('github.io');

  if (!hasDemoLink) {
    findings.push({
      id: 'readme_no_demo',
      category: 'readme',
      severity: 'warning',
      title: 'No demo or live deployment link found',
      description:
        'Hackathon submissions typically require a live demo link. None was detected in the README.',
      suggestion: 'Deploy to Vercel, Netlify, or Railway and add a ## Demo section with the URL.',
    });
  } else {
    findings.push({
      id: 'readme_has_demo',
      category: 'readme',
      severity: 'pass',
      title: 'README includes a demo or deployment link',
      description: 'A demo or live deployment URL was detected.',
    });
  }

  // ── 8. Code blocks / formatting ───────────────────────────────────────────

  const hasCodeBlocks = readme.includes('```');
  if (!hasCodeBlocks) {
    findings.push({
      id: 'readme_no_code_blocks',
      category: 'readme',
      severity: 'info',
      title: 'README has no code blocks',
      description:
        'Fenced code blocks (```) make commands and examples much easier to follow.',
      suggestion: 'Wrap terminal commands and code snippets in ``` blocks.',
    });
  } else {
    findings.push({
      id: 'readme_has_code_blocks',
      category: 'readme',
      severity: 'pass',
      title: 'README uses code blocks for examples',
      description: 'Code blocks were detected — good formatting practice.',
    });
  }

  return findings;
}
