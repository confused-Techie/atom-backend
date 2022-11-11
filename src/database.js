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

let sql_storage; // SQL object, to interact with the DB.
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
  if (process.env.PULSAR_STATUS == "dev") {
    return postgres({
      host: DB_HOST,
      username: DB_USER,
      database: DB_DB,
      port: DB_PORT,
    });
  } else {
    return postgres({
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
}

/**
 * @function shutdownSQL
 * @desc Ensures any Database connection is properly, and safely closed before exiting.
 */
function shutdownSQL() {
  if (sql_storage !== undefined) {
    sql_storage.end();
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
  sql_storage ??= setupSQL();

  // Since this operation involves multiple queries, we perform a
  // PostgreSQL transaction executing a callback on begin().
  // All data is committed into the database only if no errors occur.
  return await sql_storage
    .begin(async () => {
      const pack_data = {
        name: pack.name,
        repository: pack.repository,
        readme: pack.readme,
        metadata: pack.metadata,
      };

      // No need to specify downloads and stargazers. They default at 0 on creation.
      let command = await sql_storage`
      INSERT INTO packages (name, creation_method, data)
      VALUES (${pack.name}, ${pack.creation_method}, ${pack_data})
      RETURNING pointer;
    `;

      const pointer = command[0].pointer;
      if (pointer === undefined) {
        throw `Cannot insert ${pack.name} in packages table`;
      }

      // Populate names table
      command = await sql_storage`
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

        command = await sql_storage`
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
      return { ok: false, content: err, short: "Server Error" };
    });
}

/**
 * @function getPackageByID
 * @desc Takes a package pointer UUID, and returns the package object within
 * a Server Status Object.
 */
async function getPackageByID(id) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 */
async function getPackageByName(name, user = false) {
  try {
    sql_storage ??= setupSQL();

    // While this query achieves the same as the one below it, there is about .1ms saved.
    //const command = await sql_storage`
    //  SELECT p.*, JSON_AGG(v.*) FROM packages p JOIN versions v ON p.pointer = v.package
    //  WHERE pointer IN (
    //    SELECT pointer FROM names WHERE name = ${name}
    //  )
    //  GROUP BY p.pointer, v.package;
    //`;

    const command = await sql_storage`
      SELECT
        ${
          user ? sql_storage`` : sql_storage`p.pointer,`
        } p.name, p.created, p.updated, p.creation_method,
        p.downloads, p.stargazers_count, p.original_stargazers, p.data,
        JSONB_AGG(JSON_BUILD_OBJECT(
          ${
            user
              ? sql_storage``
              : sql_storage`'id', v.id, 'package', v.package,`
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
 * @function getPackageVersionByNameAndVersion
 * @desc Uses the name of a package and it's version to return the version info.
 * @param {string} name - The name of the package to query.
 * @param {string} version - The version of the package to query.
 * @returns {object} A server status object.
 */
async function getPackageVersionByNameAndVersion(name, version) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function getPackageCollectionByName
 * @desc Takes a package name array, and returns an array of the package objects.
 * You must ensure that the packArray passed is compatible. This function does not coerce compatibility.
 */
async function getPackageCollectionByName(packArray) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT *
      FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN (
        SELECT pointer FROM names
        WHERE name IN ${sql_storage(packArray)}
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
 * @function getPackageCollectionByID
 * @desc Takes a package pointer array, and returns an array of the package objects.
 */
async function getPackageCollectionByID(packArray) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT data FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN ${sql_storage(packArray)}
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: `No packages found.`, short: "Not Found" };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @function getPointerTable
 * @desc Returns a full package pointer table, allowing the full reference of package names
 * to package pointer UUIDs.
 */
async function getPointerTable() {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updatePackageIncrementStarByName
 * @description Uses the package name to increment it's stargazers count by one.
 * @param {string} name - The package name.
 * @returns {object} The effected server status object.
 */
async function updatePackageIncrementStarByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updatePackageDecrementStarByName
 * @description Uses the package name to decrement it's stargazers count by one.
 * @param {string} name - The package name.
 * @returns {object} The effected server status object.
 */
async function updatePackageDecrementStarByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updatePackageIncrementDownloadByName
 * @description Uses the package name to increment the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageIncrementDownloadByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updatePackageDecrementDownloadByName
 * @description Uses the package name to decrement the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageDecrementDownloadByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updatePackageByID
 * @todo This is one of the original functions migrated to SQL, and should be reviewed for accuracy.
 * @description Updates a Packages content, with new data.
 * @param {string} id - The packages ID.
 * @param {object} data - The Object data to update it with.
 * @returns {object} The modified Server Status Object.
 */
async function updatePackageByID(id, data) {
  try {
    sql_storage ??= setupSQL();

    const jsonData = JSON.stringify(data);

    const command = await sql_storage`
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
 * @function updatePackageByName
 * @todo This is one of the original functions migrated to SQL, and should be reviewed for accuracy.
 * @description Updates the packages content, with new data.
 * @param {string} name - The packages name.
 * @param {object} data - The object data to update it with.
 * @returns {object} A server status object.
 */
async function updatePackageByName(name, data) {
  try {
    sql_storage ??= setupSQL();

    const jsonData = JSON.stringify(data);

    const command = await sql_storage`
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

async function removePackageByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command_vers = await sql_storage`
      DELETE FROM versions
      WHERE package IN (
        SELECT pointer FROM names
        WHERE name = ${name}
      )
      RETURNING *;
    `;

    if (command_vers.count === 0) {
      return {
        ok: false,
        content: `Failed to delete any Versions for: ${name}`,
        short: "Server Error",
      };
    }

    const command_pack = await sql_storage`
      DELETE FROM packages
      WHERE pointer IN (
        SELECT pointer FROM names
        WHERE name = ${name}
      )
      RETURNING *;
    `;

    if (command_pack.count === 0) {
      // nothing was returning, the delete probably failed
      return {
        ok: false,
        content: `Failed to Delete Package for: ${name}`,
        short: "Server Errror",
      };
    }

    return command_pack[0].name === name
      ? { ok: true, content: `Successfully Deleted Package: ${name}` }
      : {
          ok: false,
          content: `Deleted unkown Package ${command_pack[0].name} during Deletion of ${name}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function removePackageByID(id) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      UPDATE versions
      SET status = "removed"
      WHERE package = id;
    `;

    return command.count !== 0
      ? { ok: true, content: `${id} package successfully removed.` }
      : {
          ok: false,
          content: `Unable remove the ${id} package.`,
          short: "Server Error",
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
 */
async function getTotalPackageEstimate() {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function getUserByName
 * @description Get a users details providing their username.
 */
async function getUserByName(username) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT * FROM users
      WHERE username = ${username};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to query for user: ${username}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @function getUserByID
 * @description Get user details providing their ID.
 */
async function getUserByID(id) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT * FROM users
      WHERE id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get User By ID: ${id}`,
        short: "Server Error",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get User By ID: ${id}`,
          short: "Server Error",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @function verifyAuth
 * @description Verify if an auth token matches a user, and get that user back if it does.
 * @todo Early write, should be reviewed.
 */
async function verifyAuth(token) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function updateStars
 * @description TODO Not sure at this point.
 */
async function updateStars(user, pack) {
  try {
    sql_storage ??= setupSQL();

    const command_pointer = await sql_storage`
      SELECT pointer FROM names
      WHERE name = ${pack};
    `;

    if (command_pointer.count === 0) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "Not Found",
      };
    }

    // else the command is a value, lets keep going

    const command_star = await sql_storage`
      INSERT INTO stars
      (package, userid) VALUES
      (${command_pointer[0].pointer}, ${user.id})
      RETURNING *;
    `;

    // Now we expect to get our data right back, and can check the
    // validity to know if this happened successfully or not.
    if (
      command_pointer[0].pointer == command_star[0].package &&
      user.id == command_star[0].userid
    ) {
      return {
        ok: true,
        content: `Successfully Stared ${command_pointer[0].pointer} with ${user.id}`,
      };
    } else {
      return {
        ok: false,
        content: `Failed to Star ${command_pointer[0].pointer} with ${user.id}`,
        short: "Server Error",
      };
    }
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @function updateDeleteStar
 * @description Needs verification.
 * @todo Write these documents when possible.
 */
async function updateDeleteStar(user, pack) {
  try {
    sql_storage ??= setupSQL();

    const command_pointer = await sql_storage`
      SELECT pointer FROM names
      WHERE name = ${pack};
    `;

    if (command_pointer.count === 0) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "Not Found",
      };
    }

    const command_unstar = await sql_storage`
      DELETE FROM stars
      WHERE (package = ${command_pointer[0].pointer}) AND (userid = ${user.id})
      RETURNING *;
    `;

    if (command_unstar.length === 0) {
      // The command failed, let see if its because the data doesn't exist.

      const does_exist = await sql_storage`
        SELECT EXISTS (
          SELECT 1 FROM stars
          WHERE (package = ${command_pointer[0].pointer}) AND (userid = ${user.id})
        );
      `;

      if (does_exist[0].exists) {
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
      user.id == command_unstar[0].userid &&
      command_pointer[0].pointer == command_unstar[0].package
    ) {
      return {
        ok: true,
        content: `Successfully Unstarred ${command_pointer[0].pointer} with ${user.id}`,
      };
    } else {
      return {
        ok: false,
        content: `Failed to Unstar ${command_pointer[0].pointer} with ${user.id}`,
        short: "Server Error",
      };
    }
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

/**
 * @function getStarredPointersByUserID
 * @description Get all stars of a user by their user id.
 */
async function getStarredPointersByUserID(userid) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function getStarringUsersByPointer
 * @description Use the pointer of a package to collect all users that have starred it.
 */
async function getStarringUsersByPointer(pointer) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
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
 * @function simpleSearch
 * @description The current Fuzzy-Finder implementation of search. Ideally eventually
 * will use a more advanced search method.
 */
async function simpleSearch(term, page, dir, sort) {
  try {
    sql_storage ??= setupSQL();

    let offset = 0;
    let limit = paginated_amount;

    if (page !== 1) {
      offset = page * paginated_amount;
    }

    const command = await sql_storage`
      SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN (
        SELECT pointer
        FROM names
        ${sql_storage`WHERE name ILIKE ${"%" + term + "%"}`}
      )
      ORDER BY ${
        sort === "relevance" ? sql_storage`downloads` : sql_storage`${term}`
      }
      ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
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
 * @function getUserCollectionById
 * @description Returns an array of Users and their associated data via the ids.
 * @param {array} ids - The IDs of users to collect the data of.
 * @returns {array} The array of users collected.
 */
async function getUserCollectionById(ids) {
  let user_array = [];

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
    console.log(user);
    user_array.push({ login: user.content.username });
  }

  return { ok: true, content: user_array };
}

/**
 * @async
 * @function getSortedPackages
 * @desc Takes the page, direction, and sort method returning the raw sql package
 * data for each. This monolithic function handles trunication of the packages,
 * and sorting, aiming to provide back the raw data, and allow later functions to
 * then reconstruct the JSON as needed.
 */
async function getSortedPackages(page, dir, method) {
  // Here will be a monolithic function for returning sortable packages arrays.
  // We must keep in mind that all the endpoint handler knows is the
  // page, sort method, and direction. We must figure out the rest here.
  // only knowing we have a valid sort method provided.

  let offset = 0;
  let limit = paginated_amount;

  if (page !== 1) {
    offset = page * paginated_amount;
  }

  try {
    sql_storage ??= setupSQL();

    let command = null;

    switch (method) {
      case "downloads":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY downloads
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "created_at":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY created
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "updated_at":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY updated
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset};
        `;
        break;
      case "stars":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY stargazers_count
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
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
  removePackageByID,
  getFeaturedPackages,
  getTotalPackageEstimate,
  getSortedPackages,
  getUserByName,
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
};
