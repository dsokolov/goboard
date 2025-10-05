module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    testPathIgnorePatterns: ['/node_modules/', '.*test-data-loader\\.ts$'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  };
  