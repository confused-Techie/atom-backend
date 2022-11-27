/**
 * @module database
 * @desc Provides an interface of a large collection of functions to interact
 * with and retreive data from the cloud hosted database instance.
 */

const fs = require("fs");
const postgres = require("postgres");
const storage = require("./storage.js");
const utils = require("./utils.js");
const logger = require("./logger.js");
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_DB,
  DB_PORT,
  DB_SSL_CERT,
  paginated_amount,
} = require("./config.js").getConfig();

let sqlStorage; // SQL object, to interact with the DB.
// It is set after the first call with logical nullish assignment
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment

/**
 * @function setupSQL
 * @desc Initialize the connection to the PostgreSQL database.
 * In order to avoid the initialization multiple times,
 * the logical nullish assignment (??=) can be used in the caller.
 * Exceptions thrown here should be caught and handled in the caller.
 * @returns {object} PostgreSQL connection object.
 */
function setupSQL() {
  return process.env.PULSAR_STATUS === "dev"
    ? postgres({
        host: DB_HOST,
        username: DB_USER,
        database: DB_DB,
        port: DB_PORT,
      })
    : postgres({
        host: DB_HOST,
        username: DB_USER,
        password: DB_PASS,
        database: DB_DB,
        port: DB_PORT,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(DB_SSL_CERT).toString(),
        },
      });
}

/**
 * @function shutdownSQL
 * @desc Ensures any Database connection is properly, and safely closed before exiting.
 */
function shutdownSQL() {
  if (sqlStorage !== undefined) {
    sqlStorage.end();
  }
}

/**
 * @async
 * @function insertNewPackage
 * @desc Insert a new package inside the DB taking a `Server Object Full` as argument.
 * @param {object} pack - The `Server Object Full` package.
 * @returns {object} A Server Status Object.
 */
async function insertNewPackage(pack) {
  sqlStorage ??= setupSQL();

  // Since this operation involves multiple queries, we perform a
  // PostgreSQL transaction executing a callback on begin().
  // All data is committed into the database only if no errors occur.
  return await sqlStorage
    .begin(async () => {
      const packData = {
        name: pack.name,
        repository: pack.repository,
        readme: pack.readme,
        metadata: pack.metadata,
      };

      // No need to specify downloads and stargazers. They default at 0 on creation.
      let command = await sqlStorage`
      INSERT INTO packages (name, creation_method, data)
      VALUES (${pack.name}, ${pack.creation_method}, ${packData})
      RETURNING pointer;
    `;

      const pointer = command[0].pointer;
      if (pointer === undefined) {
        throw `Cannot insert ${pack.name} in packages table`;
      }

      // Populate names table
      command = await sqlStorage`
      INSERT INTO names (name, pointer)
      VALUES (${pack.name}, ${pointer});
    `;

      if (command.count === 0) {
        throw `Cannot insert ${pack.name} in names table`;
      }

      // Populate versions table
      const latest = pack.releases.latest;
      const pv = pack.versions;

      for (const ver of Object.keys(pv)) {
        const status = ver === latest ? "latest" : "published";

        // Since many packages don't define an engine field,
        // we will do it for them if not present,
        // following suit with what Atom internal packages do.
        const engine = pv[ver].engines ?? { atom: "*" };

        // It's common practice for packages to not specify license,
        // therefore set it as NONE if undefined.
        const license = pv[ver].license ?? "NONE";

        // Save version object into meta, but strip engines and license properties
        // since we save them into specific separate columns.
        let meta = pv[ver];
        delete meta.engines;
        delete meta.license;

        command = await sqlStorage`
        INSERT INTO versions (package, status, semver, license, engine, meta)
        VALUES (${pointer}, ${status}, ${ver}, ${license}, ${engine}, ${meta})
        RETURNING id;
      `;

        if (command[0].id === undefined) {
          throw `Cannot insert ${ver} version for ${pack.name} package in versions table`;
        }
      }

      return { ok: true, content: pointer };
    })
    .catch((err) => {
      const msg =
        typeof err === "string"
          ? err
          : `A generic error occurred while inserting ${pack.name} package`;

      return { ok: false, content: msg, short: "Server Error" };
    });
}

