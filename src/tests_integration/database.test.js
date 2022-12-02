// This is our secondary integration test.
// Due to the difficulty in testing some aspects as full integration tests,
// namely tests for publishing and updating packages (due to the varried responses expected by github)
// We will use this to tests these aspects directly against the DB. Being able
// to provide whatever values we wish to these functions. Just to ensure that everything works as expected.
// Or at the very least that if there is a failure within these, it will not result in
// bad data being entered into the database in production.

let database;

jest.setTimeout(300000);

beforeAll(async () => {
  let db_url = process.env.DATABASE_URL;
  // This returns: postgres://test-user@localhost:5432/test-db
  let db_url_reg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
  let db_url_parsed = db_url_reg.exec(db_url);

  // set the parsed URL as proper env for the db module
  process.env.DB_HOST = db_url_parsed[2];
  process.env.DB_USER = db_url_parsed[1];
  process.env.DB_DB = db_url_parsed[4];
  process.env.DB_PORT = db_url_parsed[3];

  database = require("../database.js");
});

describe("insertNewPackage", () => {
  test("Should return Success with Valid Data - 1 Version", async () => {
    const pack = require("./fixtures/git.createPackage_returns/valid_one_version.js");
    const obj = await database.insertNewPackage(pack);
    if (!obj.ok) console.log(obj);
    expect(obj.ok).toBeTruthy();
    expect(typeof obj.content === "string").toBeTruthy();
    // This endpoint only returns the pointer on success.
  });
});

describe("getTotalPackageEstimate", () => {
  test("Should return a successful Server Status Object", async () => {
    const obj = await database.getTotalPackageEstimate();
    expect(obj.ok).toBeTruthy();
  });
  test.failing("Should return an expected-ish value", async () => {
    const obj = await database.getTotalPackageEstimate();
    expect(obj.content).toBeGreaterThan(0);
    // This test is currently failing, seems in our dev environment that
    // the estimate returns 0 no matter what.
  });
});
