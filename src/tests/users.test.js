var users = require("../users.js");

jest.mock('fs');

var USERS_MOCK_FILE = {
  "confused-Techie": {
    "name": "confused-Techie",
    "tokens": [ "valid_token" ],
    "stars": [ "what-a-package", "starsss" ]
  }
};

const MOCK_FILE_INFO = {
  "/data/users.json": JSON.stringify(USER_MOCK_FILE),
  "/data/package_pointer.json": "",
  "/data/packages/uuid1.json": "",
};

beforeEach(() => {
  require("fs").__setMockFiles(MOCK_FILE_INFO);
});

var getuser = [ ["idk", "confused-Techie" ] ];

describe("Verify GetUser Return", async () => {
  test.each(getuser)("Given %o Returns %o", (arg, res) => {
    expect(users.GetUser(arg)).toBe(res);
  });
});
