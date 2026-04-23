import * as vscode from 'vscode';
import { getSettings, setStyle } from '../config/settings';
import { getSelectableStyles } from '../prompts/templates';

export async function switchStyleCommand(): Promise<void> {
  const current = getSettings().style;
  const styles = getSelectableStyles();

  const pick = await vscode.window.showQuickPick(
    styles.map((style) => ({
      label: style,
      description: style === current ? 'Current' : undefined
    })),
    { placeHolder: 'Select commit message style' }
  );

  if (!pick) {
    return;
  }

  await setStyle(pick.label as typeof current);
  vscode.window.showInformationMessage(`Commit Assistant style set to: ${pick.label}`);
}
