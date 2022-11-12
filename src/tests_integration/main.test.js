// This can be considered the integration test, while everything else is a unit test.
// This takes the API endpoints themselves, and tests general functionality as best it can.
// Really testing the type of objects are returned, and specific errors are returned.
// It will try to avoid expecting exact values, but may rely on test data.

const request = require("supertest");
let app;

jest.setTimeout(300000);

// The following will be declarations of all predefined Error Messages returned.
// This way we can easily reference them and update them as needed.

const msg = {
  badRepoJSON:
    "That repo does not exist, isn't an atom package, or atombot does not have access.",
  badAuth:
    "Requires authentication. Please update your token if you haven't done so recently.",
  notSupported: "While under development this feature is not supported.",
  publishPackageExists: "A Package by that name already exists.",
};

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
        message: () =>
          `Expected Array but received: ${this.utils.printReceived(value)}`,
      };
    }
  },
  toHaveHTTPCode(req, want) {
    if (req.statusCode == want) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected HTTP Status Code: ${want} but got ${req.statusCode}`,
      };
    }
  },
});

describe("Get /", () => {
  test("Should Respond with Json Message of Server Running", async () => {
    const res = await request(app).get("/");
    expect(res.body.message).toEqual(
      expect.stringContaining("Server is up and running Version")
    );
  });
  test("Should Return valid status code", async () => {
    const res = await request(app).get("/");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should 404 on invalid method", async () => {
    const res = await request(app).patch("/");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("Get /api/login", () => {
  test.todo(
    "This whole section needs to be written once Authentication is fleshed out"
  );
});

describe("Get /api/oauth", () => {
  test.todo(
    "This whole section needs to be written once Authentication is fleshed out"
  );
});

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.body).toBeArray();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should 404 on invalid Method", async () => {
    const res = await request(app).patch("/api/packages");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("Post /api/packages", () => {
  test("Fails with 'Bad Auth' when bad token is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/langauge-css" })
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Fails with 401 with bad token", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Fails with 'badRepoJSON' when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'badRepoJSON' when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 'badRepoJSON' when Repo with a space is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language CSS" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'publishPackageExists' when existing package is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.publishPackageExists);
  });
  test("Fails with 409 when existing package is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(409);
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.body).toBeArray();
  });
  test("Valid Search Returns Success Status Code", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res).toHaveHTTPCode(200);
  });
  test("Invalid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body).toBeArray();
  });
  test("Invalid Search Returns Empty Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body.length).toBeLessThan(1);
  });
});

describe("GET /api/packages/:packageName", () => {
  test("Valid package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res.body.name).toBe("language-css");
  });
  test("Valid package, gives success status code", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res).toHaveHTTPCode(200);
  });
  test("Invalid Package, gives 'Not Found'", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res.body.message).toBe("Not Found");
  });
  test("Invalid package, gives not found status code", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("DELETE /api/packages/:packageName", () => {
  // Since this attempts to delete a package, lets skip until we ensure
  // not to comprimise SQL data.
  test.skip("No Auth, fails", async () => {
    const res = await request(app).remove("/api/packages/what-a-package");
    expect(res).toHaveHTTPCode(401);
  });
});

describe("GET /api/updates", () => {
  test.todo("/api/updates currentlty returns Not Supported.");
  test("Returns NotSupported Status Code.", async () => {
    const res = await request(app).get("/api/updates");
    expect(res).toHaveHTTPCode(501);
  });
  test("Returns NotSupported Message", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.body.message).toEqual(msg.notSupported);
  });
});

describe("GET Theme Featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res.body).toBeArray();
  });
});

describe("GET Packages Featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res.body).toBeArray();
  });
});

describe("GET /api/stars", () => {
  test("Returns Unauthenticated Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid_key");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Unauthenticated JSON", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid_key");
    expect(res.body.message).toEqual(msg.badAuth);
  });
});
