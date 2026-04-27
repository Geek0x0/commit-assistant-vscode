import * as vscode from 'vscode';
import { getSettings, setUiLanguage as saveUiLanguage } from '../config/settings';
import { setUiLanguage, t } from '../i18n';
import type { UiLanguage } from '../types';

const UI_LANGUAGE_OPTIONS: { label: string; value: UiLanguage }[] = [
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh' }
];

export async function switchUiLanguageCommand(): Promise<void> {
  try {
    const current = getSettings().uiLanguage;

    const pick = await vscode.window.showQuickPick(
      UI_LANGUAGE_OPTIONS.map((opt) => ({
        label: opt.label,
        description: opt.value === current ? 'Current' : undefined,
        value: opt.value
      })),
      { placeHolder: t().prompts.selectUiLanguage }
    );

    if (!pick) {
      return;
    }

    try {
      await saveUiLanguage(pick.value);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not a registered configuration')) {
        const reload = await vscode.window.showWarningMessage(
          'Configuration updated. Please reload the window to apply changes.',
          'Reload Window'
        );
        if (reload === 'Reload Window') {
          await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return;
      }
      throw err;
    }

    setUiLanguage(pick.value);
    vscode.window.showInformationMessage(`${t().messages.uiLanguageSet} ${pick.label}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`${t().errors.switchLanguageFailed} ${message}`);
  }
}
