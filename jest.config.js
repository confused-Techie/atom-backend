const config = {
  projects: [
    {
      displayName: "Integration-Tests",
      collectCoverage: true,
      coverageReporters: ["json-summary", "text", "lcovonly"],
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      testMatch: ["<rootDir>/src/tests_integration/main.test.js"],
    },
    {
      displayName: "Unit-Tests",
      collectCoverage: true,
      coverageReporters: ["json-summary", "text", "lcovonly"],
      testMatch: ["<rootDir>/src/tests/*.js"],
    },
  ],
};

module.exports = config;
