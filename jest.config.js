/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.test.ts'], // adjust if needed
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testPathIgnorePatterns: ['/dist/'],
};