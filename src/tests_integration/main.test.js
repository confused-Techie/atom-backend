// This can be considered the integration test, while everything else is a unit test.
// This takes the API endpoints themselves, and tests general functionality as best it can.
// Really testing the type of objects are returned, and specific errors are returned.
// It will try to avoid expecting exact values, but may rely on test data.

/* eslint-disable node/no-unpublished-require
  * --------
  * This is the recommended and only way to mock how Jest would use the module.
  * For supertest it seems strange this caused an error. But was needed anyway.
*/
const request = require("supertest");

const dbSetup = require("../../node_modules/@databases/pg-test/jest/globalSetup");
const dbTeardown = require("../../node_modules/@databases/pg-test/jest/globalTeardown");
/* eslint-enable node/no-unpublished-require */

let app;

beforeAll(async () => {
  await dbSetup();

  let db_url = process.env.DATABASE_URL;
  let db_url_reg = /(\S*:\/\/)(\S*)@(\S*):(\S*)\/(\S*)/;
  let db_url_parsed = db_url_reg.exec(db_url);

  process.env.DB_HOST = db_url_parsed[3];
  process.env.DB_USER = db_url_parsed[2];
  process.env.DB_DB = db_url_parsed[5];
  process.env.DB_PORT = db_url_parsed[4];

  app = require("../main.js");
});

afterAll(async () => {
  await dbTeardown();
});

console.log("This is in development, integration tests may not function as expected.");

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages?q=value");
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

describe("GET /api/packages/:packageName", () => {
  test("Valid package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res.body.name).toBe("language-css");
  });
  test("Invalid Package, gives 'Not Found'", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res.body.message).toBe("Not Found");
  });
});

describe("DELETE /api/packages/:packageName", () => {
  // Since this attempts to delete a package, lets skip until we ensure
  // not to comprimise SQL data.
  test.skip("No Auth, fails", async () => {
    const res = await request(app).remove("/api/packages/what-a-package");
    expect(res.statusCode).toBe(401); // Otherwise the no auth http status code.
  });
});

describe("GET /api/updates", () => {
  // TODO: /api/updates returns NotSupported at this time.
  test("Returns NotSupported Status Code.", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.statusCode).toBe(501);
  });
  test("Returns NotSupported Message", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.body.message).toBe(
      "While under development this feature is not supported."
    );
  });
});

describe("GET Theme Featured", () => {
  test("Returns NotSupported Status Code", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res.statusCode).toBe(501);
  });
  test("Returns NotSupported Message", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.body.message).toBe(
      "While under development this feature is not supported."
    );
  });
});

describe("GET Packages Featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/stars", () => {
  test("Returns Unauthenticated Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid_key");
    expect(res.statusCode).toBe(401);
  });
  test("Returns Unauthenticated JSON", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid_key");
    expect(res.body.message).toBe(
      "Requires authentication. Please update your token if you haven't done so recently."
    );
  });
});
