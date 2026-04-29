import * as vscode from 'vscode';
import { COMMANDS } from './types';
import { getSettings } from './config/settings';
import { setUiLanguage, t } from './i18n';
import { generateCommitMessageCommand } from './commands/generateCommit';
import { switchModelCommand } from './commands/switchModel';
import { switchStyleCommand } from './commands/switchStyle';
import { switchLanguageCommand } from './commands/switchLanguage';
import { switchUiLanguageCommand } from './commands/switchUiLanguage';
import {
  addCustomModelCommand,
  removeCustomModelCommand,
  listCustomModelsCommand
} from './commands/customModelManager';
import { getStats, buildTooltipText, clearStats } from './services/statsService';
import { openStatsWebview } from './webview/statsWebview';

let statusBarItem: vscode.StatusBarItem | undefined;

function refreshStatusBar(globalState: vscode.Memento): void {
  if (!statusBarItem) {
    return;
  }
  const stats = getStats(globalState);
  const md = new vscode.MarkdownString(buildTooltipText(stats));
  md.isTrusted = true;
  statusBarItem.tooltip = md;
}

export function activate(context: vscode.ExtensionContext): void {
  const settings = getSettings();
  setUiLanguage(settings.uiLanguage);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pie-chart)';
  statusBarItem.command = COMMANDS.showStats;
  refreshStatusBar(context.globalState);
  statusBarItem.show();

  context.subscriptions.push(
    statusBarItem,
    vscode.commands.registerCommand(COMMANDS.generateMessage, async () => {
      await generateCommitMessageCommand(context);
      refreshStatusBar(context.globalState);
    }),
    vscode.commands.registerCommand(COMMANDS.switchModel, switchModelCommand),
    vscode.commands.registerCommand(COMMANDS.switchStyle, switchStyleCommand),
    vscode.commands.registerCommand(COMMANDS.switchLanguage, switchLanguageCommand),
    vscode.commands.registerCommand(COMMANDS.switchUiLanguage, switchUiLanguageCommand),
    vscode.commands.registerCommand(COMMANDS.addCustomModel, () => addCustomModelCommand(context)),
    vscode.commands.registerCommand(COMMANDS.removeCustomModel, () => removeCustomModelCommand(context)),
    vscode.commands.registerCommand(COMMANDS.listCustomModels, listCustomModelsCommand),
    vscode.commands.registerCommand(COMMANDS.showStats, () => openStatsWebview(context)),
    vscode.commands.registerCommand(COMMANDS.clearStats, async () => {
      await clearStats(context.globalState);
      refreshStatusBar(context.globalState);
      vscode.window.showInformationMessage(t().stats.statsCleared);
    })
  );

  vscode.commands.executeCommand('setContext', 'commitAssistant.commandTitles', {
    generateMessage: t().commands.generateMessage,
    switchModel: t().commands.switchModel,
    switchStyle: t().commands.switchStyle,
    switchLanguage: t().commands.switchLanguage,
    switchUiLanguage: t().commands.switchUiLanguage,
    addCustomModel: t().commands.addCustomModel,
    removeCustomModel: t().commands.removeCustomModel,
    listCustomModels: t().commands.listCustomModels,
    showStats: t().commands.showStats,
    clearStats: t().commands.clearStats
  });
}

export function deactivate(): void {
  statusBarItem = undefined;
}
