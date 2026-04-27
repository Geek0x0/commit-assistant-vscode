import * as vscode from 'vscode';
import { getSettings, setModel } from '../config/settings';
import { listAvailableModelNames } from '../core/lmService';
import { getCustomModels } from '../config/settings';

interface ModelPickItem extends vscode.QuickPickItem {
  fullId?: string;
}

export async function switchModelCommand(): Promise<void> {
  try {
    const copilotModels = await listAvailableModelNames();
    const customModels = getCustomModels();
    const current = getSettings().model;

    const picks: ModelPickItem[] = [];

    if (copilotModels.length > 0) {
      picks.push({
        label: 'GitHub Copilot',
        kind: vscode.QuickPickItemKind.Separator
      });
      for (const name of copilotModels) {
        const fullId = `copilot:${name}`;
        picks.push({
          label: name,
          fullId,
          description: fullId === current ? 'Current' : undefined
        });
      }
    }

    if (customModels.length > 0) {
      picks.push({
        label: 'Custom Models',
        kind: vscode.QuickPickItemKind.Separator
      });
      for (const m of customModels) {
        const fullId = `custom:${m.name}`;
        picks.push({
          label: m.name,
          fullId,
          description: `${m.model} @ ${m.url}${fullId === current ? ' — Current' : ''}`
        });
      }
    }

    picks.push({
      label: 'Other',
      kind: vscode.QuickPickItemKind.Separator
    });
    picks.push({ label: '$(edit) Enter custom model id', description: 'Custom' });

    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: 'Select a model for commit generation'
    });

    if (!selected || selected.kind === vscode.QuickPickItemKind.Separator) {
      return;
    }

    let nextModel = selected.label;

    if (selected.description === 'Custom') {
      const custom = await vscode.window.showInputBox({
        prompt: 'Enter model id/name (prefix with copilot: or custom:)',
        value: current,
        ignoreFocusOut: true
      });
      if (!custom?.trim()) {
        return;
      }
      nextModel = custom.trim();
    } else if (selected.fullId) {
      nextModel = selected.fullId;
    }

    await setModel(nextModel);
    vscode.window.showInformationMessage(`Commit Assistant model set to: ${nextModel}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to switch model: ${message}`);
  }
}