/**
 * @async
 * @function insertNewPackageVersion
 * @desc Adds a new package version to the db.
 * @param {object} packJSON - A full `package.json` file for the wanted version.
 * @returns {object} A server status object.
 */
async function insertNewPackageVersion(packJSON) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async () => {
      // We first need to collect the needed values to insert into the DB.
      // The pointer, status, semver, license, engine, meta.
      // We are expected to receive a standard `package.json` file.
      const packID = await getPackageByName(packJSON.name);

      if (!packID.ok) {
        return packID;
      }

      const pointer = packID.content.pointer;

      // First we need to change the last 'latest' version, to now just published.
      const updateLastVer = await sqlStorage`
        UPDATE versions
        SET status = 'published'
        WHERE pointer = ${pointer} AND status = 'latest'
        RETURNING *;
      `;

      if (updateLastVer.count === 0) {
        throw `Unable to modify last published version ${packJSON.name}`;
      }

      const license = packJSON.license ?? "NONE";
      const engine = packJSON.engines ?? { atom: "*" };

      const addVer = await sqlStorage`
        INSERT INTO version (package, status, semver, license, engine, meta)
        VALUES(${pointer}, 'published', ${packJSON.version}, ${license}, ${engine}, ${packJSON})
        RETURNING *;
      `;

      if (addVer.count === 0) {
        throw `Unable to create new version: ${packJSON.name}`;
      }

      return {
        ok: true,
        content: `Successfully added new version: ${packJSON.name}@${packJSON.version}`,
      };
    })
    .catch((err) => {
      const msg =
        typeof err === "string"
          ? err
          : `A generic error occured while inserting the new package version ${packJSON.name}`;

      return { ok: false, content: msg, short: "Server Error" };
    });
}

/**
 * @async
 * @function insertNewPackageName
 * @desc Insert a new package name with the same pointer as the old name.
 * This essentially renames an existing package.
 * @param {string} newName - The new name to create in the DB.
 * @param {string} oldName - The original name of which to use the pointer of.
 * @returns {object} A server status object.
 */
async function insertNewPackageName(newName, oldName) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async () => {
      // Retrieve the package pointer
      const getID = await sqlStorage`
        SELECT pointer
        FROM names
        WHERE name = ${oldName};
      `;

      if (getID.count === 0) {
        throw `Unable to find the original pointer of ${oldName}`;
      }

      const pointer = getID[0].pointer;

      // Before inserting the new name, we try to update it into the `packages` table
      // since we want that column to contain the current name.
      const updateNewName = await sqlStorage`
        UPDATE packages
        SET name = ${newName}
        WHERE pointer = ${pointer}
        RETURNING *;
      `;

      if (updateNewName.count === 0) {
        throw `Unable to update the package name. ${newName} is already used.`;
      }

      // Now we can finally insert the new name inside the `names` table.
      const newInsertedName = await sqlStorage`
        INSERT INTO names (name, pointer)
        VALUES (
          ${newName}, ${pointer}
        )
        RETURNING *;
      `;

      if (newInsertedName.count === 0) {
        throw `Unable to add the new name: ${newName}`;
      }

      return { ok: true, content: `Successfully inserted ${newName}.` };
    })
    .catch((err) => {
      const msg =
        typeof err === "string"
          ? err
          : `A generic error occurred while inserting the new package name ${newName}`;

      return { ok: false, content: msg, short: "Server Error" };
    });
}

/**
 * @async
 * @function insertNewUser
 * @desc Insert a new user into the database.
 * @param {object} user - An object containing information related to the user.
 * @returns {object} A server status object.
 */
async function insertNewUser(user) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      INSERT INTO users (username, node_id, avatar)
      VALUES (${user.username}, ${user.node_id}, ${user.avatar})
      RETURNING *;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to create user: ${user}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updateUser
 * @desc Given the username, the record of the user is updated with the new token and the avatar.
 * a Server Status Object.
 * @param {object} user - An object containing information related to the user.
 * @returns {object} A server status object.
 */
