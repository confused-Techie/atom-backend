// This can be considered the integration test, while everything else is a unit test.
// This takes the API endpoints themselves, and tests general functionality as best it can.
// Really testing the type of objects are returned, and specific errors are returned.
// It will try to avoid expecting exact values, but may rely on test data.

const request = require("supertest");
let app;

jest.setTimeout(300000);

beforeAll(async () => {
  let db_url = process.env.DATABASE_URL;
  // this gives us something like postgres://test-user@localhost:5432/test-db
  // We then need to map these values to where the API server expects,
  let db_url_reg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
  let db_url_parsed = db_url_reg.exec(db_url);

  // set the parsed URL as proper env
  process.env.DB_HOST = db_url_parsed[2];
  process.env.DB_USER = db_url_parsed[1];
  process.env.DB_DB = db_url_parsed[4];
  process.env.DB_PORT = db_url_parsed[3];

  // Then since we want to make sure we don't initialize the config module, before we have set our values,
  // we will define our own port to use here.
  process.env.PORT = 8080;

  app = require("../main.js");
});

console.log(
  "This is in development, integration tests may not function as expected."
);

expect.extend({
  toBeArray(value) {
    if (Array.isArray(value)) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () => `Expected Array but received: ${this.utils.printReceived(value)}`,
      };
    }
  },
});

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.body).toBeArray();
    //expect(Array.isArray(res.body)).toBeTruthy();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages?q=value");
    expect(res.body).toBeArray();
    //expect(Array.isArray(res.body)).toBeTruthy();
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
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res.statusCode).toBe(200);
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
