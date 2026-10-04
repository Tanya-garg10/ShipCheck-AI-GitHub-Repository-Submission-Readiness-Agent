import { describe, it, expect } from 'vitest';
import { computeScore } from '../engine/scorer';
import { Finding } from '../types/index';

const pass = (id: string, category: Finding['category']): Finding => ({
  id,
  category,
  severity: 'pass',
  title: 'ok',
  description: 'ok',
});

const critical = (id: string, category: Finding['category']): Finding => ({
  id,
  category,
  severity: 'critical',
  title: 'critical issue',
  description: 'something critical',
});

const warning = (id: string, category: Finding['category']): Finding => ({
  id,
  category,
  severity: 'warning',
  title: 'warning',
  description: 'something to fix',
});

describe('computeScore', () => {
  it('returns 100 when all findings are pass', () => {
    const findings: Finding[] = [
      pass('a', 'readme'),
      pass('b', 'build_config'),
      pass('c', 'security'),
      pass('d', 'links'),
      pass('e', 'repo_hygiene'),
      pass('f', 'license'),
    ];
    const score = computeScore(findings);
    expect(score.total).toBe(100);
    expect(score.grade).toBe('A');
  });

  it('deducts 20 points per critical finding, capped at 0 per category', () => {
    const findings: Finding[] = [
      critical('readme_missing', 'readme'),
    ];
    const score = computeScore(findings);
    // readme starts at 30, loses 20 → 10
    expect(score.breakdown.readme).toBe(10);
    // other categories untouched
    expect(score.breakdown.build_config).toBe(20);
  });

  it('deducts 8 points per warning', () => {
    const findings: Finding[] = [
      warning('warn1', 'readme'),
    ];
    const score = computeScore(findings);
    expect(score.breakdown.readme).toBe(22); // 30 - 8
  });

  it('does not drop a category score below 0', () => {
    const findings: Finding[] = [
      critical('c1', 'license'),
      critical('c2', 'license'),
      critical('c3', 'license'),
    ];
    // license starts at 8, 3 criticals = -60, capped at 0
    const score = computeScore(findings);
    expect(score.breakdown.license).toBe(0);
    expect(score.breakdown.license).toBeGreaterThanOrEqual(0);
  });

  it('assigns correct grades', () => {
    expect(computeScore([pass('a', 'readme')]).grade).toBe('A'); // 100 with only one finding
    // simulate a lower score by stacking criticals across categories
    const lotsOfCriticals: Finding[] = [
      critical('c1', 'readme'), critical('c2', 'readme'),
      critical('c3', 'build_config'), critical('c4', 'build_config'),
      critical('c5', 'security'), critical('c6', 'security'),
      critical('c7', 'links'), critical('c8', 'repo_hygiene'),
      critical('c9', 'license'),
    ];
    const lowScore = computeScore(lotsOfCriticals);
    expect(['D', 'F']).toContain(lowScore.grade);
  });
});
