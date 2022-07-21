const error = require("../error.js");

// This is an impersonator of the ExpressJS Response Object.
// Whose goal is to very simply test the exact features we care about. Without
// overhead or bloat.
class NewRes {
  constructor() {
    this.statusCode = 0;
    this.JSONObj = "";
  }
  json(obj) {
    this.JSONObj = obj;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
}

test("NotFoundJSON modifies response status to 404.", async () => {
  let res = new NewRes();
  await error.NotFoundJSON(res);
  expect(res.statusCode).toBe(404);
});

test("NotFoundJSON modifies body to 'Not Found'", async () => {
  let res = new NewRes();
  await error.NotFoundJSON(res);
  expect(res.JSONObj).toStrictEqual({ message: "Not Found" });
});

test("SiteWide404 modifies the status to 404", async () => {
  let res = new NewRes();
  await error.SiteWide404(res);
  expect(res.statusCode).toBe(404);
});

test("SiteWide404 modifies the body to proper temporary message.", async () => {
  // TODO, the return here will have to be retested after the siteWide404 is setup.
  let res = new NewRes();
  await error.SiteWide404(res);
  expect(res.JSONObj).toStrictEqual({
    message: "This is a standin for the proper site wide 404 page.",
  });
});

test("MissingAuthJSON Status", async () => {
  let res = new NewRes();
  await error.MissingAuthJSON(res);
  expect(res.statusCode).toBe(401);
});

test("MissingAuthJSON Body", async () => {
  let res = new NewRes();
  await error.MissingAuthJSON(res);
  expect(res.JSONObj).toStrictEqual({
    message:
      "Requires authentication. Please update your token if you haven't done so recently.",
  });
});

test("ServerErrorJSON Status", async () => {
  let res = new NewRes();
  await error.ServerErrorJSON(res);
  expect(res.statusCode).toBe(500);
});

test("ServerErrorJSON Body", async () => {
  let res = new NewRes();
  await error.ServerErrorJSON(res);
  expect(res.JSONObj).toStrictEqual({ message: "Application Error" });
});

test("PublishPackageExists Status", async () => {
  let res = new NewRes();
  await error.PublishPackageExists(res);
  expect(res.statusCode).toBe(409);
});

test("PublishPackageExists Body", async () => {
  let res = new NewRes();
  await error.PublishPackageExists(res);
  expect(res.JSONObj).toStrictEqual({
    message: "A Package by that name already exists.",
  });
});

test("UnsupportedJSON Status", async () => {
  let res = new NewRes();
  await error.UnsupportedJSON(res);
  expect(res.statusCode).toBe(501);
});

test("UnsupportedJSON Body", async () => {
  let res = new NewRes();
  await error.UnsupportedJSON(res);
  expect(res.JSONObj).toStrictEqual({
    message: "While under development this feature is not supported.",
  });
});
