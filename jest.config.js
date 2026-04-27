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
    'src/config/settings.ts'
  ],
  coverageThreshold: {
    'src/core/customModelService.ts': {
      statements: 30,
      branches: 20,
      lines: 30,
      functions: 15
    },
    'src/config/settings.ts': {
      statements: 50,
      branches: 0,
      lines: 50,
      functions: 10
    }
  }
};
