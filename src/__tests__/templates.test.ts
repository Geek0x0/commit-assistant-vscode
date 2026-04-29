import { getTemplate, getSelectableStyles } from '../prompts/templates';

describe('getTemplate', () => {
  test('returns conventional template', () => {
    expect(getTemplate('conventional')).toContain('Conventional Commits');
  });

  test('returns plain template', () => {
    expect(getTemplate('plain')).toContain('single plain sentence');
  });

  test('returns angular template', () => {
    expect(getTemplate('angular')).toContain('Angular');
  });

  test('returns karma template', () => {
    expect(getTemplate('karma')).toContain('Karma');
  });

  test('returns semantic template', () => {
    expect(getTemplate('semantic')).toContain('Semantic');
  });

  test('returns emoji template', () => {
    expect(getTemplate('emoji')).toContain('emoji prefix');
  });

  test('returns emojiKarma template', () => {
    expect(getTemplate('emojiKarma')).toContain('emoji and Karma');
  });

  test('returns google template', () => {
    expect(getTemplate('google')).toContain('Google');
  });

  test('returns atom template', () => {
    expect(getTemplate('atom')).toContain('Atom');
  });

  test('falls back to plain for auto style', () => {
    expect(getTemplate('auto')).toBe(getTemplate('plain'));
  });

  test('falls back to plain for unknown style', () => {
    expect(getTemplate('unknown-style' as never)).toBe(getTemplate('plain'));
  });
});

describe('getSelectableStyles', () => {
  test('includes auto', () => {
    expect(getSelectableStyles()).toContain('auto');
  });

  test('includes all template styles', () => {
    const styles = getSelectableStyles();
    expect(styles).toContain('plain');
    expect(styles).toContain('conventional');
    expect(styles).toContain('angular');
    expect(styles).toContain('karma');
    expect(styles).toContain('semantic');
    expect(styles).toContain('emoji');
    expect(styles).toContain('emojiKarma');
    expect(styles).toContain('google');
    expect(styles).toContain('atom');
  });

  test('returns exactly 10 styles', () => {
    expect(getSelectableStyles()).toHaveLength(10);
  });
});
