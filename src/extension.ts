import * as vscode from 'vscode';
import { COMMANDS } from './types';
import { generateCommitMessageCommand } from './commands/generateCommit';
import { switchModelCommand } from './commands/switchModel';
import { switchStyleCommand } from './commands/switchStyle';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.generateMessage, generateCommitMessageCommand),
    vscode.commands.registerCommand(COMMANDS.switchModel, switchModelCommand),
    vscode.commands.registerCommand(COMMANDS.switchStyle, switchStyleCommand)
  );
}

export function deactivate(): void {
  // No-op
}
