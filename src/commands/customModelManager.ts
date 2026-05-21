import * as vscode from 'vscode';
import type { CustomModelConfig } from '../types';
import {
  getCustomModels,
  saveCustomModels,
  getCustomModelApiKeySecretKey,
  syncRenamedCustomModelSelection
} from '../config/settings';
import { isUrlAllowed } from '../core/customModelService';
import { t, formatTemplate } from '../i18n';

const MAX_CUSTOM_MODELS = 20;
const MAX_NAME_LENGTH = 64;
const MAX_URL_LENGTH = 2048;
const MAX_MODEL_LENGTH = 128;

function validateCustomModelName(
  value: string,
  existing: CustomModelConfig[],
  originalName?: string
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return t().validations.nameRequired;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return formatTemplate(t().validations.nameTooLong, { max: MAX_NAME_LENGTH });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return t().validations.nameInvalidChars;
  }
  if (existing.some((m) => m.name === trimmed && m.name !== originalName)) {
    return formatTemplate(t().validations.nameExists, { name: trimmed });
  }
  return null;
}

function validateCustomModelUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return t().validations.urlRequired;
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    return formatTemplate(t().validations.urlTooLong, { max: MAX_URL_LENGTH });
  }

  let urlObj: URL;
  try {
    urlObj = new URL(trimmed);
  } catch {
    return t().validations.urlInvalid;
  }

  if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
    return t().validations.urlProtocolNotAllowed;
  }
  if (!isUrlAllowed(trimmed)) {
    return t().validations.urlNotAllowed;
  }
  return null;
}

function validateCustomModelId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return t().validations.modelRequired;
  }
  if (trimmed.length > MAX_MODEL_LENGTH) {
    return formatTemplate(t().validations.modelTooLong, { max: MAX_MODEL_LENGTH });
  }
  return null;
}

async function promptCustomModelName(
  existing: CustomModelConfig[],
  originalName?: string
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: t().prompts.modelName,
    placeHolder: t().prompts.modelNamePlaceholder,
    ignoreFocusOut: true,
    value: originalName,
    validateInput: (value) => validateCustomModelName(value, existing, originalName)
  });
}

async function promptCustomModelApiKey(name: string, optional: boolean): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: optional
      ? formatTemplate(t().prompts.apiKeyOptional, { name })
      : formatTemplate(t().prompts.apiKey, { name }),
    placeHolder: 'sk-...',
    ignoreFocusOut: true,
    password: true,
    validateInput: optional
      ? undefined
      : (value) => {
          if (!value?.trim()) {
            return t().validations.apiKeyRequired;
          }
          return null;
        }
  });
}

async function promptCustomModelUrl(name: string, currentValue?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: formatTemplate(t().prompts.url, { name }),
    placeHolder: t().prompts.urlPlaceholder,
    ignoreFocusOut: true,
    value: currentValue,
    validateInput: (value) => validateCustomModelUrl(value)
  });
}

async function promptCustomModelId(name: string, currentValue?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: formatTemplate(t().prompts.modelId, { name }),
    placeHolder: t().prompts.modelIdPlaceholder,
    ignoreFocusOut: true,
    value: currentValue,
    validateInput: (value) => validateCustomModelId(value)
  });
}

export async function addCustomModelCommand(context: vscode.ExtensionContext): Promise<void> {
  const existing = getCustomModels();
  if (existing.length >= MAX_CUSTOM_MODELS) {
    vscode.window.showWarningMessage(formatTemplate(t().messages.maxModelsReached, { max: MAX_CUSTOM_MODELS }));
    return;
  }

  const name = await promptCustomModelName(existing);

  if (!name?.trim()) {
    return;
  }

  const apiKey = await promptCustomModelApiKey(name, false);

  if (!apiKey?.trim()) {
    return;
  }

  const url = await promptCustomModelUrl(name);

  if (!url?.trim()) {
    return;
  }

  const model = await promptCustomModelId(name);

  if (!model?.trim()) {
    return;
  }

  const config: CustomModelConfig = {
    name: name.trim(),
    url: url.trim(),
    model: model.trim()
  };

  await saveCustomModels([...existing, config]);
  await context.secrets.store(getCustomModelApiKeySecretKey(name.trim()), apiKey.trim());

  vscode.window.showInformationMessage(t().messages.customModelAdded);
}