async function updateUser(user) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE users
      SET token = ${user.token}, avatar = ${user.avatar}
      WHERE username = ${user.username}
      RETURNING *;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to update user: ${user}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getPackageByName
 * @desc Takes a package name and returns the raw SQL package with all its versions.
 * This module is also used to get the data to be sent to utils.constructPackageObjectFull()
 * in order to convert the query result in Package Object Full format.
 * In that case it's recommended to set the user flag as true for security reasons.
 * @param {string} name - The name of the package.
 * @param {bool} user - Whether the packages has to be exposed outside or not.
 * If true, all sensitive data like primary and foreign keys are not selected.
 * Even if the keys are ignored by utils.constructPackageObjectFull(), it's still
 * safe to not inclue them in case, by mistake, we publish the return of this module.
 * @returns {object} A server status object.
 */
async function getPackageByName(name, user = false) {
  try {
    sqlStorage ??= setupSQL();

    // While this query achieves the same as the one below it, there is about .1ms saved.
    //const command = await sqlStorage`
    //  SELECT p.*, JSON_AGG(v.*) FROM packages p JOIN versions v ON p.pointer = v.package
    //  WHERE pointer IN (
    //    SELECT pointer FROM names WHERE name = ${name}
    //  )
    //  GROUP BY p.pointer, v.package;
    //`;

    const command = await sqlStorage`
      SELECT
        ${
          user ? sqlStorage`` : sqlStorage`p.pointer,`
        } p.name, p.created, p.updated, p.creation_method,
        p.downloads, p.stargazers_count, p.original_stargazers, p.data,
        JSONB_AGG(JSON_BUILD_OBJECT(
          ${
            user ? sqlStorage`` : sqlStorage`'id', v.id, 'package', v.package,`
          } 'status', v.status, 'semver', v.semver,
          'license', v.license, 'engine', v.engine, 'meta', v.meta
        )) AS versions
      FROM packages p
        JOIN versions v ON p.pointer = v.package
        JOIN names n ON n.pointer = p.pointer
      WHERE n.name = ${name}
      GROUP BY p.pointer, v.package;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `package ${name} not found.`,
          short: "Not Found",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getPackageVersionByNameAndVersion
 * @desc Uses the name of a package and it's version to return the version info.
 * @param {string} name - The name of the package to query.
 * @param {string} version - The version of the package to query.
 * @returns {object} A server status object.
 */
async function getPackageVersionByNameAndVersion(name, version) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT *
      FROM versions
      WHERE package IN (
        SELECT pointer
        FROM names
        WHERE name = ${name}
      )
      AND semver = ${version};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Package ${name} and Version ${version} not found.`,
          short: "Not Found",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getPackageCollectionByName
 * @desc Takes a package name array, and returns an array of the package objects.
 * You must ensure that the packArray passed is compatible. This function does not coerce compatibility.
 * @param {string[]} packArray - An array of package name strings.
 * @returns {object} A server status object.
 */
async function getPackageCollectionByName(packArray) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT *
      FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN (
        SELECT pointer FROM names
        WHERE name IN ${sqlStorage(packArray)}
      )
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: `No packages found.`, short: "Not Found" };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getPackageCollectionByID
 * @desc Takes a package pointer array, and returns an array of the package objects.
 * @param {int[]} packArray - An array of package id.
 * @returns {object} A server status object.
 */
async function getPackageCollectionByID(packArray) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT data FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN ${sqlStorage(packArray)}
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: `No packages found.`, short: "Not Found" };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updatePackageIncrementStarByName
 * @description Uses the package name to increment it's stargazers count by one.
 * @param {string} name - The package name.
 * @returns {object} The effected server status object.
 */
async function updatePackageIncrementStarByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages
      SET stargazers_count = stargazers_count + 1
      WHERE pointer IN (
        SELECT pointer
        FROM names
        WHERE name = ${name}
      );
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: "Unable to Update Package Stargazers",
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updatePackageDecrementStarByName
 * @description Uses the package name to decrement it's stargazers count by one.
 * @param {string} name - The package name.
 * @returns {object} The effected server status object.
 */
async function updatePackageDecrementStarByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages
      SET stargazers_count = stargazers_count - 1
      WHERE pointer IN (
        SELECT pointer
        FROM names
        WHERE name = ${name}
      );
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: "Unable to Update Package Stargazers",
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updatePackageIncrementDownloadByName
 * @description Uses the package name to increment the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageIncrementDownloadByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages
      SET downloads = downloads + 1
      WHERE pointer IN (
        SELECT pointer
        FROM names
        WHERE name = ${name}
      );
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: "Unable to Update Package Download",
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updatePackageDecrementDownloadByName
 * @description Uses the package name to decrement the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageDecrementDownloadByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages
      SET downloads = downloads - 1
      WHERE pointer IN (
        SELECT pointer
        FROM names
        WHERE name = ${name}
      );
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: "Unable to decrement Package Download Count",
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function removePackageByName
 * @description Given a package name, removes its record alongside its names, versions, stars.
 * @param {string} name - The package name.
 * @returns {object} A server status object.
 */
