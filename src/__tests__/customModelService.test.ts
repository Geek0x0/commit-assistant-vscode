import { isUrlAllowed } from '../core/customModelService';

describe('isUrlAllowed', () => {
  test('allows valid https URLs', () => {
    expect(isUrlAllowed('https://api.openai.com/v1/chat/completions')).toBe(true);
    expect(isUrlAllowed('https://example.com')).toBe(true);
  });

  test('allows valid http URLs', () => {
    expect(isUrlAllowed('http://localhost:8080')).toBe(false);
    expect(isUrlAllowed('http://example.com')).toBe(true);
  });

  test('blocks localhost', () => {
    expect(isUrlAllowed('https://localhost/api')).toBe(false);
    expect(isUrlAllowed('https://127.0.0.1/api')).toBe(false);
    expect(isUrlAllowed('https://0.0.0.0/api')).toBe(false);
    expect(isUrlAllowed('https://[::1]/api')).toBe(false);
  });

  test('blocks private IP ranges', () => {
    expect(isUrlAllowed('https://10.0.0.1/api')).toBe(false);
    expect(isUrlAllowed('https://172.16.0.1/api')).toBe(false);
    expect(isUrlAllowed('https://192.168.1.1/api')).toBe(false);
    expect(isUrlAllowed('https://169.254.1.1/api')).toBe(false);
  });

  test('blocks non-http protocols', () => {
    expect(isUrlAllowed('ftp://example.com')).toBe(false);
    expect(isUrlAllowed('file:///etc/passwd')).toBe(false);
    expect(isUrlAllowed('javascript:alert(1)')).toBe(false);
  });

  test('blocks invalid URLs', () => {
    expect(isUrlAllowed('not-a-url')).toBe(false);
    expect(isUrlAllowed('')).toBe(false);
  });
});
