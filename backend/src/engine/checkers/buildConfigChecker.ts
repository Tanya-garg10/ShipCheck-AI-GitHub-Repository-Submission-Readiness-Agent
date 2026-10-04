import { Finding, RepoContext } from '../../types/index';

/**
 * Build config checker — evaluates package configuration, scripts,
 * lock files, and essential dev files.
 */
export function checkBuildConfig(ctx: RepoContext): Finding[] {
  const findings: Finding[] = [];
  const paths = ctx.tree.map((e) => e.path.toLowerCase());
  const hasPath = (p: string) => paths.includes(p.toLowerCase());
  const hasPathPrefix = (prefix: string) =>
    paths.some((p) => p.startsWith(prefix.toLowerCase()));

  // ── Detect project type ────────────────────────────────────────────────────

  const isNode = hasPath('package.json');
  const isPython =
    hasPath('requirements.txt') ||
    hasPath('setup.py') ||
    hasPath('pyproject.toml') ||
    hasPath('pipfile');
  const isJava =
    hasPath('pom.xml') || hasPath('build.gradle') || hasPath('build.gradle.kts');
  const isRust = hasPath('cargo.toml');
  const isGo = hasPath('go.mod');
  const isDotnet =
    paths.some((p) => p.endsWith('.csproj') || p.endsWith('.sln'));

  const knownProjectType =
    isNode || isPython || isJava || isRust || isGo || isDotnet;

  if (!knownProjectType) {
    findings.push({
      id: 'build_no_config_detected',
      category: 'build_config',
      severity: 'warning',
      title: 'No recognised project configuration file found',
      description:
        'Could not detect a package.json, requirements.txt, pom.xml, Cargo.toml, go.mod, or similar. This may indicate the repo has no buildable code, or the project type is unusual.',
      suggestion:
        'Ensure the appropriate dependency/build file is committed to the repository root.',
    });
  }

  // ── Node.js / npm checks ───────────────────────────────────────────────────

  if (isNode) {
    findings.push({
      id: 'build_has_package_json',
      category: 'build_config',
      severity: 'pass',
      title: 'package.json found',
      description: 'A package.json is present at the repository root.',
    });

    const pkg = ctx.packageJsonContent;
    if (pkg) {
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(pkg) as Record<string, unknown>;
      } catch {
        findings.push({
          id: 'build_package_json_invalid',
          category: 'build_config',
          severity: 'critical',
          title: 'package.json is not valid JSON',
          description: 'package.json could not be parsed — it contains a syntax error.',
          suggestion: 'Fix the JSON syntax error in package.json.',
        });
      }

      if (parsed) {
        // description field
        if (!parsed.description || (parsed.description as string).trim() === '') {
          findings.push({
            id: 'build_pkg_no_description',
            category: 'build_config',
            severity: 'info',
            title: 'package.json missing "description" field',
            description: 'The "description" field is empty or absent.',
            suggestion: 'Add a meaningful "description" to package.json.',
          });
        }

        // scripts
        const scripts = (parsed.scripts as Record<string, string> | undefined) ?? {};
        const scriptNames = Object.keys(scripts);

        if (scriptNames.length === 0) {
          findings.push({
            id: 'build_pkg_no_scripts',
            category: 'build_config',
            severity: 'warning',
            title: 'package.json has no scripts defined',
            description: 'No scripts section found. Reviewers expect at least a "start" or "dev" script.',
            suggestion: 'Add "start", "dev", and "build" scripts to package.json.',
          });
        } else {
          const hasStart = 'start' in scripts || 'dev' in scripts;
          const hasBuild = 'build' in scripts;
          const hasTest = 'test' in scripts;

          if (!hasStart) {
            findings.push({
              id: 'build_pkg_no_start',
              category: 'build_config',
              severity: 'warning',
              title: 'No "start" or "dev" script in package.json',
              description:
                'A "start" or "dev" script helps reviewers quickly run the project.',
              suggestion: 'Add "start": "node dist/index.js" or "dev": "ts-node-dev src/index.ts".',
            });
          } else {
            findings.push({
              id: 'build_pkg_has_start',
              category: 'build_config',
              severity: 'pass',
              title: 'package.json has a start/dev script',
              description: `Found scripts: ${scriptNames.join(', ')}.`,
            });
          }

          if (!hasBuild) {
            findings.push({
              id: 'build_pkg_no_build',
              category: 'build_config',
              severity: 'info',
              title: 'No "build" script in package.json',
              description: 'A build script ensures the project can be compiled/bundled for production.',
              suggestion: 'Add "build": "tsc" or "build": "vite build" to package.json.',
            });
          }

          if (!hasTest) {
            findings.push({
              id: 'build_pkg_no_test',
              category: 'build_config',
              severity: 'info',
              title: 'No "test" script in package.json',
              description: 'Tests demonstrate code quality to reviewers.',
              suggestion: 'Add "test": "vitest run" or "test": "jest" to package.json.',
            });
          }
        }

        // engines field
        if (!parsed.engines) {
          findings.push({
            id: 'build_pkg_no_engines',
            category: 'build_config',
            severity: 'info',
            title: 'package.json missing "engines" field',
            description:
              'Specifying Node.js version requirements prevents compatibility issues.',
            suggestion: 'Add "engines": { "node": ">=18.0.0" } to package.json.',
          });
        }
      }
    }

    // Lock file
    const hasLockFile =
      hasPath('package-lock.json') ||
      hasPath('yarn.lock') ||
      hasPath('pnpm-lock.yaml');

    if (!hasLockFile) {
      findings.push({
        id: 'build_no_lock_file',
        category: 'build_config',
        severity: 'warning',
        title: 'No dependency lock file found',
        description:
          'Lock files (package-lock.json, yarn.lock, pnpm-lock.yaml) ensure reproducible installs.',
        suggestion: 'Commit your lock file to the repository.',
      });
    } else {
      findings.push({
        id: 'build_has_lock_file',
        category: 'build_config',
        severity: 'pass',
        title: 'Dependency lock file is present',
        description: 'A lock file ensures reproducible dependency installation.',
      });
    }
  }

  // ── Python checks ──────────────────────────────────────────────────────────

  if (isPython) {
    findings.push({
      id: 'build_has_python_config',
      category: 'build_config',
      severity: 'pass',
      title: 'Python project configuration found',
      description: 'requirements.txt, setup.py, or pyproject.toml detected.',
    });
  }

  // ── Docker ─────────────────────────────────────────────────────────────────

  const hasDocker =
    hasPath('dockerfile') ||
    hasPath('docker-compose.yml') ||
    hasPath('docker-compose.yaml');

  if (hasDocker) {
    findings.push({
      id: 'build_has_docker',
      category: 'build_config',
      severity: 'pass',
      title: 'Docker configuration present',
      description: 'Dockerfile or docker-compose file found — the project is containerised.',
    });
  }

  // ── CI/CD ──────────────────────────────────────────────────────────────────

  const hasCI =
    hasPathPrefix('.github/workflows/') ||
    hasPath('.travis.yml') ||
    hasPath('circle.yml') ||
    hasPath('.circleci/config.yml') ||
    hasPath('Jenkinsfile') ||
    hasPath('.gitlab-ci.yml');

  if (!hasCI) {
    findings.push({
      id: 'build_no_ci',
      category: 'build_config',
      severity: 'info',
      title: 'No CI/CD configuration found',
      description:
        'Continuous integration workflows (GitHub Actions, CircleCI, etc.) demonstrate project maturity.',
      suggestion: 'Add a GitHub Actions workflow for linting and tests.',
    });
  } else {
    findings.push({
      id: 'build_has_ci',
      category: 'build_config',
      severity: 'pass',
      title: 'CI/CD configuration detected',
      description: 'A CI/CD pipeline configuration was found.',
    });
  }

  // ── .gitignore ─────────────────────────────────────────────────────────────

  const hasGitignore = hasPath('.gitignore');
  if (!hasGitignore) {
    findings.push({
      id: 'build_no_gitignore',
      category: 'build_config',
      severity: 'warning',
      title: 'No .gitignore found',
      description:
        'Without a .gitignore, build artifacts and secrets may be accidentally committed.',
      suggestion: 'Add a .gitignore appropriate for your project type.',
    });
  } else {
    findings.push({
      id: 'build_has_gitignore',
      category: 'build_config',
      severity: 'pass',
      title: '.gitignore is present',
      description: 'A .gitignore file helps keep build artifacts and secrets out of the repo.',
    });
  }

  return findings;
}
