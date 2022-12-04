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
  // Below are what we will call lifecycle tests.
  // That is tests that will test multiple actions against the same package,
  // to ensure that the lifecycle of a package will be healthy.
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

    // === Can we publish a duplicate package?
    const dupPublish = await database.insertNewPackage(pack.createPack);
    expect(dupPublish.ok).toBeFalsy();

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

    // === Now lets add a version
    const addNextVersion = await database.insertNewPackageVersion(pack.nextVersion);
    if (!addNextVersion.ok) {
      console.log(addNextVersion);
    }
    expect(addNextVersion.ok).toBeTruthy();
    expect(addNextVersion.content).toEqual(`Successfully added new version: ${pack.nextVersion.name}@${pack.nextVersion.version}`);

    // === Lets see if this new version is the latest
    const getAfterVer = await database.getPackageByName(NEW_NAME);
    expect(getAfterVer.ok).toBeTruthy();
    expect(getAfterVer.content.versions.length).toEqual(2);
    expect(getAfterVer.content.versions[1].semver).toEqual(pack.nextVersion.version);
    expect(getAfterVer.content.versions[1].status).toEqual("latest");
    expect(getAfterVer.content.versions[1].license).toEqual(pack.nextVersion.license);
    expect(getAfterVer.content.versions[1].meta.name).toEqual(pack.nextVersion.name);
    expect(getAfterVer.content.versions[1].meta.version).toEqual(pack.nextVersion.version);
    expect(getAfterVer.content.versions[0].semver).toEqual(pack.createPack.metadata.version);

    // === Can we publish a duplicate version?
    //const dupVer = await database.insertNewPackageVersion(pack.nextVersion);
    //expect.failing(dupVer.ok).toBeFalsy();
    // TODO: Currently we are able to publish duplicate versions, so that needs to be sorted
    // prior to this test being run

    // === Can we get this specific version with the new name
    const getNewVerOnly = await database.getPackageVersionByNameAndVersion(NEW_NAME, pack.nextVersion.version);
    expect(getNewVerOnly.ok).toBeTruthy();
    expect(getNewVerOnly.content.status).toEqual("latest");
    expect(getNewVerOnly.content.semver).toEqual(pack.nextVersion.version);
    expect(getNewVerOnly.content.meta.name).toEqual(pack.createPack.name);

    // === Can we get the first verison published still?
    const getOldVerOnly = await database.getPackageVersionByNameAndVersion(NEW_NAME, pack.createPack.metadata.version);
    expect(getOldVerOnly.ok).toBeTruthy();
    expect(getOldVerOnly.content.status).toEqual("published");
    expect(getOldVerOnly.content.semver).toEqual(pack.createPack.metadata.version);
    expect(getOldVerOnly.content.meta.name).toEqual(pack.createPack.name);

    // === Can we star our package?
    const starPack = await database.updatePackageIncrementStarByName(NEW_NAME);
    expect(starPack.ok).toBeTruthy();
    expect(starPack.content.name).toEqual(NEW_NAME);
    expect(starPack.content.stargazers_count).toEqual("1");
    expect(starPack.content.original_stargazers).toEqual("0");

    // === Can we add a download to our package?
    const downPack = await database.updatePackageIncrementDownloadByName(NEW_NAME);
    expect(downPack.ok).toBeTruthy();
    expect(downPack.content.name).toEqual(NEW_NAME);
    expect(downPack.content.downloads).toEqual("1");

    // === Can we undownload our package?
    const downPackUndo = await database.updatePackageDecrementDownloadByName(NEW_NAME);
    expect(downPackUndo.ok).toBeTruthy();
    expect(downPackUndo.content.name).toEqual(NEW_NAME);
    expect(downPackUndo.content.downloads).toEqual("0");

    // === Can we unstar our package?
    const starPackUndo = await database.updatePackageDecrementStarByName(NEW_NAME);
    expect(starPackUndo.ok).toBeTruthy();
    expect(starPackUndo.content.name).toEqual(NEW_NAME);
    expect(starPackUndo.content.stargazers_count).toEqual("0");
    expect(starPackUndo.content.original_stargazers).toEqual("0");

    // === Can we star by the old name?
    const starPackOld = await database.updatePackageIncrementStarByName(pack.createPack.name);
    expect(starPackOld.ok).toBeTruthy();
    expect(starPackOld.content.name).toEqual(NEW_NAME);
    expect(starPackOld.content.stargazers_count).toEqual("1");

    // === Can we download by old name?
    const downPackOld = await database.updatePackageIncrementDownloadByName(pack.createPack.name);
    expect(downPackOld.ok).toBeTruthy();
    expect(downPackOld.content.name).toEqual(NEW_NAME);
    expect(downPackOld.content.downloads).toEqual("1");

    // === Can we delete our newest version?
    const delLatestVer = await database.removePackageVersion(NEW_NAME, pack.nextVersion.version);
    expect(delLatestVer.ok).toBeTruthy();
    expect(delLatestVer.content).toEqual(`Removed ${pack.nextVersion.version} of ${NEW_NAME} and ${pack.createPack.metadata.version} is the new latest version.`);

    // === Is our old version the latest again?
    const newLateVer = await database.getPackageByName(NEW_NAME);
    expect(newLateVer.ok).toBeTruthy();
    expect(newLateVer.content.name).toEqual(NEW_NAME);
    expect(newLateVer.content.versions.length).toEqual(1);
    expect(newLateVer.content.versions[0].semver).toEqual(pack.createPack.metadata.version);
    expect(newLateVer.content.versions[0].status).toEqual("latest");

    // === Can we delete our version?
    const delPack = await database.removePackageByName(NEW_NAME);
    expect(delPack.ok).toBeTruthy();
    expect(delPack.content).toEqual(`Successfully Deleted Package: ${NEW_NAME}`);

    // === Can we get our now deleted package?
    const ghostPack = await database.getPackageByName(NEW_NAME);
    expect(ghostPack.ok).toBeFalsy();
    expect(ghostPack.short).toEqual("Not Found");
  });
});
