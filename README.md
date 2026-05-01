# Commit Assistant (VS Code Extension)

Generate Git commit messages with AI models — powered by GitHub Copilot or your own custom AI endpoints.

## Features

- **AI-Powered Commit Messages** — Generate commit messages from git diff and related history, or purely from your own description.
- **Optional Intent Input** — Describe what you intend to commit; leave empty to auto-analyze changes. When provided, the message is generated solely from your description.
- **Multiple AI Models** — Use GitHub Copilot models or add custom OpenAI-compatible endpoints.
- **Multiple Languages** — Generate commit messages in 15 supported languages.
- **Commit Styles** — Choose from conventional, angular, semantic, emoji, and more.
- **Source Control Integration** — One-click button in the SCM panel to generate messages.
- **Multi-Root Workspace** — When multiple git repositories are open, select the target repository from a quick pick.
- **Usage Statistics** — Track daily/monthly generation counts and token usage per model via the status bar and dashboard.
- **Bilingual UI** — Switch the extension UI between English and Chinese. All prompts, messages, validations, and errors are fully localized.

## Commands

- **Commit Assistant: Generate Commit Message**
  - Prompts for optional user intent. Leave empty to auto-analyze changes.
  - The generated message is inserted into the SCM input box (when available) and copied to clipboard.
- **Commit Assistant: Switch Model**
  - Switch between GitHub Copilot models or custom models.
  - Format: `copilot:<model>` or `custom:<name>`.
- **Commit Assistant: Switch Style**
  - Select commit message style: `auto`, `plain`, `conventional`, `angular`, `karma`, `semantic`, `emoji`, `emojiKarma`, `google`, `atom`.
- **Commit Assistant: Switch Language**
  - Select the output language for generated commit messages.
- **Commit Assistant: Switch UI Language**
  - Switch command titles and messages between English (`en`) and Chinese (`zh`).
- **Commit Assistant: Add Custom Model**
  - Register a custom AI model by providing name, API key, URL, and model ID.
  - API keys are securely stored in VSCode SecretStorage.
- **Commit Assistant: Remove Custom Model**
  - Remove a previously added custom model.
- **Commit Assistant: List Custom Models**
  - View all configured custom models.
- **Commit Assistant: Show Statistics**
  - Open a dashboard showing daily/monthly usage and token consumption per model.
- **Commit Assistant: Clear Statistics**
  - Reset all usage statistics.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `commitAssistant.model` | `string` | `copilot:gpt-4.1` | Preferred model. Use `copilot:<model>` for GitHub Copilot or `custom:<name>` for custom models. |
| `commitAssistant.style` | `enum` | `conventional` | Commit message style mode. |
| `commitAssistant.language` | `enum` | `english` | Output language for commit messages. |
| `commitAssistant.uiLanguage` | `enum` | `en` | UI language (`en` or `zh`). |
| `commitAssistant.maxDiffChars` | `number` | `16000` | Maximum diff characters sent to the model (2000–60000). |
| `commitAssistant.customModels` | `array` | `[]` | Custom model configurations (`name`, `url`, `model`). |

### Supported Output Languages

`english`, `chinese`, `spanish`, `french`, `german`, `japanese`, `korean`, `russian`, `portuguese`, `italian`, `dutch`, `turkish`, `polish`, `vietnamese`, `arabic`

## Custom Models

You can use any OpenAI-compatible API endpoint as a custom model:

1. Run **Commit Assistant: Add Custom Model**.
2. Enter a unique name (e.g., `my-openai`).
3. Enter your API key — it will be stored securely in VSCode SecretStorage.
4. Enter the API endpoint URL (e.g., `https://api.openai.com/v1/chat/completions`).
5. Enter the model name (e.g., `gpt-4o`).

Then set `commitAssistant.model` to `custom:my-openai`.

## Usage Statistics

A status bar item appears at the bottom-right of VS Code. Hover to see a formatted table with today's and this month's generation counts per model. Click to open a detailed dashboard with:

- Total generations per model
- Token usage per model
- Daily and monthly usage breakdowns with bar charts

Statistics older than 180 days are automatically pruned.

## Development

```bash
npm install
npm run esbuild       # bundle with esbuild
npm run esbuild:watch # watch mode
npm run build         # compile with tsc (type checking)
npm test              # run tests
```

Run extension in debug host:

1. Open this folder in VS Code.
2. Press `F5` to launch Extension Development Host.
3. Open Command Palette and run one of the commands above.

## Notes

- GitHub Copilot models require the GitHub Copilot extension and a valid subscription.
- Custom models use OpenAI-compatible chat completions format.
- URL security validation blocks private IPs and localhost for safety.
- Token usage for Copilot models is estimated (~4 chars per token); custom models report actual usage from the API response.
