const storage = require("../dev-runner/storage.js");

describe("Functions Return Proper Values", () => {
  test("getBanList Dev Returns Array", async () => {
    let value = storage.getBanList();
    expect(Array.isArray(value)).toBeTruthy();
  });

  test("getFeaturedPackages Dev Returns Array", async () => {
    let value = storage.getFeaturedPackages();
    expect(Array.isArray(value)).toBeTruthy();
  });

  test("getFeaturedThemes Dev Returns Array", async () => {
    let value = storage.getFeaturedThemes();
    expect(Array.isArray(value)).toBeTruthy();
  });
});
