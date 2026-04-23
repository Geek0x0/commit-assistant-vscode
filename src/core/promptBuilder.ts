import type { GitContext } from '../types';
import { getSettings } from '../config/settings';
import { getTemplate } from '../prompts/templates';

function languageInstruction(language: 'english' | 'chinese'): string {
  return language === 'chinese'
    ? 'Please write the commit message in Chinese.'
    : 'Please write the commit message in English.';
}

function buildAutoStyleInstruction(language: 'english' | 'chinese'): string {
  const fallbackLanguage = language === 'chinese' ? 'Chinese' : 'English';

  return `Generate a commit message that matches this repository's existing commit message style.

You may be given recent commit history in a previous message.

Rules:
1. If recent commit history is provided, infer the predominant commit message format/style AND language from it.
2. If the inferred language is clear, write the commit message in that language.
3. If the inferred language is mixed or unclear (or no history is provided), write the commit message in ${fallbackLanguage}.
4. Produce ONE commit message for the current changes using the inferred style.
5. If the inferred style is mixed or unclear (or no history is provided), fall back to a single plain sentence (no prefixes, no emojis, no issue refs).
6. Keep it concise (ideally <= 72 characters for the first line).
7. Output the commit message only.`;
}

export function buildPrompt(userInput: string | undefined, context: GitContext): string {
  const settings = getSettings();

  const stylePrompt =
    settings.style === 'auto'
      ? buildAutoStyleInstruction(settings.language)
      : `${getTemplate(settings.style)}\n\n${languageInstruction(settings.language)}`;

  const intentBlock = userInput?.trim()
    ? `User intent for this commit:\n${userInput.trim()}\n\nUse this intent as primary guidance.`
    : 'No user intent was provided. Infer the best commit message directly from code changes and file history.';

  return `${stylePrompt}

${intentBlock}

Repository path:
${context.repoPath}

Changed files:
${context.changedFiles.length > 0 ? context.changedFiles.map((f) => `- ${f}`).join('\n') : '(none)'}

Staged diff:
${context.stagedDiff || '(none)'}

Unstaged diff:
${context.unstagedDiff || '(none)'}

Untracked summary:
${context.untrackedSummary || '(none)'}

Related history:
${context.relatedHistory || '(none)'}

IMPORTANT: Return ONLY the commit message text, no markdown fences, no explanation.`;
}

export function normalizeModelOutput(raw: string): string {
  let cleaned = (raw || '').trim();
  const fenced = cleaned.match(/^```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)\r?\n```\s*$/);
  if (fenced) {
    cleaned = fenced[1].trim();
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}
