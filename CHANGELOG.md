# Changelog

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
