const query = require("../query.js");

// Page Testing

const page_cases = [
  [{ query: { page: "3" } }, "3"],
  [{ query: {} }, 1],
  [{ query: { page: "2" } }, "2"],
];
// once proper type conversion is implemented the last test should pass a string "2"

describe("Verify Page Query Returns", () => {
  test.each(page_cases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.page(arg)).toBe(expectedResult);
  });
});

const sort_cases = [
  [{ query: { sort: "stars" } }, "stars"],
  [{ query: { sort: "starr" } }, "downloads"],
  [{ query: {} }, "downloads"],
];

describe("Verify Sort Query Returns", () => {
  test.each(sort_cases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.sort(arg)).toBe(expectedResult);
  });
});

const dir_cases = [
  [{ query: { direction: "asc" } }, "asc"],
  [{ query: { direction: "desc" } }, "desc"],
  [{ query: {} }, "desc"],
];

describe("Verify Direction Query Returns", () => {
  test.each(dir_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.dir(arg)).toBe(result);
  });
});

const query_cases = [
  [{ query: { q: "search-term" } }, "search-term"],
  [{ query: {} }, ""],
];

describe("Verify 'Query' Query Returns", () => {
  test.each(query_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.query(arg)).toBe(result);
  });
});

const engine_cases = [[{ query: { engine: "0.1.2" } }, "0.1.2"]];

describe("Verify Engine Query Returns", () => {
  test.each(engine_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.engine(arg)).toBe(result);
  });
});

const repo_cases = [
  [{ query: { repository: "owner/repo" } }, "owner/repo"],
  [{ query: {} }, ""],
];

describe("Verify Repo Query Returns", () => {
  test.each(repo_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.repo(arg)).toBe(result);
  });
});

const tag_cases = [
  [{ query: { tag: "latest" } }, "latest"],
  [{ query: {} }, ""],
];

describe("Verify Tag Query Returns", () => {
  test.each(tag_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.tag(arg)).toBe(result);
  });
});

const rename_cases = [
  [{ query: { rename: "true" } }, true],
  [{ query: { rename: "false" } }, false],
  [{ query: {} }, false],
];

describe("Verify Rename Query Returns", () => {
  test.each(rename_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.rename(arg)).toBe(result);
  });
});
