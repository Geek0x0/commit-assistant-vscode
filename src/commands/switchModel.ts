import * as vscode from 'vscode';
import { getSettings, setModel } from '../config/settings';
import { listAvailableModelNames } from '../core/lmService';

export async function switchModelCommand(): Promise<void> {
  try {
    const models = await listAvailableModelNames();
    const current = getSettings().model;

    const picks = models.map((name) => ({
      label: name,
      description: name === current ? 'Current' : undefined
    }));

    picks.push({ label: '$(edit) Enter custom model id', description: 'Custom' });

    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: 'Select a model for commit generation'
    });

    if (!selected) {
      return;
    }

    let nextModel = selected.label;

    if (selected.description === 'Custom') {
      const custom = await vscode.window.showInputBox({
        prompt: 'Enter model id/name',
        value: current,
        ignoreFocusOut: true
      });
      if (!custom?.trim()) {
        return;
      }
      nextModel = custom.trim();
    }

    await setModel(nextModel);
    vscode.window.showInformationMessage(`Commit Assistant model set to: ${nextModel}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to switch model: ${message}`);
  }
}