export async function editCustomModelCommand(context: vscode.ExtensionContext): Promise<void> {
  try {
    const models = getCustomModels();
    if (models.length === 0) {
      vscode.window.showInformationMessage(t().messages.noCustomModels);
      return;
    }

    const pick = await vscode.window.showQuickPick(
      models.map((m) => ({
        label: m.name,
        description: `${m.model} @ ${m.url}`
      })),
      { placeHolder: t().prompts.selectCustomModelToEdit }
    );

    if (!pick) {
      return;
    }

    const original = models.find((m) => m.name === pick.label);
    if (!original) {
      return;
    }

    const nameInput = await promptCustomModelName(models, original.name);
    if (!nameInput?.trim()) {
      return;
    }
    const name = nameInput.trim();

    const urlInput = await promptCustomModelUrl(name, original.url);
    if (!urlInput?.trim()) {
      return;
    }
    const url = urlInput.trim();

    const modelInput = await promptCustomModelId(name, original.model);
    if (!modelInput?.trim()) {
      return;
    }
    const model = modelInput.trim();

    const apiKeyInput = await promptCustomModelApiKey(name, true);
    if (apiKeyInput === undefined) {
      return;
    }
    const newApiKey = apiKeyInput.trim();

    const updatedConfig: CustomModelConfig = { name, url, model };
    const updatedModels = models.map((m) => (m.name === original.name ? updatedConfig : m));

    await saveCustomModels(updatedModels);

    const oldSecretKey = getCustomModelApiKeySecretKey(original.name);
    const newSecretKey = getCustomModelApiKeySecretKey(name);
    const renamed = original.name !== name;

    if (renamed) {
      let shouldDeleteOldSecret = false;

      if (newApiKey) {
        await context.secrets.store(newSecretKey, newApiKey);
        shouldDeleteOldSecret = true;
      } else {
        const existingSecret = await context.secrets.get(oldSecretKey);
        if (existingSecret) {
          await context.secrets.store(newSecretKey, existingSecret);
          shouldDeleteOldSecret = true;
        }
      }

      if (shouldDeleteOldSecret) {
        await context.secrets.delete(oldSecretKey);
      }

      await syncRenamedCustomModelSelection(original.name, name);
    } else if (newApiKey) {
      await context.secrets.store(newSecretKey, newApiKey);
    }

    vscode.window.showInformationMessage(t().messages.customModelUpdated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`${t().errors.editModelFailed} ${message}`);
  }
}

export async function removeCustomModelCommand(context: vscode.ExtensionContext): Promise<void> {
  const models = getCustomModels();
  if (models.length === 0) {
    vscode.window.showInformationMessage(t().messages.noCustomModels);
    return;
  }

  const pick = await vscode.window.showQuickPick(
    models.map((m) => ({
      label: m.name,
      description: `${m.model} @ ${m.url}`
    })),
    { placeHolder: t().prompts.selectCustomModelToRemove }
  );

  if (!pick) {
    return;
  }

  const confirmed = await vscode.window.showWarningMessage(
    `${t().messages.confirmRemove} "${pick.label}"?`,
    { modal: true },
    t().messages.remove
  );

  if (confirmed !== t().messages.remove) {
    return;
  }

  const targetName = pick.label;
  const updated = models.filter((m) => m.name !== targetName);
  await saveCustomModels(updated);
  await context.secrets.delete(getCustomModelApiKeySecretKey(targetName));

  vscode.window.showInformationMessage(t().messages.customModelRemoved);
}

export async function listCustomModelsCommand(): Promise<void> {
  const models = getCustomModels();
  if (models.length === 0) {
    vscode.window.showInformationMessage(t().messages.noCustomModels);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'commitAssistantCustomModels',
    t().commands.listCustomModels,
    vscode.ViewColumn.One,
    { enableScripts: false }
  );

  panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: var(--vscode-font-family); padding: 20px; }
    h2 { color: var(--vscode-foreground); }
    .model { margin-bottom: 16px; padding: 12px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 6px; }
    .name { font-weight: bold; font-size: 1.1em; }
    .field { color: var(--vscode-descriptionForeground); margin-top: 4px; }
  </style>
</head>
<body>
  <h2>${escapeHtml(t().commands.listCustomModels)} (${models.length})</h2>
  ${models
    .map(
      (m) => `
    <div class="model">
      <div class="name">${escapeHtml(m.name)}</div>
      <div class="field">URL: ${escapeHtml(m.url)}</div>
      <div class="field">Model: ${escapeHtml(m.model)}</div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
