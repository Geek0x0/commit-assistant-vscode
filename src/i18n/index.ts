import type { UiLanguage } from '../types';

interface Translation {
  commands: {
    generateMessage: string;
    switchModel: string;
    switchStyle: string;
    switchLanguage: string;
    switchUiLanguage: string;
    addCustomModel: string;
    removeCustomModel: string;
    listCustomModels: string;
  };
  prompts: {
    commitIntent: string;
    commitIntentPlaceholder: string;
    modelName: string;
    modelNamePlaceholder: string;
    apiKey: string;
    url: string;
    urlPlaceholder: string;
    modelId: string;
    modelIdPlaceholder: string;
    selectModel: string;
    selectStyle: string;
    selectLanguage: string;
    selectUiLanguage: string;
    selectCustomModelToRemove: string;
  };
  messages: {
    generating: string;
    collectingChanges: string;
    buildingPrompt: string;
    modelSet: string;
    styleSet: string;
    languageSet: string;
    uiLanguageSet: string;
    customModelAdded: string;
    customModelRemoved: string;
    noCustomModels: string;
    commitGeneratedInserted: string;
    commitGeneratedCopied: string;
    emptyCommitMessage: string;
    customModelNotFound: string;
    apiKeyNotFound: string;
    invalidModelSetting: string;
    maxModelsReached: string;
    urlNotAllowed: string;
    noChanges: string;
    notGitRepo: string;
    noWorkspace: string;
    confirmRemove: string;
    remove: string;
  };
  errors: {
    generateFailed: string;
    switchModelFailed: string;
    switchStyleFailed: string;
    switchLanguageFailed: string;
    addModelFailed: string;
    removeModelFailed: string;
    requestFailed: string;
    requestTimeout: string;
  };
  validations: {
    nameRequired: string;
    nameTooLong: string;
    nameInvalidChars: string;
    nameExists: string;
    apiKeyRequired: string;
    urlRequired: string;
    urlTooLong: string;
    urlInvalid: string;
    urlProtocolNotAllowed: string;
    urlNotAllowed: string;
    modelRequired: string;
    modelTooLong: string;
  };
}

