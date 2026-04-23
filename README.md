# Commit Assistant (VS Code Extension)

Use GitHub Copilot models in VS Code to generate commit messages.

## Commands

- `Commit Assistant: Generate Commit Message`
  - First prompts for optional user intent.
  - If input is provided, generation prioritizes that intent.
  - If input is empty, generation relies on git diff and related history.
  - The generated message is inserted into SCM input box when available, and always copied to clipboard.
- `Commit Assistant: Switch Model`
  - Select preferred model (default: `gpt-4.1`) or enter custom value.
- `Commit Assistant: Switch Style`
  - Select commit style mode.

## Settings

- `commitAssistant.model` (string, default: `gpt-4.1`)
- `commitAssistant.style` (enum, default: `conventional`)
  - `auto`, `plain`, `conventional`, `angular`, `karma`, `semantic`, `emoji`, `emojiKarma`, `google`, `atom`
- `commitAssistant.language` (enum, default: `english`)
  - `english`, `chinese`
- `commitAssistant.maxDiffChars` (number, default: `16000`)

## Development

```bash
npm install
npm run build
```

Run extension in debug host:

1. Open this folder in VS Code.
2. Press `F5` to launch Extension Development Host.
3. Open Command Palette and run one of the commands above.

## Notes

- This extension uses VS Code Language Model API (`vscode.lm`) and requires GitHub Copilot model availability.
- Templates in `src/prompts/templates.ts` follow the provided reference definitions.
