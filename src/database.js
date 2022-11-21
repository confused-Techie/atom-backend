/**
 * @module database
 * @desc Provides an interface of a large collection of functions to interact
 * with and retreive data from the cloud hosted database instance.
 */

const fs = require("fs");
const postgres = require("postgres");
const storage = require("./storage.js");
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
 * @function getPackageByID
 * @desc Takes a package pointer UUID, and returns the package object within
 * a Server Status Object.
 * @param {string} id - Package UUID.
 * @returns {object} A server status object.
 */
async function getPackageByID(id) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT data FROM packages
      WHERE pointer = ${id};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0].data }
      : {
          ok: false,
          content: `package ${id} does not exist.`,
          short: "Not Found",
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
            user
              ? sqlStorage``
              : sqlStorage`'id', v.id, 'package', v.package,`
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
 * @function getPointerTable
 * @desc Returns a full package pointer table, allowing the full reference of package names
 * to package pointer UUIDs.
 */
async function getPointerTable() {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM names;
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: "Unable to get Package Pointers.",
          short: "Server Error",
        };
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
 * @function updatePackageByID
 * @todo This is one of the original functions migrated to SQL, and should be reviewed for accuracy.
 * @description Updates a Packages content, with new data.
 * @param {string} id - The packages ID.
 * @param {object} data - The Object data to update it with.
 * @returns {object} The modified Server Status Object.
 */
async function updatePackageByID(id, data) {
  try {
    sqlStorage ??= setupSQL();

    const jsonData = JSON.stringify(data);

    const command = await sqlStorage`
      UPDATE packages
      SET data = ${jsonData}, updated = CURRENT_TIMESTAMP
      WHERE pointer = ${id}
      RETURNING updated;
    `;

    return command[0].updated !== undefined
      ? { ok: true, content: command[0].updated }
      : {
          ok: false,
          content: `Unable to update the ${id} package.`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updatePackageByName
 * @todo This is one of the original functions migrated to SQL, and should be reviewed for accuracy.
 * @description Updates the packages content, with new data.
 * @param {string} name - The packages name.
 * @param {object} data - The object data to update it with.
 * @returns {object} A server status object.
 */
async function updatePackageByName(name, data) {
  try {
    sqlStorage ??= setupSQL();

    const jsonData = JSON.stringify(data);

    const command = await sqlStorage`
      UPDATE packages
      SET data = ${jsonData}, updated = CURRENT_TIMESTAMP
      WHERE pointer IN (
        SELECT pointer FROM names
        WHERE name = ${name}
      )
      RETURNING updated;
    `;

    return command[0].updated !== undefined
      ? { ok: true, content: command[0].updated }
      : {
          ok: false,
          content: `Unable to update the ${name} package.`,
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
      // Remove versions of the package
      const commandVers = await sqlStorage`
        DELETE FROM versions
        WHERE package IN (
          SELECT pointer FROM names
          WHERE name = ${name}
        )
        RETURNING *;
      `;

      if (commandVers.count === 0) {
        throw `Failed to delete any versions for: ${name}`;
      }

      // Remove stars assigned to the package
      const commandStar = await sqlStorage`
        DELETE FROM stars
        WHERE package IN (
          SELECT pointer FROM names
          WHERE name = ${name}
        )
        RETURNING *;
      `;

      if (commandStar.count === 0) {
        throw `Failed to delete stars for: ${name}`;
      }

      // Remove names related to the package
      const commandName = await sqlStorage`
        DELETE FROM names
        WHERE pointer IN (
          SELECT pointer FROM names
          WHERE name = ${name}
        )
        RETURNING *;
      `;

      if (commandName.count === 0) {
        throw `Failed to delete names for: ${name}`;
      }

      // Remove the package itself.
      // We will have to use the pointer returning from this last command, since we
      // can no longer preform the same lookup as before.
      const commandPack = await sqlStorage`
        DELETE FROM packages
        WHERE pointer = ${commandName[0].pointer}
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
 * just mark the status as removed.
 * @param {string} packName - The package name.
 * @param {string} semVer - The version to remove.
 * @returns {object} A server status object.
 */
async function removePackageVersion(packName, semVer) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
       UPDATE versions
       SET status = 'removed'
       WHERE semver = ${semVer} AND package IN (
         SELECT pointer
         FROM names
         WHERE name = ${packName}
       )
       RETURNING *;
     `;

    return command.count !== 0
      ? {
          ok: true,
          content: `Successfully removed ${semVer} version of ${packName} package.`,
        }
      : {
          ok: false,
          content: `Unable to remove ${semVer} version of ${packName} package.`,
          short: "Not Found",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
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
      SELECT reltuples AS estimate FROM pg_class WHERE relname='packages';
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
 * @function verifyAuth
 * @description Verify if an auth token matches a user, and get that user back if it does.
 * @todo Early write, should be reviewed.
 * @param {string} token - Token.
 * @returns {object} A server status object.
 */
async function verifyAuth(token) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE token = ${token};
    `;

    // If the return is zero rows, that means the request was successful
    // but nothing matched the query, which in this case is for the token.
    // so this should return bad auth.
    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to Verify Auth for Token: ${token}`,
          short: "Bad Auth",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updateStars
 * @description TODO Not sure at this point.
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
    if (
      commandPointer[0].pointer == commandStar[0].package &&
      user.id == commandStar[0].userid
    ) {
      return {
        ok: true,
        content: `Successfully Stared ${commandPointer[0].pointer} with ${user.id}`,
      };
    } else {
      return {
        ok: false,
        content: `Failed to Star ${commandPointer[0].pointer} with ${user.id}`,
        short: "Server Error",
      };
    }
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function updateDeleteStar
 * @description Needs verification.
 * @todo Write these documents when possible.
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
    if (
      user.id == commandUnstar[0].userid &&
      commandPointer[0].pointer == commandUnstar[0].package
    ) {
      return {
        ok: true,
        content: `Successfully Unstarred ${commandPointer[0].pointer} with ${user.id}`,
      };
    } else {
      return {
        ok: false,
        content: `Failed to Unstar ${commandPointer[0].pointer} with ${user.id}`,
        short: "Server Error",
      };
    }
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getStarredPointersByUserID
 * @description Get all stars of a user by their user id.
 */
async function getStarredPointersByUserID(userid) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT package FROM stars WHERE userid=${userid}
      );
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to Get Starred Pointers for ${userid}`,
        short: "Server Error",
      };
    }

    return { ok: true, content: command[0].array };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function getStarringUsersByUserName
 * @description Get all starred pointers by a username.
 */
async function getStarredPointersByUserName(username) {
  let user = await getUserByName(username);

  if (!user.ok) {
    return user;
  }

  let userid = user.content.id;

  let starred = await getStarredPointersByUserID(userid);

  return starred;
}

/**
 * @async
 * @function getStarringUsersByPointer
 * @description Use the pointer of a package to collect all users that have starred it.
 */
async function getStarringUsersByPointer(pointer) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT userid FROM stars WHERE package=${pointer.pointer}
      );
    `;

    if (command.count === 0) {
      // It is likely safe to assume that if nothing matches the packagepointer,
      // then the package pointer has no stars. So instead of server error
      // here we will non-traditionally return an empty array.
      logger.warningLog(
        null,
        null,
        `No Stars for ${pointer} found, assuming 0 star value.`
      );
      return { ok: true, content: [] };
    }

    return { ok: true, content: command[0].array };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @async
 * @function simpleSearch
 * @description The current Fuzzy-Finder implementation of search. Ideally eventually
 * will use a more advanced search method.
 */
async function simpleSearch(term, page, dir, sort) {
  try {
    sqlStorage ??= setupSQL();

    let limit = paginated_amount;
    let offset = (page > 1) ? ((page - 1) * limit) : 0;

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

  let offset = 0;
  let limit = paginated_amount;

  if (page !== 1) {
    offset = (page - 1) * paginated_amount;
  }

  try {
    sqlStorage ??= setupSQL();

    let command = null;

    switch (method) {
      case "downloads":
        command = await sqlStorage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY downloads
          ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "created_at":
        command = await sqlStorage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY created
          ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "updated_at":
        command = await sqlStorage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY updated
          ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "stars":
        command = await sqlStorage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY stargazers_count
          ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
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

    return { ok: true, content: command };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

module.exports = {
  shutdownSQL,
  insertNewPackage,
  getPackageByID,
  getPackageByName,
  getPackageCollectionByName,
  getPackageCollectionByID,
  updatePackageByID,
  updatePackageByName,
  removePackageByName,
  removePackageVersion,
  getFeaturedPackages,
  getTotalPackageEstimate,
  getSortedPackages,
  getUserByName,
  getUserByNodeID,
  getUserByID,
  verifyAuth,
  getStarredPointersByUserID,
  getStarredPointersByUserName,
  getStarringUsersByPointer,
  getPointerTable,
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
};