async function removePackageByName(name) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async () => {
      // Retrieve the package pointer
      const getID = await sqlStorage`
        SELECT pointer FROM names
        WHERE name = ${name};
      `;

      if (getID.count === 0) {
        // The package does not exists, but we return ok since it's like
        // it has been deleted.
        return { ok: true, content: `${name} package does not exists.` };
      }

      const pointer = getID[0].pointer;

      // Remove versions of the package
      const commandVers = await sqlStorage`
        DELETE FROM versions
        WHERE package = ${pointer}
        RETURNING *;
      `;

      if (commandVers.count === 0) {
        throw `Failed to delete any versions for: ${name}`;
      }

      // Remove stars assigned to the package
      const commandStar = await sqlStorage`
        DELETE FROM stars
        WHERE package = ${pointer}
        RETURNING *;
      `;

      // No check on deleted stars because the package could also have 0 stars.

      // Remove names related to the package
      const commandName = await sqlStorage`
        DELETE FROM names
        WHERE pointer = ${pointer}
        RETURNING *;
      `;

      if (commandName.count === 0) {
        throw `Failed to delete names for: ${name}`;
      }

      const commandPack = await sqlStorage`
        DELETE FROM packages
        WHERE pointer = ${pointer}
        RETURNING *;
      `;

      if (commandPack.count === 0) {
        // nothing was returning, the delete probably failed
        throw `Failed to Delete Package for: ${name}`;
      }

      if (commandPack[0].name !== name) {
        throw `Attempted to delete ${commandPack[0].name} rather than ${name}`;
      }

      return { ok: true, content: `Successfully Deleted Package: ${name}` };
    })
    .catch((err) => {
      const msg =
        typeof err === "string"
          ? err
          : `A generic error occurred while inserting ${pack.name} package`;

      return { ok: false, content: msg, short: "Server Error" };
    });
}

/**
 * @async
 * @function removePackageVersion
 * @description Mark a version of a specific package as removed. This does not delete the record,
 * just mark the status as removed, but only if one published version remain available.
 * This also makes sure that a new latest version is selected in case the previous one is removed.
 * @param {string} packName - The package name.
 * @param {string} semVer - The version to remove.
 * @returns {object} A server status object.
 */
