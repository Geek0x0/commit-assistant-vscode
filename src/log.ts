import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Commit Assistant');
  }
  return channel;
}

export function logWarn(message: string, ...args: unknown[]): void {
  const ch = getOutputChannel();
  const timestamp = new Date().toISOString();
  ch.appendLine(`[${timestamp}] [WARN] ${message}`);
  for (const arg of args) {
    ch.appendLine(`  ${typeof arg === 'string' ? arg : JSON.stringify(arg)}`);
  }
}

export function logInfo(message: string, ...args: unknown[]): void {
  const ch = getOutputChannel();
  const timestamp = new Date().toISOString();
  ch.appendLine(`[${timestamp}] [INFO] ${message}`);
  for (const arg of args) {
    ch.appendLine(`  ${typeof arg === 'string' ? arg : JSON.stringify(arg)}`);
  }
}

export function disposeOutputChannel(): void {
  if (channel) {
    channel.dispose();
    channel = undefined;
  }
}
