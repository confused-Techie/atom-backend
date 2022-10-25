const storage = require("../storage.js");

describe("Functions Return Proper Values", () => {

  test("getBanList Returns Array", async () => {
    let return = storage.getBanList();
    expect(Array.isArray(return)).toBeTruthy();
  });

  test("getFeaturedPackages Returns Array", async () => {
    let return = storage.getFeaturedPackages();
    expect(Array.isArray(return)).toBeTruthy();
  });

  test("getFeaturedThemes Returns Array", async () => {
    let return = storage.getFeaturedThemes();
    expect(Array.isArray(return)).toBeTruthy();
  });

});
