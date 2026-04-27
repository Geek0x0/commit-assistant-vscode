import * as vscode from 'vscode';
import type { CustomModelConfig } from '../types';
import { getCustomModels, saveCustomModels, getCustomModelApiKeySecretKey } from '../config/settings';
import { isUrlAllowed } from '../core/customModelService';

const MAX_CUSTOM_MODELS = 20;
const MAX_NAME_LENGTH = 64;
const MAX_URL_LENGTH = 2048;
const MAX_MODEL_LENGTH = 128;

export async function addCustomModelCommand(context: vscode.ExtensionContext): Promise<void> {
  const existing = getCustomModels();
  if (existing.length >= MAX_CUSTOM_MODELS) {
    vscode.window.showWarningMessage(`You can only configure up to ${MAX_CUSTOM_MODELS} custom models. Remove one first.`);
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Enter a unique name for this custom model (e.g., my-openai)',
    placeHolder: 'my-openai',
    ignoreFocusOut: true,
    validateInput: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return 'Name is required';
      }
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `Name must be ${MAX_NAME_LENGTH} characters or less`;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return 'Name can only contain letters, numbers, hyphens, and underscores';
      }
      if (existing.some((m) => m.name === trimmed)) {
        return `A model named "${trimmed}" already exists`;
      }
      return null;
    }
  });

  if (!name?.trim()) {
    return;
  }

  const apiKey = await vscode.window.showInputBox({
    prompt: `Enter API key for "${name}"`,
    placeHolder: 'sk-...',
    ignoreFocusOut: true,
    password: true,
    validateInput: (value) => {
      if (!value?.trim()) {
        return 'API key is required';
      }
      return null;
    }
  });

  if (!apiKey?.trim()) {
    return;
  }

  const url = await vscode.window.showInputBox({
    prompt: `Enter API endpoint URL for "${name}"`,
    placeHolder: 'https://api.openai.com/v1/chat/completions',
    ignoreFocusOut: true,
    validateInput: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return 'URL is required';
      }
      if (trimmed.length > MAX_URL_LENGTH) {
        return `URL must be ${MAX_URL_LENGTH} characters or less`;
      }
      let urlObj: URL;
      try {
        urlObj = new URL(trimmed);
      } catch {
        return 'Please enter a valid URL';
      }
      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return 'Only HTTP and HTTPS URLs are allowed';
      }
      if (!isUrlAllowed(trimmed)) {
        return 'This URL is not allowed for security reasons';
      }
      return null;
    }
  });

  if (!url?.trim()) {
    return;
  }

  const model = await vscode.window.showInputBox({
    prompt: `Enter model name for "${name}"`,
    placeHolder: 'gpt-4o',
    ignoreFocusOut: true,
    validateInput: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return 'Model name is required';
      }
      if (trimmed.length > MAX_MODEL_LENGTH) {
        return `Model name must be ${MAX_MODEL_LENGTH} characters or less`;
      }
      return null;
    }
  });

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

  vscode.window.showInformationMessage(`Custom model "${name}" added successfully.`);
}

export async function removeCustomModelCommand(context: vscode.ExtensionContext): Promise<void> {
  const models = getCustomModels();
  if (models.length === 0) {
    vscode.window.showInformationMessage('No custom models configured.');
    return;
  }

  const pick = await vscode.window.showQuickPick(
    models.map((m) => ({
      label: m.name,
      description: `${m.model} @ ${m.url}`
    })),
    { placeHolder: 'Select a custom model to remove' }
  );

  if (!pick) {
    return;
  }

  const confirmed = await vscode.window.showWarningMessage(
    `Remove custom model "${pick.label}"?`,
    { modal: true },
    'Remove'
  );

  if (confirmed !== 'Remove') {
    return;
  }

  const targetName = pick.label;
  const updated = models.filter((m) => m.name !== targetName);
  await saveCustomModels(updated);
  await context.secrets.delete(getCustomModelApiKeySecretKey(targetName));

  vscode.window.showInformationMessage(`Custom model "${targetName}" removed.`);
}

export async function listCustomModelsCommand(): Promise<void> {
  const models = getCustomModels();
  if (models.length === 0) {
    vscode.window.showInformationMessage('No custom models configured.');
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'commitAssistantCustomModels',
    'Custom Models',
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
  <h2>Configured Custom Models (${models.length})</h2>
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
