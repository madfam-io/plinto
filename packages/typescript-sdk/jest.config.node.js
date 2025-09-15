// Jest configuration for TypeScript SDK package - Node environment tests
module.exports = {
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  displayName: 'typescript-sdk-node',

  // Setup files for node environment
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup-node.ts',
  ],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@plinto/(.*)$': '<rootDir>/../../packages/$1/src',
  },

  // Test patterns - only env-utils for now
  testMatch: [
    '<rootDir>/src/__tests__/env-utils.test.ts',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    }],
  },
};