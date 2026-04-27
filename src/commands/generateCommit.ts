import * as vscode from 'vscode';
import { getSettings, getCustomModels, getCustomModelApiKeySecretKey } from '../config/settings';
import { collectGitContext, writeToScmInputBox } from '../core/gitService';
import { generateWithCopilot } from '../core/lmService';
import { generateWithCustomModel } from '../core/customModelService';
import { buildPrompt, normalizeModelOutput } from '../core/promptBuilder';

export async function generateCommitMessageCommand(context: vscode.ExtensionContext): Promise<void> {
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
        const { provider, modelName } = parseModelSetting(settings.model);
        progress.report({ message: `Generating with ${modelName}...` });

        if (!modelName) {
          throw new Error('Invalid model setting: model name cannot be empty');
        }

        let result: { message: string; modelName: string };

        if (provider === 'custom') {
          const customModels = getCustomModels();
          const customConfig = customModels.find((m) => m.name === modelName);
          if (!customConfig) {
            throw new Error(`Custom model "${modelName}" not found. Add it via "Commit Assistant: Add Custom Model".`);
          }

          const apiKey = await context.secrets.get(getCustomModelApiKeySecretKey(modelName));
          if (!apiKey) {
            throw new Error(`API key for custom model "${modelName}" not found. Please reconfigure the model.`);
          }

          result = await generateWithCustomModel(prompt, customConfig, apiKey, token);
        } else {
          result = await generateWithCopilot(prompt, modelName, token);
        }

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

function parseModelSetting(model: string): { provider: 'copilot' | 'custom'; modelName: string } {
  const trimmed = model.trim();
  if (trimmed.startsWith('custom:')) {
    return { provider: 'custom', modelName: trimmed.slice('custom:'.length).trim() };
  }
  if (trimmed.startsWith('copilot:')) {
    return { provider: 'copilot', modelName: trimmed.slice('copilot:'.length).trim() };
  }
  // Backward compatibility: plain model names default to copilot
  return { provider: 'copilot', modelName: trimmed };
}