const translations: Record<UiLanguage, Translation> = {
  en: {
    commands: {
      generateMessage: 'Commit Assistant: Generate Commit Message',
      switchModel: 'Commit Assistant: Switch Model',
      switchStyle: 'Commit Assistant: Switch Style',
      switchLanguage: 'Commit Assistant: Switch Language',
      switchUiLanguage: 'Commit Assistant: Switch UI Language',
      addCustomModel: 'Commit Assistant: Add Custom Model',
      removeCustomModel: 'Commit Assistant: Remove Custom Model',
      listCustomModels: 'Commit Assistant: List Custom Models'
    },
    prompts: {
      commitIntent: 'Optional: describe your commit intent. Leave empty to auto-analyze changes.',
      commitIntentPlaceholder: 'Example: refactor API error handling and improve timeout behavior',
      modelName: 'Enter a unique name for this custom model (e.g., my-openai)',
      modelNamePlaceholder: 'my-openai',
      apiKey: 'Enter API key for',
      url: 'Enter API endpoint URL for',
      urlPlaceholder: 'https://api.openai.com/v1/chat/completions',
      modelId: 'Enter model name for',
      modelIdPlaceholder: 'gpt-4o',
      selectModel: 'Select a model for commit generation',
      selectStyle: 'Select commit message style',
      selectLanguage: 'Select output language for commit messages',
      selectUiLanguage: 'Select UI language',
      selectCustomModelToRemove: 'Select a custom model to remove'
    },
    messages: {
      generating: 'Generating with',
      collectingChanges: 'Collecting git changes...',
      buildingPrompt: 'Building AI prompt...',
      modelSet: 'Commit Assistant model set to:',
      styleSet: 'Commit Assistant style set to:',
      languageSet: 'Commit Assistant language set to:',
      uiLanguageSet: 'Commit Assistant UI language set to:',
      customModelAdded: 'Custom model added successfully.',
      customModelRemoved: 'Custom model removed.',
      noCustomModels: 'No custom models configured.',
      commitGeneratedInserted: 'Commit message generated with {model} and inserted into SCM input.',
      commitGeneratedCopied: 'Commit message generated with {model} and copied to clipboard.',
      emptyCommitMessage: 'Model returned an empty commit message.',
      customModelNotFound: 'Custom model "{name}" not found. Add it via "Commit Assistant: Add Custom Model".',
      apiKeyNotFound: 'API key for custom model "{name}" not found. Please reconfigure the model.',
      invalidModelSetting: 'Invalid model setting: model name cannot be empty',
      maxModelsReached: 'You can only configure up to {max} custom models. Remove one first.',
      urlNotAllowed: 'This URL is not allowed for security reasons',
      noChanges: 'No changes detected.',
      notGitRepo: 'Current workspace is not a git repository.',
      noWorkspace: 'No workspace folder is opened.',
      confirmRemove: 'Remove custom model',
      remove: 'Remove'
    },
    errors: {
      generateFailed: 'Failed to generate commit message:',
      switchModelFailed: 'Failed to switch model:',
      switchStyleFailed: 'Failed to switch style:',
      switchLanguageFailed: 'Failed to switch language:',
      addModelFailed: 'Failed to add custom model:',
      removeModelFailed: 'Failed to remove custom model:',
      requestFailed: 'Custom model request failed. Please check your network and API configuration.',
      requestTimeout: 'Request timed out after 60s'
    },
    validations: {
      nameRequired: 'Name is required',
      nameTooLong: 'Name must be {max} characters or less',
      nameInvalidChars: 'Name can only contain letters, numbers, hyphens, and underscores',
      nameExists: 'A model named "{name}" already exists',
      apiKeyRequired: 'API key is required',
      urlRequired: 'URL is required',
      urlTooLong: 'URL must be {max} characters or less',
      urlInvalid: 'Please enter a valid URL',
      urlProtocolNotAllowed: 'Only HTTP and HTTPS URLs are allowed',
      urlNotAllowed: 'This URL is not allowed for security reasons',
      modelRequired: 'Model name is required',
      modelTooLong: 'Model name must be {max} characters or less'
    }
  },
  zh: {
    commands: {
      generateMessage: '提交助手：生成提交信息',
      switchModel: '提交助手：切换模型',
      switchStyle: '提交助手：切换风格',
      switchLanguage: '提交助手：切换语言',
      switchUiLanguage: '提交助手：切换界面语言',
      addCustomModel: '提交助手：添加自定义模型',
      removeCustomModel: '提交助手：移除自定义模型',
      listCustomModels: '提交助手：列出自定义模型'
    },
    prompts: {
      commitIntent: '可选：描述您的提交意图。留空将自动分析更改。',
      commitIntentPlaceholder: '例如：重构 API 错误处理并改进超时行为',
      modelName: '为此自定义模型输入唯一名称（例如：my-openai）',
      modelNamePlaceholder: 'my-openai',
      apiKey: '为"{name}"输入 API 密钥',
      url: '为"{name}"输入 API 端点 URL',
      urlPlaceholder: 'https://api.openai.com/v1/chat/completions',
      modelId: '为"{name}"输入模型名称',
      modelIdPlaceholder: 'gpt-4o',
      selectModel: '选择用于生成提交的模型',
      selectStyle: '选择提交信息风格',
      selectLanguage: '选择提交信息的输出语言',
      selectUiLanguage: '选择界面语言',
      selectCustomModelToRemove: '选择要移除的自定义模型'
    },
    messages: {
      generating: '正在使用 {model} 生成...',
      collectingChanges: '正在收集 Git 更改...',
      buildingPrompt: '正在构建 AI 提示词...',
      modelSet: '提交助手模型已设置为：',
      styleSet: '提交助手风格已设置为：',
      languageSet: '提交助手语言已设置为：',
      uiLanguageSet: '提交助手界面语言已设置为：',
      customModelAdded: '自定义模型添加成功。',
      customModelRemoved: '自定义模型已移除。',
      noCustomModels: '未配置自定义模型。',
      commitGeneratedInserted: '已使用 {model} 生成提交信息并插入到 SCM 输入框。',
      commitGeneratedCopied: '已使用 {model} 生成提交信息并复制到剪贴板。',
      emptyCommitMessage: '模型返回了空的提交信息。',
      customModelNotFound: '未找到自定义模型 "{name}"。请通过"提交助手：添加自定义模型"进行添加。',
      apiKeyNotFound: '未找到自定义模型 "{name}" 的 API 密钥。请重新配置该模型。',
      invalidModelSetting: '无效的模型设置：模型名称不能为空',
      maxModelsReached: '最多只能配置 {max} 个自定义模型。请先移除一个。',
      urlNotAllowed: '出于安全原因，不允许此 URL',
      noChanges: '未检测到更改。',
      notGitRepo: '当前工作区不是 Git 仓库。',
      noWorkspace: '未打开工作区文件夹。',
      confirmRemove: '移除自定义模型',
      remove: '移除'
    },
    errors: {
      generateFailed: '生成提交信息失败：',
      switchModelFailed: '切换模型失败：',
      switchStyleFailed: '切换风格失败：',
      switchLanguageFailed: '切换语言失败：',
      addModelFailed: '添加自定义模型失败：',
      removeModelFailed: '移除自定义模型失败：',
      requestFailed: '自定义模型请求失败。请检查网络和 API 配置。',
      requestTimeout: '请求超时（60秒）'
    },
    validations: {
      nameRequired: '名称为必填项',
      nameTooLong: '名称必须不超过 {max} 个字符',
      nameInvalidChars: '名称只能包含字母、数字、连字符和下划线',
      nameExists: '已存在名为 "{name}" 的模型',
      apiKeyRequired: 'API 密钥为必填项',
      urlRequired: 'URL 为必填项',
      urlTooLong: 'URL 必须不超过 {max} 个字符',
      urlInvalid: '请输入有效的 URL',
      urlProtocolNotAllowed: '仅允许 HTTP 和 HTTPS URL',
      urlNotAllowed: '出于安全原因，不允许此 URL',
      modelRequired: '模型名称为必填项',
      modelTooLong: '模型名称必须不超过 {max} 个字符'
    }
  }
};

let currentUiLanguage: UiLanguage = 'en';

export function setUiLanguage(lang: UiLanguage): void {
  currentUiLanguage = lang;
}

export function getUiLanguage(): UiLanguage {
  return currentUiLanguage;
}

export function t(): Translation {
  return translations[currentUiLanguage];
}

export function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key) => String(vars[key] ?? `{${key}}`));
}
