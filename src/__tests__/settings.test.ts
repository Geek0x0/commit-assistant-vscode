import * as vscode from 'vscode';
import { getCustomModelApiKeySecretKey, syncRenamedCustomModelSelection } from '../config/settings';

jest.mock('vscode');

describe('getCustomModelApiKeySecretKey', () => {
  test('returns stable secret key format', () => {
    expect(getCustomModelApiKeySecretKey('my-openai')).toBe('commitAssistant.customModel.my-openai.apiKey');
    expect(getCustomModelApiKeySecretKey('test_123')).toBe('commitAssistant.customModel.test_123.apiKey');
  });
});

describe('syncRenamedCustomModelSelection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockConfiguration(currentModel: string): { update: jest.Mock<Promise<void>, [string, string, vscode.ConfigurationTarget]> } {
    const update = jest.fn<Promise<void>, [string, string, vscode.ConfigurationTarget]>().mockResolvedValue();

    jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'model') {
          return currentModel;
        }

        return defaultValue;
      }),
      update
    } as unknown as vscode.WorkspaceConfiguration);

    return { update };
  }

  test('updates the selected model when the active custom model is renamed', async () => {
    const { update } = mockConfiguration('custom:old-model');

    await syncRenamedCustomModelSelection('old-model', 'new-model');

    expect(update).toHaveBeenCalledWith('model', 'custom:new-model', vscode.ConfigurationTarget.Global);
  });

  test('does not update the selected model when a different model is active', async () => {
    const { update } = mockConfiguration('custom:other-model');

    await syncRenamedCustomModelSelection('old-model', 'new-model');

    expect(update).not.toHaveBeenCalled();
  });
});
