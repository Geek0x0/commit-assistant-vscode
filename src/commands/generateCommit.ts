import * as vscode from 'vscode';
import { getSettings } from '../config/settings';
import { collectGitContext, writeToScmInputBox } from '../core/gitService';
import { generateWithCopilot } from '../core/lmService';
import { buildPrompt, normalizeModelOutput } from '../core/promptBuilder';

export async function generateCommitMessageCommand(): Promise<void> {
  const userInput = await vscode.window.showInputBox({
    prompt: 'Optional: describe your commit intent. Leave empty to auto-analyze changes.',
    placeHolder: 'Example: refactor API error handling and improve timeout behavior',
    ignoreFocusOut: true
  });

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Commit Assistant',
        cancellable: true
      },
      async (progress, token) => {
        progress.report({ message: 'Collecting git changes...' });
        const gitContext = await collectGitContext(token);

        progress.report({ message: 'Building AI prompt...' });
        const prompt = buildPrompt(userInput, gitContext);

        const settings = getSettings();
        progress.report({ message: `Generating with ${settings.model}...` });

        const result = await generateWithCopilot(prompt, settings.model, token);
        const commitMessage = normalizeModelOutput(result.message);

        if (!commitMessage) {
          throw new Error('Model returned an empty commit message.');
        }

        const inserted = await writeToScmInputBox(commitMessage);
        await vscode.env.clipboard.writeText(commitMessage);

        if (inserted) {
          vscode.window.showInformationMessage(
            `Commit message generated with ${result.modelName} and inserted into SCM input.`
          );
        } else {
          vscode.window.showInformationMessage(
            `Commit message generated with ${result.modelName} and copied to clipboard.`
          );
        }
      }
    );
  } catch (error) {
    if (error instanceof vscode.CancellationError) {
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to generate commit message: ${message}`);
  }
}
