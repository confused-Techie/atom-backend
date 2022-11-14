const git = require("../git.js");
const githubMock = require("../dev-runner/github_mock.js");

let serve;

git.setGHAPIURL("localhost:9999");
git.setGHWebURL("localhost:9999");

jest.setTimeout(10000);

beforeAll(() => {
  serve = githubMock.listen("9999", () => {
    console.log("GitHub Mock API Server is Up");
  });
});

afterAll(() => {
  serve.close();
});

describe("git.ownership() Tests", () => {
  test("Returns true for valid ownership", async () => {
    let res = await git.ownership(
      {
        username: "admin_user",
        token: "admin-token",
      },
      "admin_user/atom-backend",
      true
    );
    expect(res.ok).toBeTruthy();
  });
  test("Returns false for invalid ownership", async () => {
    let res = await git.ownership(
      {
        username: "no_perm_user",
        token: "no-valid-token",
      },
      "no_perm_user/atom-backend",
      true
    );
    expect(res.ok).toBeFalsy();
  });
});
