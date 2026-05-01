function parseModelSetting(model: string): { provider: 'copilot' | 'custom'; modelName: string } {
  const trimmed = model.trim();
  if (trimmed.startsWith('custom:')) {
    return { provider: 'custom', modelName: trimmed.slice('custom:'.length).trim() };
  }
  if (trimmed.startsWith('copilot:')) {
    return { provider: 'copilot', modelName: trimmed.slice('copilot:'.length).trim() };
  }
  return { provider: 'copilot', modelName: trimmed };
}

describe('parseModelSetting', () => {
  test('parses custom prefix', () => {
    expect(parseModelSetting('custom:my-openai')).toEqual({ provider: 'custom', modelName: 'my-openai' });
  });

  test('parses copilot prefix', () => {
    expect(parseModelSetting('copilot:gpt-4.1')).toEqual({ provider: 'copilot', modelName: 'gpt-4.1' });
  });

  test('defaults plain name to copilot for backward compatibility', () => {
    expect(parseModelSetting('gpt-4.1')).toEqual({ provider: 'copilot', modelName: 'gpt-4.1' });
    expect(parseModelSetting('gpt-4o')).toEqual({ provider: 'copilot', modelName: 'gpt-4o' });
  });

  test('handles empty model name after prefix', () => {
    expect(parseModelSetting('custom:')).toEqual({ provider: 'custom', modelName: '' });
    expect(parseModelSetting('copilot:')).toEqual({ provider: 'copilot', modelName: '' });
  });

  test('trims whitespace', () => {
    expect(parseModelSetting('  custom:my-model  ')).toEqual({ provider: 'custom', modelName: 'my-model' });
  });

  test('handles model names with special characters', () => {
    expect(parseModelSetting('copilot:gpt-4.1-mini')).toEqual({ provider: 'copilot', modelName: 'gpt-4.1-mini' });
  });

  test('handles model names with dots', () => {
    expect(parseModelSetting('copilot:claude.sonnet.4.6')).toEqual({ provider: 'copilot', modelName: 'claude.sonnet.4.6' });
  });
});
