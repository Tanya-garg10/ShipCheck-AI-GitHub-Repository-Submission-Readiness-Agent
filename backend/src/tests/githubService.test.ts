import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../services/githubService';

describe('parseGitHubUrl', () => {
  it('parses a full HTTPS URL', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('parses a URL with trailing slash', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react/');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('parses a URL with .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react.git');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('parses an owner/repo shorthand', () => {
    const result = parseGitHubUrl('facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('parses without https://', () => {
    const result = parseGitHubUrl('github.com/facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('throws on an invalid URL', () => {
    expect(() => parseGitHubUrl('not-a-github-url')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => parseGitHubUrl('')).toThrow();
  });
});
