const utils = require("../utils");

describe("isPackageNameBanned Tests", () => {
  // Now since the editor is started in development mode for testing, we know
  // banned package lists will fallback to a static list here.
  test("Returns true correctly for banned item", async () => {
    let name = "situs-slot-gacor";
    let isBanned = await utils.isPackageNameBanned(name);
    expect(isBanned).toBeTruthy();
  });

  test("Returns false correctly for non-banned item", async () => {
    let name = "innocent-name";
    let isBanned = await utils.isPackageNameBanned(name);
    expect(isBanned).toBeFalsy();
  });
});
