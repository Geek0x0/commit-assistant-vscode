import * as vscode from 'vscode';
import { getSettings, setLanguage } from '../config/settings';
import type { CommitLanguage } from '../types';

const LANGUAGE_OPTIONS: { label: string; value: CommitLanguage }[] = [
  { label: 'English', value: 'english' },
  { label: 'Chinese (中文)', value: 'chinese' },
  { label: 'Spanish (Español)', value: 'spanish' },
  { label: 'French (Français)', value: 'french' },
  { label: 'German (Deutsch)', value: 'german' },
  { label: 'Japanese (日本語)', value: 'japanese' },
  { label: 'Korean (한국어)', value: 'korean' },
  { label: 'Russian (Русский)', value: 'russian' },
  { label: 'Portuguese (Português)', value: 'portuguese' },
  { label: 'Italian (Italiano)', value: 'italian' },
  { label: 'Dutch (Nederlands)', value: 'dutch' },
  { label: 'Turkish (Türkçe)', value: 'turkish' },
  { label: 'Polish (Polski)', value: 'polish' },
  { label: 'Vietnamese (Tiếng Việt)', value: 'vietnamese' },
  { label: 'Arabic (العربية)', value: 'arabic' }
];

export async function switchLanguageCommand(): Promise<void> {
  const current = getSettings().language;

  const pick = await vscode.window.showQuickPick(
    LANGUAGE_OPTIONS.map((opt) => ({
      label: opt.label,
      description: opt.value === current ? 'Current' : undefined,
      value: opt.value
    })),
    { placeHolder: 'Select output language for commit messages' }
  );

  if (!pick) {
    return;
  }

  await setLanguage(pick.value);
  vscode.window.showInformationMessage(`Commit Assistant language set to: ${pick.label}`);
}
