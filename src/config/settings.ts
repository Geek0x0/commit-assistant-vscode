import * as vscode from 'vscode';
import type { CommitLanguage, CommitStyle, CustomModelConfig, ExtensionSettings, UiLanguage } from '../types';

const SECTION = 'commitAssistant';

function config(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(SECTION);
}

export function getSettings(): ExtensionSettings {
  const cfg = config();
  return {
    model: cfg.get<string>('model', 'gpt-4.1'),
    style: cfg.get<CommitStyle>('style', 'conventional'),
    language: cfg.get<CommitLanguage>('language', 'english'),
    maxDiffChars: cfg.get<number>('maxDiffChars', 16000),
    stagedOnly: cfg.get<boolean>('stagedOnly', false),
    uiLanguage: cfg.get<UiLanguage>('uiLanguage', 'en')
  };
}

export async function setModel(model: string): Promise<void> {
  await config().update('model', model, vscode.ConfigurationTarget.Global);
}

export async function setStyle(style: CommitStyle): Promise<void> {
  await config().update('style', style, vscode.ConfigurationTarget.Global);
}

export async function setLanguage(language: CommitLanguage): Promise<void> {
  await config().update('language', language, vscode.ConfigurationTarget.Global);
}

export async function setUiLanguage(language: UiLanguage): Promise<void> {
  await config().update('uiLanguage', language, vscode.ConfigurationTarget.Global);
}

export function getCustomModels(): CustomModelConfig[] {
  return config().get<CustomModelConfig[]>('customModels', []);
}

export async function saveCustomModels(models: CustomModelConfig[]): Promise<void> {
  await config().update('customModels', models, vscode.ConfigurationTarget.Global);
}

export function getCustomModelApiKeySecretKey(name: string): string {
  return `commitAssistant.customModel.${name}.apiKey`;
}
