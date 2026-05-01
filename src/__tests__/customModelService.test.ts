import { isUrlAllowed, sanitizeErrorMessage } from '../core/customModelService';

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

  test('blocks link-local IPv6 addresses via BLOCKED_HOSTS', () => {
    expect(isUrlAllowed('https://[::1]/api')).toBe(false);
  });

  test('allows public URLs with query strings', () => {
    expect(isUrlAllowed('https://api.example.com/v1/chat?model=gpt-4')).toBe(true);
  });
});

describe('sanitizeErrorMessage', () => {
  test('redacts sk- API keys', () => {
    expect(sanitizeErrorMessage('Error with key sk-abc123def456ghi789jkl012mno345')).toBe(
      'Error with key [REDACTED_API_KEY]'
    );
  });

  test('redacts Bearer tokens', () => {
    expect(sanitizeErrorMessage('Auth: Bearer abc123def456')).toBe('Auth: Bearer [REDACTED]');
  });

  test('redacts key- prefixed tokens', () => {
    expect(sanitizeErrorMessage('Error: key-abc123def456ghi789jkl012')).toBe(
      'Error: [REDACTED_API_KEY]'
    );
  });

  test('redacts token- prefixed tokens', () => {
    expect(sanitizeErrorMessage('Error: token-abc123def456ghi789jkl012')).toBe(
      'Error: [REDACTED_TOKEN]'
    );
  });

  test('redacts api_key= patterns', () => {
    expect(sanitizeErrorMessage('api_key=secret123')).toBe('api_key=[REDACTED]');
  });

  test('redacts api-key= patterns', () => {
    expect(sanitizeErrorMessage('api-key=secret123')).toBe('api_key=[REDACTED]');
  });

  test('returns clean message unchanged', () => {
    expect(sanitizeErrorMessage('Invalid JSON response')).toBe('Invalid JSON response');
  });

  test('handles empty string', () => {
    expect(sanitizeErrorMessage('')).toBe('');
  });
});
