const config = {
  collectCoverage: true,
  coverageReporters: ["text", "clover"],
  projects: [
    {
      displayName: "Integration-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      testMatch: ["<rootDir>/src/tests_integration/*.test.js"],
    },
    {
      displayName: "Unit-Tests",
      testMatch: ["<rootDir>/src/tests/*.test.js"],
    },
  ],
};

module.exports = config;
