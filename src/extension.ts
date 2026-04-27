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

export function activate(context: vscode.ExtensionContext): void {
  const settings = getSettings();
  setUiLanguage(settings.uiLanguage);

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.generateMessage, () => generateCommitMessageCommand(context)),
    vscode.commands.registerCommand(COMMANDS.switchModel, switchModelCommand),
    vscode.commands.registerCommand(COMMANDS.switchStyle, switchStyleCommand),
    vscode.commands.registerCommand(COMMANDS.switchLanguage, switchLanguageCommand),
    vscode.commands.registerCommand(COMMANDS.switchUiLanguage, switchUiLanguageCommand),
    vscode.commands.registerCommand(COMMANDS.addCustomModel, () => addCustomModelCommand(context)),
    vscode.commands.registerCommand(COMMANDS.removeCustomModel, () => removeCustomModelCommand(context)),
    vscode.commands.registerCommand(COMMANDS.listCustomModels, listCustomModelsCommand)
  );

  vscode.commands.executeCommand('setContext', 'commitAssistant.commandTitles', {
    generateMessage: t().commands.generateMessage,
    switchModel: t().commands.switchModel,
    switchStyle: t().commands.switchStyle,
    switchLanguage: t().commands.switchLanguage,
    switchUiLanguage: t().commands.switchUiLanguage,
    addCustomModel: t().commands.addCustomModel,
    removeCustomModel: t().commands.removeCustomModel,
    listCustomModels: t().commands.listCustomModels
  });
}

export function deactivate(): void {
  // No-op
}
