import { formatTemplate, setUiLanguage, getUiLanguage, t } from '../i18n';

describe('formatTemplate', () => {
  test('replaces single placeholder', () => {
    expect(formatTemplate('Hello {name}', { name: 'world' })).toBe('Hello world');
  });

  test('replaces multiple placeholders', () => {
    expect(formatTemplate('{a} and {b}', { a: 'foo', b: 'bar' })).toBe('foo and bar');
  });

  test('replaces numeric values', () => {
    expect(formatTemplate('count: {n}', { n: 42 })).toBe('count: 42');
  });

  test('leaves unreferenced placeholders as-is', () => {
    expect(formatTemplate('{a} {b}', { a: 'x' })).toBe('x {b}');
  });

  test('returns unchanged string with no placeholders', () => {
    expect(formatTemplate('no vars', {})).toBe('no vars');
  });
});

describe('setUiLanguage / getUiLanguage', () => {
  test('defaults to en', () => {
    expect(getUiLanguage()).toBe('en');
  });

  test('switches to zh and back', () => {
    setUiLanguage('zh');
    expect(getUiLanguage()).toBe('zh');
    setUiLanguage('en');
    expect(getUiLanguage()).toBe('en');
  });
});

describe('t() translations', () => {
  test('returns English translations by default', () => {
    const tr = t();
    expect(tr.messages.noChanges).toBe('No changes detected.');
    expect(tr.commands.generateMessage).toContain('Commit Assistant');
  });

  test('returns Chinese translations when set to zh', () => {
    setUiLanguage('zh');
    const tr = t();
    expect(tr.messages.noChanges).toBe('未检测到更改。');
    expect(tr.commands.generateMessage).toContain('提交助手');
    setUiLanguage('en');
  });
});
