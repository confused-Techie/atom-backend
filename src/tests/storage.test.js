const storage = require("../storage.js");

describe("Functions Return Proper Values", () => {
  test("getBanList Returns Array", async () => {
    let value = await storage.getBanList();
    expect(Array.isArray(value)).toBeTruthy();
  });

  test("getFeaturedPackages Returns Array", async () => {
    let value = await storage.getFeaturedPackages();
    expect(Array.isArray(value)).toBeTruthy();
  });

  test("getFeaturedThemes Returns Array", async () => {
    let value = await storage.getFeaturedThemes();
    expect(Array.isArray(value)).toBeTruthy();
  });
});