async function removePackageVersion(packName, semVer) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async () => {
      // Retrieve the package pointer
      const getID = await sqlStorage`
        SELECT pointer
        FROM names
        WHERE name = ${packName};
      `;

      if (getID.count === 0) {
        throw `Unable to find the pointer of ${packName}`;
      }

      const pointer = getID[0].pointer;

      // Retrieve all non-removed versions
      const getVersions = await sqlStorage`
        SELECT id, semver, status
        FROM versions
        WHERE package = ${pointer} AND status != 'removed';
      `;

      const versionCount = getVersions.count;
      if (versionCount === 0) {
        throw `No published version available for ${packName} package`;
      }

      // Having all versions, we loop them to find:
      // - the id of the version to remove
      // - if its status is "latest"
      let removeLatest = false;
      let versionId = null;
      for (const v of getVersions) {
        if (v.semver === semVer) {
          versionId = v.id;
          removeLatest = v.status === "latest";
        }
      }

      if (versionId === null) {
        // Do not use throw here because we specify Not Found reason.
        return {
          ok: false,
          content: `There's no version ${semVer} to remove for ${packName} package`,
          short: "Not Found",
        };
      }

      // We have the version to remove, but for the package integrity we have to make sure that
      // at least one published version is still available after the removal.
      // This is not possible if the version count is only 1.
      if (versionCount === 1) {
        throw `It'n not possible to leave the ${packName} without at least one published version`;
      }

      // The package will have published versions, so we can remove the targeted semver.
      const command = await sqlStorage`
        UPDATE versions
        SET status = 'removed'
        WHERE id = ${versionId}
        RETURNING *;
      `;

      if (command.count === 0) {
        // Do not use throw here because we specify Not Found reason.
        return {
          ok: false,
          content: `Unable to remove ${semVer} version of ${packName} package.`,
          short: "Not Found",
        };
      }

      if (!removeLatest) {
        // We have removed a published versions and the latest one is still available.
        return {
          ok: true,
          content: `Successfully removed ${semVer} version of ${packName} package.`,
        };
      }

      // We have removed the version with the "latest" status, so now we have to select
      // a new version between the remaining ones which will obtain "latest" status.
      // We use the utils in utils.js to select the highest semver.
      let highestVersionId = null;
      let latestSemver = null;
      let maxSemVer = null;
      for (const v of getVersions) {
        if (v.id === versionId) {
          // Skip the removed version
          continue;
        }

        if (maxSemVer === null) {
          // Initialize variables
          latestSemver = v.semver;
          maxSemVer = utils.semverArray(latestSemver);
          highestVersionId = v.id;
          continue;
        }

        // Compare versions
        const sva = utils.semverArray(v.semver);
        if (utils.semverGt(sva, maxSemVer)) {
          latestSemver = v.semver;
          maxSemVer = sva;
          highestVersionId = v.id;
        }
      }

      if (highestVersionId === null) {
        throw `An error occurred while selecting the highest versions of ${packName}`;
      }

      // Mark the targeted highest version as latest.
      const commandLatest = await sqlStorage`
        UPDATE versions
        SET status = 'latest'
        WHERE id = ${highestVersionId}
        RETURNING *;
      `;

      return commandLatest.count !== 0
        ? {
            ok: true,
            content: `Removed ${semVer} of ${packName} and ${latestSemver} is the new latest version.`,
          }
        : {
            ok: false,
            content: `Unable to remove ${semVer} version of ${packName} package.`,
            short: "Not Found",
          };
    })
    .catch((err) => {
      const msg =
        typeof err === "string"
          ? err
          : `A generic error occurred while inserting ${pack.name} package`;

      return { ok: false, content: msg, short: "Server Error" };
    });
}

/**
 * @async
 * @function getFeaturedPackages
 * @desc Collects the hardcoded featured packages array from the storage.js
 * module. Then uses this.getPackageCollectionByName to retreive details of the
 * package.
 * @returns {object} A server status object.
 */
async function getFeaturedPackages() {
  let featuredArray = await storage.getFeaturedPackages();

  if (!featuredArray.ok) {
    return featuredArray;
  }

  let allFeatured = await getPackageCollectionByName(featuredArray.content);

  return allFeatured.ok
    ? { ok: true, content: allFeatured.content }
    : allFeatured;
}

/**
 * @async
 * @function getFeaturedThemes
 * @desc Collects the hardcoded featured themes array from the sotrage.js
 * module. Then uses this.getPackageCollectionByName to retreive details of the
 * package.
 * @returns {object} A server status object.
 */
async function getFeaturedThemes() {
  let featuredThemeArray = await storage.getFeaturedThemes();

  if (!featuredThemeArray.ok) {
    return featuredThemeArray;
  }

  let allFeatured = await getPackageCollectionByName(
    featuredThemeArray.content
  );

  return allFeatured.ok
    ? { ok: true, content: allFeatured.content }
    : allFeatured;
}

/**
 * @async
 * @function getTotalPackageEstimate
 * @desc Returns an estimate of how many rows are included in the packages SQL table.
 * Used to aid in trunication and page generation of Link headers for large requests.
 * @returns {object} A server status object.
 */
