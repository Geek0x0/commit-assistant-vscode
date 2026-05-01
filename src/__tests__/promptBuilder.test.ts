import { normalizeModelOutput, buildPrompt, buildUserOnlyPrompt } from '../core/promptBuilder';

jest.mock('../config/settings', () => ({
  getSettings: () => ({
    style: 'conventional',
    language: 'english',
    maxDiffChars: 16000
  })
}));

describe('normalizeModelOutput', () => {
  test('trims whitespace', () => {
    expect(normalizeModelOutput('  hello world  ')).toBe('hello world');
  });

  test('strips markdown code fences with language tag', () => {
    const input = '```typescript\nfeat: add new feature\n```';
    expect(normalizeModelOutput(input)).toBe('feat: add new feature');
  });

  test('strips markdown code fences without language tag', () => {
    const input = '```\nfeat: add new feature\n```';
    expect(normalizeModelOutput(input)).toBe('feat: add new feature');
  });

  test('strips code fences with hyphenated language tag', () => {
    const input = '```text-plain\nsome message\n```';
    expect(normalizeModelOutput(input)).toBe('some message');
  });

  test('collapses 3+ consecutive newlines into 2', () => {
    expect(normalizeModelOutput('line1\n\n\n\nline2')).toBe('line1\n\nline2');
  });

  test('returns empty string for empty input', () => {
    expect(normalizeModelOutput('')).toBe('');
  });

  test('returns empty string for whitespace-only input', () => {
    expect(normalizeModelOutput('   \n  ')).toBe('');
  });

  test('handles null-like input gracefully', () => {
    expect(normalizeModelOutput(null as unknown as string)).toBe('');
  });

  test('does not strip inline code fences', () => {
    const input = 'use `git commit` to commit';
    expect(normalizeModelOutput(input)).toBe('use `git commit` to commit');
  });

  test('preserves normal multi-line message', () => {
    const input = 'feat: add new feature\n\n- Added new module\n- Updated tests';
    expect(normalizeModelOutput(input)).toBe(input);
  });
});

describe('buildPrompt', () => {
  test('includes git context fields', () => {
    const gitContext = {
      repoPath: '/tmp/repo',
      stagedDiff: 'diff --git a/file.ts',
      unstagedDiff: '',
      untrackedSummary: '',
      changedFiles: ['file.ts'],
      relatedHistory: 'abc123 2025-01-01 feat: init'
    };

    const prompt = buildPrompt(undefined, gitContext);
    expect(prompt).toContain('/tmp/repo');
    expect(prompt).toContain('file.ts');
    expect(prompt).toContain('diff --git a/file.ts');
    expect(prompt).toContain('abc123 2025-01-01 feat: init');
    expect(prompt).toContain('No user intent was provided');
  });

  test('includes user intent when provided', () => {
    const gitContext = {
      repoPath: '/tmp/repo',
      stagedDiff: '',
      unstagedDiff: '',
      untrackedSummary: '',
      changedFiles: [],
      relatedHistory: ''
    };

    const prompt = buildPrompt('fix login bug', gitContext);
    expect(prompt).toContain('fix login bug');
    expect(prompt).toContain('Use this intent as primary guidance');
  });

  test('shows (none) for empty fields', () => {
    const gitContext = {
      repoPath: '/tmp/repo',
      stagedDiff: '',
      unstagedDiff: '',
      untrackedSummary: '',
      changedFiles: [],
      relatedHistory: ''
    };

    const prompt = buildPrompt(undefined, gitContext);
    expect(prompt).toContain('(none)');
  });
});

describe('buildUserOnlyPrompt', () => {
  test('includes user intent', () => {
    const prompt = buildUserOnlyPrompt('refactor authentication module');
    expect(prompt).toContain('refactor authentication module');
    expect(prompt).toContain('User intent for this commit');
  });

  test('includes language instruction', () => {
    const prompt = buildUserOnlyPrompt('some intent');
    expect(prompt).toContain('English');
  });
});
