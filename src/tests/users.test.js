var users = require("../users.js");

var userDATAraw = require("./user.test.json");

var userDATA = Buffer.from(JSON.stringify(userDATAraw));
console.log(JSON.stringify(userDATAraw));
jest.mock('fs');

// this mock json file to hook into fs seems to be parsed incorrectly. Investigation needed.

const MOCK_FILE_INFO = {
  "/data/users.json": JSON.stringify({ "confused-Techie": { "name": "confused-Techie" }}),
  "/data/package_pointer.json": "",
  "/data/packages/uuid1.json": "",
};

beforeEach(() => {
  require("fs").__setMockFiles(MOCK_FILE_INFO);
});

var getuser = [ ["idk", "confused-Techie" ] ];

test("We get our Test User Back", async () => {
  const data = await users.GetUser("confused-Techie");
  const res = {
    name: "confused-Techie",
    tokens: [ "valid_token" ],
    stars: [ "what-a-package", "starsss" ]
  };
  expect(data.content).toBe(res);
});