async function getTotalPackageEstimate() {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT reltuples AS estimate FROM pg_class WHERE relname = 'packages';
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to query total row count estimate.`,
        short: "Server Error",
      };
    }

    return { ok: true, content: command[0].estimate };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getUserByName
 * @description Get a users details providing their username.
 * @param {string} username - User name string.
 * @returns {object} A server status object.
 */
async function getUserByName(username) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE username = ${username};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to query for user: ${username}`,
          short: "Not Found",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getUserByNodeID
 * @description Get user details providing their Node ID.
 * @param {string} id - Users Node ID.
 * @returns {object} A server status object.
 */
async function getUserByNodeID(id) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE node_id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get User By NODE_ID: ${id}`,
        short: "Server Error",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get User By NODE_ID: ${id}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getUserByID
 * @desc Get user details providing their ID.
 * @param {int} id - User ID
 * @returns {object} A Server status Object.
 */
async function getUserByID(id) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get user by ID: ${id}`,
        short: "Server Error",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get user by ID: ${id}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updateStars
 * @description Register the star given by a user to a package.
 * @param {int} user - ID of the user who give the star.
 * @param {string} pack - Package name that get the new star.
 * @returns {object} A server status object.
 */
async function updateStars(user, pack) {
  try {
    sqlStorage ??= setupSQL();

    const commandPointer = await sqlStorage`
      SELECT pointer FROM names
      WHERE name = ${pack};
    `;

    if (commandPointer.count === 0) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "Not Found",
      };
    }

    // else the command is a value, lets keep going

    const commandStar = await sqlStorage`
      INSERT INTO stars
      (package, userid) VALUES
      (${commandPointer[0].pointer}, ${user.id})
      RETURNING *;
    `;

    // Now we expect to get our data right back, and can check the
    // validity to know if this happened successfully or not.
    return commandPointer[0].pointer == commandStar[0].package &&
      user.id == commandStar[0].userid
      ? {
          ok: true,
          content: `Successfully Stared ${commandPointer[0].pointer} with ${user.id}`,
        }
      : {
          ok: false,
          content: `Failed to Star ${commandPointer[0].pointer} with ${user.id}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updateDeleteStar
 * @description Register the removal of the star on a package by a user.
 * @param {int} user - ID of the user who remove the star.
 * @param {string} pack - Package name that get the star removed.
 * @returns {object} A server status object.
 */
async function updateDeleteStar(user, pack) {
  try {
    sqlStorage ??= setupSQL();

    const commandPointer = await sqlStorage`
      SELECT pointer FROM names
      WHERE name = ${pack};
    `;

    if (commandPointer.count === 0) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "Not Found",
      };
    }

    const commandUnstar = await sqlStorage`
      DELETE FROM stars
      WHERE (package = ${commandPointer[0].pointer}) AND (userid = ${user.id})
      RETURNING *;
    `;

    if (commandUnstar.length === 0) {
      // The command failed, let see if its because the data doesn't exist.

      const doesExist = await sqlStorage`
        SELECT EXISTS (
          SELECT 1 FROM stars
          WHERE (package = ${commandPointer[0].pointer}) AND (userid = ${user.id})
        );
      `;

      if (doesExist[0].exists) {
        // Exists is true, so it failed for some other reason
        return {
          ok: false,
          content: `Failed to Unstar ${pack} with ${user.username}`,
          short: "Server Error",
        };
      }

      return {
        ok: false,
        content: `Failed to Unstar ${pack} with ${user.username} Because it doesn't exist.`,
        short: "Not Found",
      };
    }

    // if the return matches our input we know it was successful
    return user.id == commandUnstar[0].userid &&
      commandPointer[0].pointer == commandUnstar[0].package
      ? {
          ok: true,
          content: `Successfully Unstarred ${commandPointer[0].pointer} with ${user.id}`,
        }
      : {
          ok: false,
          content: `Failed to Unstar ${commandPointer[0].pointer} with ${user.id}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getStarredPointersByUserID
 * @description Get all packages which the user gave the star.
 * @param {int} userid - ID of the user.
 * @returns {object} A server status object.
 */
async function getStarredPointersByUserID(userid) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT package FROM stars WHERE userid = ${userid}
      );
    `;

    let packArray = command[0].array;

    if (command.count === 0) {
      // It is likely safe to assume that if nothing matches the userid,
      // then the user hasn't given any star. So instead of server error
      // here we will non-traditionally return an empty array.
      packArray = [];
    }

    return { ok: true, content: packArray };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getStarringUsersByPointer
 * @description Use the pointer of a package to collect all users that have starred it.
 * @param {string} pointer - The ID of the package.
 * @returns {object} A server status object.
 */
async function getStarringUsersByPointer(pointer) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT userid FROM stars WHERE package = ${pointer.pointer}
      );
    `;

    let userArray = command[0].array;

    if (command.count === 0) {
      // It is likely safe to assume that if nothing matches the packagepointer,
      // then the package pointer has no stars. So instead of server error
      // here we will non-traditionally return an empty array.
      logger.warningLog(
        null,
        null,
        `No Stars for ${pointer} found, assuming 0 star value.`
      );
      userArray = [];
    }

    return { ok: true, content: userArray };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function simpleSearch
 * @description The current Fuzzy-Finder implementation of search. Ideally eventually
 * will use a more advanced search method.
 * @returns {object} A server status object.
 */
async function simpleSearch(term, page, dir, sort) {
  try {
    sqlStorage ??= setupSQL();

    let limit = paginated_amount;
    let offset = page > 1 ? (page - 1) * limit : 0;

    const command = await sqlStorage`
      SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN (
        SELECT pointer
        FROM names
        ${sqlStorage`WHERE name ILIKE ${"%" + term + "%"}`}
      )
      ORDER BY ${
        sort === "relevance" ? sqlStorage`downloads` : sqlStorage`${term}`
      }
      ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: `No packages found.`, short: "Not Found" };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getUserCollectionById
 * @description Returns an array of Users and their associated data via the ids.
 * @param {array} ids - The IDs of users to collect the data of.
 * @returns {object} A server status object with the array of users collected.
 */
