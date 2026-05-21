jest.mock('vscode');

jest.mock('../config/settings', () => ({
  getCustomModels: jest.fn(),
  saveCustomModels: jest.fn(),
  getCustomModelApiKeySecretKey: jest.fn((name: string) => `commitAssistant.customModel.${name}.apiKey`),
  syncRenamedCustomModelSelection: jest.fn()
}));

jest.mock('../core/customModelService', () => ({
  isUrlAllowed: jest.fn(() => true)
}));

jest.mock('../i18n', () => ({
  t: () => ({
    prompts: {
      modelName: 'Enter a unique name for this custom model',
      modelNamePlaceholder: 'my-openai',
      apiKey: 'Enter API key for {name}',
      apiKeyOptional: 'Enter API key for {name} (leave blank to keep the existing key)',
      url: 'Enter API endpoint URL for {name}',
      urlPlaceholder: 'https://api.openai.com/v1/chat/completions',
      modelId: 'Enter model name for {name}',
      modelIdPlaceholder: 'gpt-4o',
      selectCustomModelToEdit: 'Select a custom model to edit'
    },
    messages: {
      noCustomModels: 'No custom models configured.',
      customModelUpdated: 'Custom model updated successfully.'
    },
    validations: {
      nameRequired: 'Name is required',
      nameTooLong: 'Name must be 64 characters or less',
      nameInvalidChars: 'Name can only contain letters, numbers, hyphens, and underscores',
      nameExists: 'A model named "{name}" already exists',
      urlRequired: 'URL is required',
      urlTooLong: 'URL must be 2048 characters or less',
      urlInvalid: 'Please enter a valid URL',
      urlProtocolNotAllowed: 'Only HTTP and HTTPS URLs are allowed',
      urlNotAllowed: 'This URL is not allowed for security reasons',
      modelRequired: 'Model name is required',
      modelTooLong: 'Model name must be 128 characters or less'
    },
    errors: {
      editModelFailed: 'Failed to edit custom model:'
    }
  }),
  formatTemplate: (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, String(value)),
      template
    )
}));

import * as vscode from 'vscode';
import { editCustomModelCommand } from '../commands/customModelManager';
import {
  getCustomModels,
  saveCustomModels,
  syncRenamedCustomModelSelection
} from '../config/settings';

const mockedGetCustomModels = jest.mocked(getCustomModels);
const mockedSaveCustomModels = jest.mocked(saveCustomModels);
const mockedSyncRenamedCustomModelSelection = jest.mocked(syncRenamedCustomModelSelection);

interface MockSecretStorage {
  get: jest.Mock<Promise<string | undefined>, [string]>;
  store: jest.Mock<Promise<void>, [string, string]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

interface MockExtensionContext {
  secrets: MockSecretStorage;
}

function createContext(secret = 'old-secret'): MockExtensionContext {
  return {
    secrets: {
      get: jest.fn().mockResolvedValue(secret),
      store: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    }
  };
}

describe('editCustomModelCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows info and returns when no models exist', async () => {
    mockedGetCustomModels.mockReturnValue([]);
    const infoSpy = jest.spyOn(vscode.window, 'showInformationMessage');

    await editCustomModelCommand(createContext() as unknown as vscode.ExtensionContext);

    expect(infoSpy).toHaveBeenCalledWith('No custom models configured.');
    expect(mockedSaveCustomModels).not.toHaveBeenCalled();
  });

  test('keeps existing secret when API key input is empty', async () => {
    mockedGetCustomModels.mockReturnValue([
      { name: 'my-openai', url: 'https://old.example/v1', model: 'gpt-4o' }
    ]);

    jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue({
      label: 'my-openai'
    } as vscode.QuickPickItem);

    jest
      .spyOn(vscode.window, 'showInputBox')
      .mockResolvedValueOnce('my-openai')
      .mockResolvedValueOnce('https://new.example/v1')
      .mockResolvedValueOnce('gpt-4.1')
      .mockResolvedValueOnce('');

    const context = createContext();

    await editCustomModelCommand(context as unknown as vscode.ExtensionContext);

    expect(mockedSaveCustomModels).toHaveBeenCalledWith([
      { name: 'my-openai', url: 'https://new.example/v1', model: 'gpt-4.1' }
    ]);
    expect(context.secrets.store).not.toHaveBeenCalled();
    expect(context.secrets.delete).not.toHaveBeenCalled();
  });

