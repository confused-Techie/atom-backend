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
  test("Should return success with valid data - Multi Version", async () => {
    const pack = require("./fixtures/git.createPackage_returns/valid_multi_version.js");
    const obj = await database.insertNewPackage(pack);
    if (!obj.ok) console.log(obj);
    expect(obj.ok).toBeTruthy();
    expect(typeof obj.content === "string").toBeTruthy();
    // this endpoint only returns a pointer on success
  });
});

describe("insertNewPackageName", () => {
  test("Should return Server Error for package that doesn't exist", async () => {
    const obj = await database.insertNewPackageName(
      "notARepo",
      "notARepo-Reborn"
    );
    expect(obj.ok).toBeFalsy();
    expect(obj.short).toEqual("Server Error");
  });
  test("Should return Success for valid package", async () => {
    const obj = await database.insertNewPackageName(
      "publish-test-valid-rename",
      "publish-test-valid"
    );
    expect(obj.ok).toBeTruthy();
    expect(obj.content).toEqual(
      "Successfully inserted publish-test-valid-rename."
    );
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

describe("Package Lifetime Tests", () => {
  // Below are what we will call lifetime tests.
  // That is tests that will test multiple actions against the same package,
  // to ensure that the lifetime of a package will be healthy.
  test("Package A Lifetime", async () => {
    const pack = require("./fixtures/lifetime/package-a.js");

    // === Lets publish our package
    const publish = await database.insertNewPackage(pack.createPack);
    expect(publish.ok).toBeTruthy();
    expect(typeof publish.content === "string").toBeTruthy();
    // this endpoint only returns a pointer on success.

    // === Do we get all the right data back when asking for our package
    const getAfterPublish = await database.getPackageByName(
      pack.createPack.name
    );
    expect(getAfterPublish.ok).toBeTruthy();
    // then lets check some essential values
    expect(typeof getAfterPublish.content.pointer === "string").toBeTruthy();
    expect(getAfterPublish.content.name).toEqual(pack.createPack.name);
    expect(getAfterPublish.content.created).toBeDefined();
    expect(getAfterPublish.content.updated).toBeDefined();
    expect(getAfterPublish.content.creation_method).toEqual(
      pack.createPack.creation_method
    );
    expect(getAfterPublish.content.downloads).toEqual("0");
    expect(getAfterPublish.content.stargazers_count).toEqual("0");
    expect(getAfterPublish.content.original_stargazers).toEqual("0");
    expect(getAfterPublish.content.data.name).toEqual(pack.createPack.name);
    expect(getAfterPublish.content.data.readme).toEqual(pack.createPack.readme);
    expect(getAfterPublish.content.data.repository).toEqual(
      pack.createPack.repository
    );
    expect(getAfterPublish.content.data.metadata).toEqual(
      pack.createPack.metadata
    );
    expect(getAfterPublish.content.versions.length).toEqual(1); // Only 1 ver was provided
    expect(getAfterPublish.content.versions[0].semver).toEqual(
      pack.createPack.metadata.version
    );
    expect(getAfterPublish.content.versions[0].status).toEqual("latest");
    expect(getAfterPublish.content.versions[0].license).toEqual("NONE");
    expect(getAfterPublish.content.versions[0].package).toBeDefined();

    // === Lets rename our package
    const NEW_NAME = "package-a-lifetime-rename";
    const newName = await database.insertNewPackageName(
      NEW_NAME,
      pack.createPack.name
    );
    expect(newName.ok).toBeTruthy();
    expect(newName.content).toEqual(
      "Successfully inserted package-a-lifetime-rename."
    );

    // === Can we get the package by it's new name?
    const getByNewName = await database.getPackageByName(NEW_NAME);
    expect(getByNewName.ok).toBeTruthy();
    expect(getByNewName.content.name).toEqual(NEW_NAME);
    expect(getByNewName.content.created).toBeDefined();
    expect(
      getByNewName.content.updated >= getAfterPublish.content.updated
    ).toBeTruthy();
    // For the above expect().getGreaterThan() doesn't support dates.

    // === Can we still get the package by it's old name?
    const getByOldName = await database.getPackageByName(pack.createPack.name);
    expect(getByOldName.ok).toBeTruthy();
    expect(getByOldName.content.name).toEqual(NEW_NAME);
    expect(getByOldName.content.created).toBeDefined();
    expect(
      getByOldName.content.updated >= getAfterPublish.content.updated
    ).toBeTruthy();

    // === Now lets try to delete the only version available. This should fail.
    const removeOnlyVersion = await database.removePackageVersion(
      NEW_NAME,
      "1.0.0"
    );
    expect(removeOnlyVersion.ok).toBeFalsy();
    expect(removeOnlyVersion.content).toEqual(
      `It's not possible to leave the ${NEW_NAME} without at least one published version`
    );
  });
});
