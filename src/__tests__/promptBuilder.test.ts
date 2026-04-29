import { normalizeModelOutput } from '../core/promptBuilder';

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