  test('renames the model, migrates the secret, and syncs current selection', async () => {
    mockedGetCustomModels.mockReturnValue([
      { name: 'old-model', url: 'https://old.example/v1', model: 'gpt-4o' }
    ]);

    jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue({
      label: 'old-model'
    } as vscode.QuickPickItem);

    jest
      .spyOn(vscode.window, 'showInputBox')
      .mockResolvedValueOnce('new-model')
      .mockResolvedValueOnce('https://new.example/v1')
      .mockResolvedValueOnce('gpt-4.1')
      .mockResolvedValueOnce('');

    const context = createContext('persisted-secret');

    await editCustomModelCommand(context as unknown as vscode.ExtensionContext);

    expect(mockedSaveCustomModels).toHaveBeenCalledWith([
      { name: 'new-model', url: 'https://new.example/v1', model: 'gpt-4.1' }
    ]);
    expect(context.secrets.store).toHaveBeenCalledWith(
      'commitAssistant.customModel.new-model.apiKey',
      'persisted-secret'
    );
    expect(context.secrets.delete).toHaveBeenCalledWith('commitAssistant.customModel.old-model.apiKey');
    expect(mockedSyncRenamedCustomModelSelection).toHaveBeenCalledWith('old-model', 'new-model');
  });

  test('does not delete old secret when rename keeps blank API key and old secret is missing', async () => {
    mockedGetCustomModels.mockReturnValue([
      { name: 'old-model', url: 'https://old.example/v1', model: 'gpt-4o' }
    ]);

    jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue({
      label: 'old-model'
    } as vscode.QuickPickItem);

    jest
      .spyOn(vscode.window, 'showInputBox')
      .mockResolvedValueOnce('new-model')
      .mockResolvedValueOnce('https://new.example/v1')
      .mockResolvedValueOnce('gpt-4.1')
      .mockResolvedValueOnce('');

    const context = createContext();
    context.secrets.get.mockResolvedValue(undefined);

    await editCustomModelCommand(context as unknown as vscode.ExtensionContext);

    expect(context.secrets.store).not.toHaveBeenCalled();
    expect(context.secrets.delete).not.toHaveBeenCalled();
    expect(mockedSyncRenamedCustomModelSelection).toHaveBeenCalledWith('old-model', 'new-model');
  });

  test('aborts without writes when user cancels mid-flow', async () => {
    mockedGetCustomModels.mockReturnValue([
      { name: 'my-openai', url: 'https://old.example/v1', model: 'gpt-4o' }
    ]);

    jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue({
      label: 'my-openai'
    } as vscode.QuickPickItem);

    jest.spyOn(vscode.window, 'showInputBox').mockResolvedValueOnce('my-openai').mockResolvedValueOnce(undefined);

    const context = createContext();

    await editCustomModelCommand(context as unknown as vscode.ExtensionContext);

    expect(mockedSaveCustomModels).not.toHaveBeenCalled();
    expect(context.secrets.store).not.toHaveBeenCalled();
    expect(context.secrets.delete).not.toHaveBeenCalled();
  });

  test('duplicate rename validation returns the name-exists error when trying to rename to another existing model', async () => {
    mockedGetCustomModels.mockReturnValue([
      { name: 'first-model', url: 'https://one.example/v1', model: 'gpt-4o' },
      { name: 'second-model', url: 'https://two.example/v1', model: 'gpt-4.1' }
    ]);

    jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue({
      label: 'first-model'
    } as vscode.QuickPickItem);

    let validateInput: NonNullable<vscode.InputBoxOptions['validateInput']> | undefined;

    jest.spyOn(vscode.window, 'showInputBox').mockImplementation(async (options?: vscode.InputBoxOptions) => {
      if (!validateInput && options?.validateInput) {
        validateInput = options.validateInput;
      }

      return undefined;
    });

    await editCustomModelCommand(createContext() as unknown as vscode.ExtensionContext);

    await expect(Promise.resolve(validateInput?.('second-model'))).resolves.toBe(
      'A model named "second-model" already exists'
    );
    expect(mockedSaveCustomModels).not.toHaveBeenCalled();
  });
});