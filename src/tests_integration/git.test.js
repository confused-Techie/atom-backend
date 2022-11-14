const git = require("../git.js");
const config = require("../config.js").getConfig();

jest.setTimeout(10000);

describe("git.Ownership", () => {
  test("Returns true for valid ownership", async () => {
    let res = await git.ownership(
      {
        username: config.GH_USERNAME,
        token: config.GH_TOKEN,
      },
      "confused-Techie/atom-backend",
      true
    );
    expect(res.ok).toBeTruthy();
  });
  test("Returns false for invalid ownership", async () => {
    let res = await git.ownership(
      {
        username: config.GH_USERNAME,
        token: config.GH_TOKEN,
      },
      "confused-Techie/atom-backend-thisDoesntExist",
      true
    );
    expect(res.ok).toBeFalsy();
    expect(res.short).toEqual("No Repo Access");
  });
  test("Returns false for invalid token on valid repo", async () => {
    let res = await git.ownership(
      {
        username: config.GH_USERNAME,
        token: "badtoken",
      },
      "confused-Techie/atom-backend",
      true
    );
    expect(res.ok).toBeFalsy();
    expect(res.content).toEqual("Unrefreshed token.");
    expect(res.short).toEqual("Server Error");
  });
});

describe("git.createpackage", () => {
  test.todo("Write these");
});
