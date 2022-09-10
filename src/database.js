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
 * @desc Takes a package name, and returns the raw SQL package data within a Server Status Object.
 * The second parameter details boolean, indicates the type of package object to return.
 * Either a short, or full.
 */
async function getPackageByName(name) {
  try {
    sql_storage ??= setupSQL();

    // While this query acheives the same as the one below it, there is about .1ms saved.
    //const command = await sql_storage`
    //  SELECT p.*, JSON_AGG(v.*)
    //  FROM packages p
    //  JOIN versions v ON p.pointer = v.package
    //  WHERE pointer IN (
    //    SELECT pointer
    //    FROM names
    //    WHERE name = ${name}
    //  )
    //  GROUP BY p.pointer, v.package;
    //`;
    const command = await sql_storage`
      SELECT p.*, JSON_AGG(v.*)
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
      AND semver = ${version}
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
      SELECT data FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
      WHERE pointer IN (
        SELECT pointer FROM names
        WHERE name IN ${sql_storage(packArray)}
      );
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

    const pointers = packArray.join(", ");

    const command = await sql_storage`
      SELECT data FROM packages
      WHERE pointer IN (${pointers});
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

async function updatePackageDownloadByName(name) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      UPDATE packages 
      SET downloads = downloads + 1
      WHERE pointer IN (
        SELECT pointer 
        FROM names 
        WHERE name = ${name}
      )
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
      )
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

    const command = await sql_storage`
      UPDATE versions
      SET status = "removed"
      WHERE package IN (
        SELECT pointer FROM names
        WHERE name = ${name}
      )
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

async function removePackageByID(id) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      UPDATE versions
      SET status = "removed"
      WHERE package = id
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

async function verifyAuth(token) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT 1 FROM users
      WHERE token = ${token};
    `;

    // If the return is zero rows, that means the request was successful
    // but nothing matched the query, which in this case is for the token.
    // so this should return bad auth.
    return command.count !== 0
      ? { ok: true, content: "Auth verified" }
      : {
          ok: false,
          content: `Unable to Verify Auth for Token: ${token}`,
          short: "Bad Auth",
        };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getStarredPointersByUserID(userid) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT ARRAY (
        SELECT packagepointer FROM stars WHERE userid=${userid}
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

async function getStarredPointersByUserName(username) {
  let user = await getUserByName(username);

  if (!user.ok) {
    return user;
  }

  let userid = user.content.id;

  let starred = await getStarredPointersByUserID(userid);

  return starred;
}

async function getStarringUsersByPointer(pointer) {
  try {
    sql_storage ??= setupSQL();

    const command = await sql_storage`
      SELECT ARRAY (
        SELECT userid FROM stars WHERE packagepointer=${pointer}
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

    user_array.push({ login: user.user_name });
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

    let command;

    switch (method) {
      case "downloads":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY downloads 
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset}
        `;
        break;
      case "created_at":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY created 
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset}
        `;
        break;
      case "updated_at":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY updated 
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset}
        `;
        break;
      case "stars":
        command = await sql_storage`
          SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
          ORDER BY stargazers_count 
          ${dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`}
          LIMIT ${limit}
          OFFSET ${offset}
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
  updatePackageDownloadByName,
  updatePackageDecrementDownloadByName,
  getFeaturedThemes,
};
