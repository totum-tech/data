module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
    DEV_SERVER_PORT: 7777,
    DEV_APP_KEY: 'dTuPysQsRoyWzmsK6iegSV4U3Qu912vPpkOyx6bPuEk=',
  },
  preset: 'ts-jest',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  modulePathIgnorePatterns: ['tmp'],
  testMatch: null,
};
