import { Finding, RepoContext } from '../../types/index';

const COMMON_OSS_LICENSES = [
  'MIT', 'Apache-2.0', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0',
  'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'MPL-2.0', 'AGPL-3.0',
  'CC0-1.0', 'Unlicense',
];

export function checkLicense(ctx: RepoContext): Finding[] {
  const findings: Finding[] = [];
  const paths = ctx.tree.map((e) => e.path.toLowerCase());

  // ── 1. License file on disk ──────────────────────────────────────────────

  const hasLicenseFile =
    paths.includes('license') ||
    paths.includes('license.md') ||
    paths.includes('license.txt') ||
    paths.includes('licence') ||
    paths.includes('licence.md');

  // ── 2. GitHub-detected license ───────────────────────────────────────────

  const githubLicense = ctx.metadata.license;

  if (!hasLicenseFile && !githubLicense) {
    findings.push({
      id: 'license_missing',
      category: 'license',
      severity: 'critical',
      title: 'No license file found',
      description:
        'Without a license, the project is technically "All Rights Reserved" and others cannot legally use, modify, or distribute it. Most hackathons and open-source repositories require a license.',
      suggestion:
        'Add a LICENSE file. For hackathons, MIT is a common permissive choice.',
    });
  } else {
    const licenseId = githubLicense ?? 'Unknown';
    const isRecognised = COMMON_OSS_LICENSES.includes(licenseId);

    findings.push({
      id: 'license_present',
      category: 'license',
      severity: 'pass',
      title: `License file found${githubLicense ? ` (${githubLicense})` : ''}`,
      description: isRecognised
        ? `A recognised open-source license (${licenseId}) is in place.`
        : 'A license file is present. Ensure the license is appropriate for your use case.',
    });

    if (githubLicense === 'NOASSERTION') {
      findings.push({
        id: 'license_unrecognised',
        category: 'license',
        severity: 'warning',
        title: 'License not recognised by GitHub',
        description:
          'A license file is present but GitHub could not identify its type. This may happen with custom or non-standard licenses.',
        suggestion:
          'Use a standard SPDX license identifier. Consider replacing with MIT or Apache-2.0.',
      });
    }
  }

  return findings;
}
