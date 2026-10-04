import { Finding, RepoContext } from '../../types/index';

/**
 * Security checker — detects potential secret leaks, missing env templates,
 * and other security hygiene issues. Never exposes actual secret values.
 */

// Patterns that suggest a real secret value (not a placeholder)
const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key', pattern: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/i },
  { name: 'GitHub Token', pattern: /ghp_[A-Za-z0-9]{36}/ },
  { name: 'GitHub App Token', pattern: /ghs_[A-Za-z0-9]{36}/ },
  { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{48,}/ },
  { name: 'Stripe Secret Key', pattern: /sk_live_[A-Za-z0-9]{24,}/ },
  { name: 'Stripe Test Key', pattern: /sk_test_[A-Za-z0-9]{24,}/ },
  { name: 'Twilio Account SID', pattern: /AC[a-zA-Z0-9]{32}/ },
  { name: 'Twilio Auth Token', pattern: /SK[a-zA-Z0-9]{32}/ },
  { name: 'Generic high-entropy secret', pattern: /(?:secret|password|passwd|api[_-]?key|token|auth)[_-]?\w*\s*[:=]\s*['"]?[A-Za-z0-9+/=!@#$%^&*]{20,}['"]?/i },
  { name: 'Private key header', pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: 'Connection string with password', pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]{6,}@/ },
];

// Placeholders that look like secrets but are clearly not real values
const PLACEHOLDER_HINTS = [
  'your_', 'your-', 'placeholder', 'example', 'changeme',
  'xxxx', '<secret', 'insert_', 'add_your', 'put_your',
  'replace_', 'todo', '...', '***',
];

function isLikelyPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_HINTS.some((hint) => lower.includes(hint));
}

// Files that should NEVER contain real secret values
const SENSITIVE_FILE_NAMES = [
  '.env', 'config.js', 'config.ts', 'config.json',
  'secrets.json', 'credentials.json', 'keys.json',
  'settings.py', 'local_settings.py',
];

export function checkSecurity(ctx: RepoContext): Finding[] {
  const findings: Finding[] = [];
  const paths = ctx.tree.map((e) => e.path.toLowerCase());

  // ── 1. .env file committed ────────────────────────────────────────────────

  const committedEnvFiles = ctx.tree
    .filter((e) => {
      const name = e.path.split('/').pop()?.toLowerCase() ?? '';
      return (
        name === '.env' ||
        (name.startsWith('.env.') &&
          !name.includes('example') &&
          !name.includes('sample') &&
          !name.includes('template'))
      );
    })
    .map((e) => e.path);

  if (committedEnvFiles.length > 0) {
    findings.push({
      id: 'security_env_committed',
      category: 'security',
      severity: 'critical',
      title: '.env file committed to repository',
      description:
        'One or more .env files are tracked in the repository. These may contain real secrets.',
      evidence: committedEnvFiles.join(', '),
      suggestion:
        'Remove .env files from git history and add them to .gitignore. Rotate any exposed credentials immediately.',
    });
  }

  // ── 2. .env.example / template present ───────────────────────────────────

  const hasEnvTemplate =
    paths.includes('.env.example') ||
    paths.includes('.env.sample') ||
    paths.includes('.env.template');

  if (!hasEnvTemplate) {
    findings.push({
      id: 'security_no_env_example',
      category: 'security',
      severity: 'warning',
      title: 'No .env.example template found',
      description:
        'An .env.example file documents required environment variables without exposing real values.',
      suggestion:
        'Create .env.example listing all required environment variables with placeholder values.',
    });
  } else {
    findings.push({
      id: 'security_has_env_example',
      category: 'security',
      severity: 'pass',
      title: '.env.example template is present',
      description: 'An environment variable template file was found — good practice.',
    });
  }

  // ── 3. Scan file contents for secret patterns ─────────────────────────────

  const leaks: Array<{ file: string; secretType: string }> = [];

  for (const [filePath, content] of Object.entries(ctx.fileContents)) {
    // Skip example/template files — they're expected to document key names
    const lower = filePath.toLowerCase();
    if (
      lower.includes('example') ||
      lower.includes('sample') ||
      lower.includes('template') ||
      lower.includes('.md')
    ) continue;

    for (const { name, pattern } of SECRET_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        const matchedStr = match[0];
        if (!isLikelyPlaceholder(matchedStr)) {
          leaks.push({ file: filePath, secretType: name });
          break; // one finding per file is enough
        }
      }
    }
  }

  if (leaks.length > 0) {
    findings.push({
      id: 'security_secrets_detected',
      category: 'security',
      severity: 'critical',
      title: 'Potential secrets detected in tracked files',
      description:
        `Possible secret values were found in ${leaks.length} file(s). Review and rotate any real credentials.`,
      evidence: leaks
        .map((l) => `${l.file} (${l.secretType})`)
        .join('; '),
      suggestion:
        'Use environment variables or a secrets manager. Remove secrets from git history with git-filter-repo.',
    });
  } else {
    findings.push({
      id: 'security_no_secrets_detected',
      category: 'security',
      severity: 'pass',
      title: 'No obvious secret patterns detected',
      description:
        'No known secret patterns were found in the scanned files. Note: this is a surface-level scan.',
    });
  }

  // ── 4. Sensitive files that probably should not be committed ──────────────

  const committedSensitive = ctx.tree
    .filter((e) => {
      const name = e.path.split('/').pop()?.toLowerCase() ?? '';
      return SENSITIVE_FILE_NAMES.includes(name);
    })
    .map((e) => e.path)
    .filter(
      (p) =>
        !p.toLowerCase().includes('example') &&
        !p.toLowerCase().includes('sample')
    );

  if (committedSensitive.length > 0) {
    findings.push({
      id: 'security_sensitive_files',
      category: 'security',
      severity: 'warning',
      title: 'Potentially sensitive configuration files committed',
      description: `Files that sometimes contain secrets are tracked: ${committedSensitive.join(', ')}`,
      evidence: committedSensitive.join(', '),
      suggestion:
        'Verify these files contain no real credentials. Consider templating them.',
    });
  }

  // ── 5. SECURITY.md ────────────────────────────────────────────────────────

  const hasSecurityPolicy = paths.includes('security.md');
  if (!hasSecurityPolicy) {
    findings.push({
      id: 'security_no_policy',
      category: 'security',
      severity: 'info',
      title: 'No SECURITY.md file',
      description:
        'A SECURITY.md file explains how to responsibly disclose vulnerabilities.',
      suggestion: 'Add SECURITY.md with contact information and vulnerability reporting guidelines.',
    });
  } else {
    findings.push({
      id: 'security_has_policy',
      category: 'security',
      severity: 'pass',
      title: 'SECURITY.md policy file is present',
      description: 'A security policy file was found.',
    });
  }

  return findings;
}
