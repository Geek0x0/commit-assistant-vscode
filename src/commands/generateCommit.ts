import * as vscode from 'vscode';
import { getSettings, getCustomModels, getCustomModelApiKeySecretKey } from '../config/settings';
import { collectGitContext, writeToScmInputBox } from '../core/gitService';
import { generateWithCopilot } from '../core/lmService';
import { generateWithCustomModel } from '../core/customModelService';
import { buildPrompt, buildUserOnlyPrompt, normalizeModelOutput } from '../core/promptBuilder';
import { recordUsage } from '../services/statsService';
import { t, formatTemplate } from '../i18n';

export async function generateCommitMessageCommand(context: vscode.ExtensionContext): Promise<void> {
  const userInput = await vscode.window.showInputBox({
    prompt: t().prompts.commitIntent,
    placeHolder: t().prompts.commitIntentPlaceholder,
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
        let prompt: string;

        if (userInput?.trim()) {
          progress.report({ message: t().messages.buildingPrompt });
          prompt = buildUserOnlyPrompt(userInput.trim());
        } else {
          progress.report({ message: t().messages.collectingChanges });
          const gitContext = await collectGitContext(token);

          progress.report({ message: t().messages.buildingPrompt });
          prompt = buildPrompt(userInput, gitContext);
        }

        const settings = getSettings();
        const { provider, modelName } = parseModelSetting(settings.model);
        progress.report({ message: formatTemplate(t().messages.generating, { model: modelName }) });

        if (!modelName) {
          throw new Error(t().messages.invalidModelSetting);
        }

        let result: { message: string; modelName: string };

        if (provider === 'custom') {
          const customModels = getCustomModels();
          const customConfig = customModels.find((m) => m.name === modelName);
          if (!customConfig) {
            throw new Error(formatTemplate(t().messages.customModelNotFound, { name: modelName }));
          }

          const apiKey = await context.secrets.get(getCustomModelApiKeySecretKey(modelName));
          if (!apiKey) {
            throw new Error(formatTemplate(t().messages.apiKeyNotFound, { name: modelName }));
          }

          result = await generateWithCustomModel(prompt, customConfig, apiKey, token);
        } else {
          result = await generateWithCopilot(prompt, modelName, token);
        }

        const commitMessage = normalizeModelOutput(result.message);

        if (!commitMessage) {
          throw new Error(t().messages.emptyCommitMessage);
        }

        const inserted = await writeToScmInputBox(commitMessage);
        await vscode.env.clipboard.writeText(commitMessage);

        await recordUsage(context.globalState, result.modelName);

        if (inserted) {
          vscode.window.showInformationMessage(
            formatTemplate(t().messages.commitGeneratedInserted, { model: result.modelName })
          );
        } else {
          vscode.window.showInformationMessage(
            formatTemplate(t().messages.commitGeneratedCopied, { model: result.modelName })
          );
        }
      }
    );
  } catch (error) {
    if (error instanceof vscode.CancellationError) {
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`${t().errors.generateFailed} ${message}`);
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
