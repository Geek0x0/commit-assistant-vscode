# Changelog

## 1.2.0

- **Edit custom models** — Added `Commit Assistant: Edit Custom Model` command to update an existing custom model's name, URL, model ID, and API key.
- **Safer API key handling during edit** — API key input can be left empty to keep the existing key; when renaming a model, existing secrets are migrated to the new model key.
- **Active model rename sync** — If the currently selected model is renamed, `commitAssistant.model` is automatically updated to the new `custom:<name>` value.
- **Localization updates** — Added full English and Chinese UI strings for the edit command prompts, messages, and errors.
- **Test coverage expansion** — Added dedicated tests for custom model editing and model-selection synchronization on rename.

## 1.1.1

- **Staged-only mode** — New `commitAssistant.stagedOnly` setting (default: `false`). When enabled, commit messages are generated using only staged changes — unstaged diffs and untracked files are skipped, ensuring the message matches what `git commit` will actually commit.

## 1.1.0

- **Multi-root workspace support** — When multiple git repositories are open, you are prompted to select the target repository before generating a commit message.
- **OutputChannel logging** — Replaced `console.warn` with a dedicated VS Code OutputChannel ("Commit Assistant") for better diagnostics visibility.
- **Improved error sanitization** — All error paths from custom model responses now sanitize API keys and tokens (previously only partial paths were covered). Additional patterns (`key-*`, `token-*`, `api_key=`) are now redacted.
- **Stats data TTL cleanup** — Daily and monthly usage statistics are automatically pruned after 180 days to prevent unbounded `globalState` growth.
- **Token usage tracking** — Token consumption is now tracked per model. Copilot models use character-based estimation; custom models report actual token counts from the API. Token totals are shown in the statistics dashboard.
- **esbuild bundling** — Migrated from plain `tsc` to esbuild for smaller extension package size and faster load times.
- **Expanded test coverage** — Increased from 57 to 88 tests across 9 test files (75% statements, 68% branches, 65% functions, 76% lines).

## 1.0.5

- Improved status bar statistics tooltip — now renders as a formatted Markdown table with Model, Total, Today, and This Month columns.
- Added unit tests for `promptBuilder`, `i18n`, `statsService`, and `templates` modules (57 tests, 65% coverage).

## 1.0.4

- When user provides commit intent input, the message is now generated purely from that intent without collecting git diff.
- Fixed `uiLanguage` setting — all UI strings (prompts, messages, validations, errors) are now properly localized.
- Added full Chinese (`zh`) translations for all command messages, input validations, and notifications.

## 1.0.3

- Added usage statistics tracking with status bar item and webview dashboard.
- Added daily and monthly generation counts grouped by model in global storage.
- Added commands to show and clear statistics.

## 1.0.2

- Added custom AI model support with add/remove/list commands.
- API keys for custom models are securely stored in VSCode SecretStorage.
- Custom model metadata (name, url, model) is stored in VSCode settings.
- Model setting now supports `copilot:<model>` and `custom:<name>` prefixes.
- Added support for 15 output languages for commit messages.
- Added UI language switching between English and Chinese.
- Added "Generate Commit Message" button to SourceControl panel.
- Added SSRF protection for custom model URLs.
- Added API key redaction in error messages.

## 1.0.0

- Initial implementation.
- Added command to generate commit message with optional user intent.
- Added model switching command (default model: GPT-4.1).
- Added style switching command.
- Added git diff and related history context collection.
