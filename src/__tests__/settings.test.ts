import { getCustomModelApiKeySecretKey } from '../config/settings';

describe('getCustomModelApiKeySecretKey', () => {
  test('returns stable secret key format', () => {
    expect(getCustomModelApiKeySecretKey('my-openai')).toBe('commitAssistant.customModel.my-openai.apiKey');
    expect(getCustomModelApiKeySecretKey('test_123')).toBe('commitAssistant.customModel.test_123.apiKey');
  });
});
