import * as vscode from 'vscode';
import type { CommitLanguage, CommitStyle, ExtensionSettings } from '../types';

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
    maxDiffChars: cfg.get<number>('maxDiffChars', 16000)
  };
}

export async function setModel(model: string): Promise<void> {
  await config().update('model', model, vscode.ConfigurationTarget.Global);
}

export async function setStyle(style: CommitStyle): Promise<void> {
  await config().update('style', style, vscode.ConfigurationTarget.Global);
}
