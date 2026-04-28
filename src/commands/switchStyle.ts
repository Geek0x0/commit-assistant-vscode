import * as vscode from 'vscode';
import { getSettings, setStyle } from '../config/settings';
import { getSelectableStyles } from '../prompts/templates';
import { t } from '../i18n';

export async function switchStyleCommand(): Promise<void> {
  const current = getSettings().style;
  const styles = getSelectableStyles();

  const pick = await vscode.window.showQuickPick(
    styles.map((style) => ({
      label: style,
      description: style === current ? 'Current' : undefined
    })),
    { placeHolder: t().prompts.selectStyle }
  );

  if (!pick) {
    return;
  }

  await setStyle(pick.label as typeof current);
  vscode.window.showInformationMessage(`${t().messages.styleSet} ${pick.label}`);
}
