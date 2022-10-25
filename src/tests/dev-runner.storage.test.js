const storage = require("../dev-runner/storage.js");

describe("Functions Return Proper Values", () => {

  test("getBanList Dev Returns Array", async () => {
    let return = storage.getBanList();
    expect(Array.isArray(return)).toBeTruthy();
  });

  test("getFeaturedPackages Dev Returns Array", async () => {
    let return = storage.getFeaturedPackages();
    expect(Array.isArray(return)).toBeTruthy();
  });

  test("getFeaturedThemes Dev Returns Array", async () => {
    let return = storage.getFeaturedThemes();
    expect(Array.isArray(return)).toBeTruthy();
  });

});
