/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^vscode$': '<rootDir>/src/__mocks__/vscode.ts'
  },
  collectCoverageFrom: [
    'src/types/index.ts',
    'src/core/customModelService.ts',
    'src/core/promptBuilder.ts',
    'src/config/settings.ts',
    'src/i18n/index.ts',
    'src/services/statsService.ts',
    'src/prompts/templates.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 40,
      lines: 60,
      functions: 40
    }
  }
};
