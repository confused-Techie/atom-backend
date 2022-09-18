/**
 * @module utils
 * @desc A helper for any functions that are agnostic in hanlders.
 */
const logger = require("./logger.js");
const common = require("./handlers/common_handler.js");
const database = require("./database.js");
const storage = require("./storage.js");
const { server_url } = require("./config.js").getConfig();

async function isPackageNameBanned(name) {
  let names = await storage.getBanList();

  if (!names.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.warningLog(null, null, "Unable to locate Name Ban List");
    return { ok: true };
  }

  for (let i = 0; i < names.content.length; i++) {
    if (name === names.content[i]) {
      // it was found on a ban list.
      return { ok: false };
    }
  }

  // name wasn't found on any ban lists.
  return { ok: true };
}

/**
 * @async
 * @function localUserLoggedIn
 * @desc Used as a less verbose way to check if the current user token, is associated
 * with a logged in user. If not handles errors automatically, if so calls the callback
 * function passing the Server Status Object, where content is User.
 * @param {object} req -
 * @param {object} res -
 * @param {string} params_user - Usually `params.auth` or otherwise the authorization
 * token within the header field.
 * @param {function} callback - The callback to invoke only if the user is properly authenticated.
 */
async function localUserLoggedIn(req, res, params_user, callback) {
  let user = await database.verifyAuth(params_user);

  if (!user.ok) {
    await common.authFail(req, res, user);
    return;
  }

  callback(user);
}

/**
 * @async
 * @function constructPackageObjectFull
 * @desc Takes the raw return of a full row from the packages table,
 * constructs a standardized package object full from it.
 */
async function constructPackageObjectFull(pack) {
  const parseVersions = function (vers) {
    let retVer = {};

    for (let i = 0; i < vers.length; i++) {
      retVer[vers[i].semver] = vers[i].meta;
      retVer[vers[i].semver].license = vers[i].license;
      retVer[vers[i].semver].engine = vers[i].engine;
      retVer[vers[i].semver].dist = {
        tarball: `${server_url}/api/packages/${pack.name}/versions/${vers[i].semver}/tarball`,
      };
    }
    return retVer;
  };

  const findLatestVersion = function (vers) {
    for (let i = 0; i < vers.length; i++) {
      if (vers[i].status === "latest") {
        return vers[i].semver;
      }
    }
  };

  let newPack = pack.data;
  newPack.downloads = pack.downloads;
  newPack.stargazers_count = pack.stargazers_count;
  newPack.versions = parseVersions(pack.json_agg);
  newPack.releases = {
    latest: findLatestVersion(pack.json_agg),
  };

  return newPack;
}

/**
 * @async
 * @function constructPackageObjectShort
 * @desc Takes a single or array of rows from the db, and returns a JSON
 * construction of package object shorts
 */
async function constructPackageObjectShort(pack) {
  if (Array.isArray(pack)) {
    let retPacks = [];

    for (let i = 0; i < pack.length; i++) {
      let newPack = pack[i].data;
      newPack.downloads = pack[i].downloads;
      newPack.stargazers_count = pack[i].stargazers_count;
      newPack.releases = {
        latest: pack[i].semver,
      };
      retPacks.push(newPack);
    }
    return retPacks;
  } else {
    // not an array
    let newPack = pack.data;
    newPack.downloads = pack.downloads;
    newPack.stargazers_count = pack.stargazers_count;
    newPack.releases = {
      latest: pack.semver,
    };

    return newPack;
  }
}

/**
 * @async
 * @function constructPackageObjectJSON
 * @desc Takes the return of getPackageVersionByNameAndVersion and returns
 * a recreation of the package.json with a modified dist.tarball key, poionting
 * to this server for download.
 */
async function constructPackageObjectJSON(pack) {
  if (!Array.isArray(pack)) {
    let newPack = pack.meta;
    delete newPack.sha;
    newPack.dist.tarball = `${server_url}/api/packages/${pack.meta.name}/versions/${pack.semver}/tarball`;
    newPack.engines = pack.engine;
    return newPack;
  } else {
    // this function does not currently support arrays
    return {};
  }
}

/**
 * @async
 * @function deepCopy
 * @depreciated Since migration to DB, and not having to worry about in memory objects.
 * @desc Originally was a method to create a deep copy of shallow copied complex objects.
 * Which allowed modifications on the object without worry of changing the values
 * of the original object, or realistically cached objects. But at this point, the feature
 * may still be useful in the future. So has been moved from collection.js to utils.js
 * Just in case it is needed again.
 * @param {object} obj - The Object to Deep Copy.
 * @return {object} A Deep Copy of the original object, that should share zero references to the original.
 */
async function deepCopy(obj) {
  console.warn(`collection.deepCopy is depreciated! ${deepCopy.caller}`);
  // this resolves github.com/confused-Techie/atom-community-server-backend-JS issue 13, and countless others.
  // When the object is passed to these sort functions, they work off a shallow copy. Meaning their changes
  // affect the original read data, meaning the cached data. Meaning subsequent queries may fail or error out.
  // This will allow the object to be deep copied before modification.
  // Because JS only will deep copy up to two levels deep within an object a custom implementation is needed.
  // While we could stringify the object and parse, lets go with something a bit more obvious and verbose.

  let outObject, value, key;

  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  outObject = Array.isArray(obj) ? [] : {};

  for (key in obj) {
    value = obj[key];

    outObject[key] = await deepCopy(value);
  }

  return outObject;
}

module.exports = {
  isPackageNameBanned,
  constructPackageObjectFull,
  constructPackageObjectShort,
  constructPackageObjectJSON,
  deepCopy,
};
