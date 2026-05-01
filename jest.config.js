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
    'src/prompts/templates.ts',
    'src/log.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 55,
      lines: 70,
      functions: 64
    }
  }
};
