export const COMMANDS = {
  generateMessage: 'commitAssistant.generateMessage',
  switchModel: 'commitAssistant.switchModel',
  switchStyle: 'commitAssistant.switchStyle',
  switchLanguage: 'commitAssistant.switchLanguage',
  switchUiLanguage: 'commitAssistant.switchUiLanguage',
  addCustomModel: 'commitAssistant.addCustomModel',
  removeCustomModel: 'commitAssistant.removeCustomModel',
  listCustomModels: 'commitAssistant.listCustomModels',
  showStats: 'commitAssistant.showStats',
  clearStats: 'commitAssistant.clearStats'
} as const;

export type CommitStyle =
  | 'auto'
  | 'plain'
  | 'conventional'
  | 'angular'
  | 'karma'
  | 'semantic'
  | 'emoji'
  | 'emojiKarma'
  | 'google'
  | 'atom';

export type CommitLanguage =
  | 'english'
  | 'chinese'
  | 'spanish'
  | 'french'
  | 'german'
  | 'japanese'
  | 'korean'
  | 'russian'
  | 'portuguese'
  | 'italian'
  | 'dutch'
  | 'turkish'
  | 'polish'
  | 'vietnamese'
  | 'arabic';

export type UiLanguage = 'en' | 'zh';

export interface ExtensionSettings {
  model: string;
  style: CommitStyle;
  language: CommitLanguage;
  maxDiffChars: number;
  stagedOnly: boolean;
  uiLanguage: UiLanguage;
}

export interface GitContext {
  repoPath: string;
  stagedDiff: string;
  unstagedDiff: string;
  untrackedSummary: string;
  changedFiles: string[];
  relatedHistory: string;
}

export interface CustomModelConfig {
  name: string;
  url: string;
  model: string;
}

export interface ModelStats {
  daily: Record<string, number>;
  monthly: Record<string, number>;
  totalTokens: number;
}

export interface StatsData {
  models: Record<string, ModelStats>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
