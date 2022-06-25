/* global jest */
// Global Config declared for ESLint

const path = require("path");
const fs = jest.createMockFromModule("fs");

// Custom function for tests, based off Jest's example on https://jestjs.io/docs/manual-mocks

let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

fs.__setMockFiles = __setMockFiles;

module.exports = fs;