async function getUserCollectionById(ids) {
  let userArray = [];

  for (let i = 0; i < ids.length; i++) {
    let user = await getUserByID(ids[i]);

    if (!user.ok) {
      logger.warningLog(
        null,
        null,
        `Unable to find user id: ${ids[i]}, skipping...`
      );
      logger.warningLog(
        null,
        null,
        `Details on Not Found User: ${user.short} - ${user.content}`
      );
      continue;
    }

    userArray.push({ login: user.content.username });
  }

  return { ok: true, content: userArray };
}

/**
 * @async
 * @function getSortedPackages
 * @desc Takes the page, direction, and sort method returning the raw sql package
 * data for each. This monolithic function handles trunication of the packages,
 * and sorting, aiming to provide back the raw data, and allow later functions to
 * then reconstruct the JSON as needed.
 * @param {int} page - Page number.
 * @param {string} dir - String flag for asc/desc order.
 * @param {string} dir - String flag for asc/desc order.
 * @param {string} method - The column name the results have to be sorted by.
 * @returns {object} A server status object.
 */
async function getSortedPackages(page, dir, method) {
  // Here will be a monolithic function for returning sortable packages arrays.
  // We must keep in mind that all the endpoint handler knows is the
  // page, sort method, and direction. We must figure out the rest here.
  // only knowing we have a valid sort method provided.

  let limit = paginated_amount;
  let offset = page > 1 ? (page - 1) * limit : 0;

  try {
    sqlStorage ??= setupSQL();

    let orderType = null;

    switch (method) {
      case "downloads":
        orderType = "downloads";
        break;
      case "created_at":
        orderType = "created";
        break;
      case "updated_at":
        orderType = "updated";
        break;
      case "stars":
        orderType = "stargazers_count";
        break;
      default:
        logger.warningLog(
          null,
          null,
          `Unrecognized Sorting Method Provided: ${method}`
        );
        return {
          ok: false,
          content: `Unrecognized Sorting Method Provided: ${method}`,
          short: "Server Error",
        };
    }

    const command = await sqlStorage`
      SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      ORDER BY ${orderType}
      ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    return { ok: true, content: command };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

module.exports = {
  shutdownSQL,
  insertNewPackage,
  getPackageByName,
  getPackageCollectionByName,
  getPackageCollectionByID,
  removePackageByName,
  removePackageVersion,
  getFeaturedPackages,
  getTotalPackageEstimate,
  getSortedPackages,
  getUserByName,
  getUserByNodeID,
  getUserByID,
  getStarredPointersByUserID,
  getStarringUsersByPointer,
  getUserCollectionById,
  getPackageVersionByNameAndVersion,
  updatePackageIncrementDownloadByName,
  updatePackageDecrementDownloadByName,
  updatePackageIncrementStarByName,
  updatePackageDecrementStarByName,
  getFeaturedThemes,
  simpleSearch,
  updateStars,
  updateDeleteStar,
  insertNewUser,
  updateUser,
  insertNewPackageName,
  insertNewPackageVersion,
};
