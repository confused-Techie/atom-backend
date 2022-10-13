jest.mock('../storage.js');
const getBanList = require('../storage.js').getBanList;

const utils = require("../utils");

describe("isPackageNameBanned Tests", () => {

  test("Returns true correctly for banned item", async () => {
    getBanList.mockResolvedValue({ ok: true, content: ['banned-item'] });
    let name = "banned-item";

    let isBanned = await utils.isPackageNameBanned(name);

    expect(isBanned.ok).toBeTruthy();
  });

  test("Returns false correctly for non-banned item", async () => {
    getBanList.mockResolvedValue({ ok: true, content: ['banned-item'] });
    let name = "not-banned-item";

    let isBanned = await utils.isPackageNameBanned(name);

    expect(isBanned.ok).toBeFalsy();
  });

  test("Returns true if no banned list can be retrieved", async () => {
    getBanList.mockResolvedValue({ ok: false });

    let isBanned = await utils.isPackageNameBanned('any');

    expect(isBanned.ok).toBeTruthy();
  })
});
