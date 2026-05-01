import * as vscode from 'vscode';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function modelMatchTokens(model: vscode.LanguageModelChat): string[] {
  const values = [model.name, model.vendor, model.family, model.version]
    .map((value) => normalize(value ?? ''))
    .filter(Boolean);

  return Array.from(new Set(values));
}

async function pickModel(preferredModel: string): Promise<vscode.LanguageModelChat> {
  const models = await vscode.lm.selectChatModels();
  if (!models.length) {
    throw new Error('No language model is available. Ensure GitHub Copilot is enabled.');
  }

  const preferred = normalize(preferredModel);

  const exact = models.find((model) => modelMatchTokens(model).some((token) => token === preferred));
  if (exact) {
    return exact;
  }

  const partial = models.find((model) => modelMatchTokens(model).some((token) => token.includes(preferred)));
  if (partial) {
    return partial;
  }

  const fallback = models.find((model) => modelMatchTokens(model).some((token) => token.includes('gpt-4.1')));

  return fallback ?? models[0];
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function listAvailableModelNames(): Promise<string[]> {
  const models = await vscode.lm.selectChatModels();
  const names = models
    .map((model) => model.name?.trim() || [model.vendor, model.family].filter(Boolean).join('/').trim())
    .filter(Boolean);

  return Array.from(new Set(names));
}

export async function generateWithCopilot(
  prompt: string,
  preferredModel: string,
  token: vscode.CancellationToken
): Promise<{ message: string; modelName: string; tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const model = await pickModel(preferredModel);
  const messages = [vscode.LanguageModelChatMessage.User(prompt)];
  const response = await model.sendRequest(messages, {}, token);

  let text = '';
  for await (const chunk of response.text) {
    if (token.isCancellationRequested) {
      throw new vscode.CancellationError();
    }
    text += chunk;
  }

  const promptTokens = estimateTokens(prompt);
  const completionTokens = estimateTokens(text);

  return {
    message: text,
    modelName: model.name ?? preferredModel,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    }
  };
}
