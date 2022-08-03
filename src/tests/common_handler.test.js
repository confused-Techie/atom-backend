const common = require("../handlers/common_handler.js");

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

class NewReq {
  constructor() {
    this.ip = "0.0.0.0";
    this.method = "TEST";
    this.url = "/dev";
    this.protocol = "DEV";
    this.start = Date.now();
  }
}

test("AuthFail Modifies 'Server Error' HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let user = {
    ok: false,
    content: "DEV",
    short: "Server Error",
  };
  await common.authFail(req, res, user);
  expect(res.statusCode).toBe(500);
});

test("AuthFail Modifies 'Bad Auth' HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let user = {
    ok: false,
    content: "DEV",
    short: "Bad Auth",
  };
  await common.authFail(req, res, user);
  expect(res.statusCode).toBe(401);
});

test("ServerError Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let err = "DEV Error";
  await common.serverError(req, res, err);
  expect(res.statusCode).toBe(500);
});

test("NotFound Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.notFound(req, res);
  expect(res.statusCode).toBe(404);
});

test("NotSupported Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.notSupported(req, res);
  expect(res.statusCode).toBe(501);
});

test("SiteWideNotFound Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.siteWideNotFound(req, res);
  expect(res.statusCode).toBe(404);
});

test("BadRepoJSON Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.badRepoJSON(req, res);
  expect(res.statusCode).toBe(400);
});

test("BadRepoJSON Modifies JSON", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.badRepoJSON(req, res);
  expect(res.JSONObj.message).toBe(
    "That repo does not exist, isn't an atom package, or atombot does not have access."
  );
});

test("BadPackageJSON Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();
  await common.badPackageJSON(req, res);
  expect(res.statusCode).toBe(400);
});

test("BadPackageJSON Modifies JSON", async () => {
  let req = new NewReq();
  let res = new NewRes();
  await common.badPackageJSON(req, res);
  expect(res.JSONObj.message).toBe(
    "The package.json at owner/repo isn't valid."
  );
});
