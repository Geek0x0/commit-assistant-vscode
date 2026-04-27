export class CancellationError extends Error {}

export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: (listener: () => void) => { dispose: () => void };
}

export const workspace = {
  getConfiguration: () => ({
    get: () => undefined,
    update: () => Promise.resolve()
  }),
  workspaceFolders: undefined
};

export const window = {
  showInputBox: () => Promise.resolve(undefined),
  showQuickPick: () => Promise.resolve(undefined),
  showInformationMessage: () => Promise.resolve(undefined),
  showWarningMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  createWebviewPanel: () => ({
    webview: { html: '' }
  }),
  withProgress: (_options: unknown, task: (p: unknown, token: CancellationToken) => Promise<unknown>) =>
    task(
      { report: () => {} },
      {
        isCancellationRequested: false,
        onCancellationRequested: () => ({ dispose: () => {} })
      }
    )
};

export const commands = {
  registerCommand: () => ({ dispose: () => {} })
};

export const env = {
  clipboard: { writeText: () => Promise.resolve() }
};

export const extensions = {
  getExtension: () => undefined
};

export const ProgressLocation = {
  Notification: 1
};

export const ConfigurationTarget = {
  Global: 1
};

export const ViewColumn = {
  One: 1
};

export const QuickPickItemKind = {
  Separator: -1,
  Default: 0
};
