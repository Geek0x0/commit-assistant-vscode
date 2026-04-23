export const COMMANDS = {
  generateMessage: 'commitAssistant.generateMessage',
  switchModel: 'commitAssistant.switchModel',
  switchStyle: 'commitAssistant.switchStyle'
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

export type CommitLanguage = 'english' | 'chinese';

export interface ExtensionSettings {
  model: string;
  style: CommitStyle;
  language: CommitLanguage;
  maxDiffChars: number;
}

export interface GitContext {
  repoPath: string;
  stagedDiff: string;
  unstagedDiff: string;
  untrackedSummary: string;
  changedFiles: string[];
  relatedHistory: string;
}
