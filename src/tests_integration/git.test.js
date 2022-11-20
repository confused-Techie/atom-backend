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
  test("Returns false for bad token", async () => {
    let res = await git.ownership(
      {
        username: "no_perm_user",
        token: "no-valid-token",
      },
      "no_perm_user/atom-backend",
      true
    );
    expect(res.ok).toBeFalsy();
    expect(res.content).toEqual("Unrefreshed token.");
  });
  test("Returns false for invalid ownership", async () => {
    let res = await git.ownership(
      {
        username: "admin_user",
        token: "admin-token",
      },
      "admin_user/atom-frontend",
      true
    );
    expect(res.ok).toBeFalsy();
    expect(res.short).toEqual("No Repo Access");
  });
});

describe("git.createPackage Tests", () => {
  test.todo("Write all of these");
  test("Returns Bad Repo Short when provided a bad repo", async () => {
    let res = await git.createPackage("git-test/does-not-exist", { token: "valid-token", id: "xxx", node_id: "xxx", username: "xxx" });
    expect(res.ok).toBeFalsy();
    expect(res.short).toEqual("Bad Repo");
  });
  test("Returns OK Status when provided a valid repo", async () => {
    let res = await git.createPackage("git-test/atom-backend", { token: "valid-token", id: "xxx", node_id: "xxx", username: "xxx" });
    expect(res.ok).toBeTruthy();
  });
  test("Returns Expected Package when provided a valid repo", async () => {
    let res = await git.createPackage("git-test/atom-backend", { token: "valid-token", id: "xxx", node_id: "xxx", username: "xxx" });
    expect(res.content.name).toEqual("find-and-replace");
    expect(res.content.creation_method).toEqual("User Made Package");
    expect(res.content.downloads).toEqual(0);
    expect(res.content.stargazers_count).toEqual(0);
    expect(typeof res.content.readme === "string").toBeTruthy();
    expect(res.content.metadata.name).toEqual("find-and-replace");
    expect(res.content.metadata.license).toEqual("MIT");
    expect(res.content.releases.latest).toEqual("0.219.8");
  });
});
