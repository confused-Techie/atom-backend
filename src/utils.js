/**
 * @module utils
 * @desc A helper for any functions that are agnostic in handlers.
 */
const logger = require("./logger.js");
const common = require("./handlers/common_handler.js");
const database = require("./database.js");
const storage = require("./storage.js");
const { server_url } = require("./config.js").getConfig();

/**
 * @async
 * @function isPackageNameBanned
 * @desc This uses the `storage.js` to retreive a banlist. And then simply
 * iterates through the banList array, until it finds a match to the name
 * it was given. If no match is found then it returns false.
 * @param {string} name - The name of the package to check if it is banned.
 * @returns {boolean} Returns true if the given name is banned. False otherwise.
 */
async function isPackageNameBanned(name) {
  let banList = await storage.getBanList();
  if (!banList.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.warningLog(null, null, "Unable to locate Name Ban List");
    return { ok: true };
  }

  return banList.content.find((b) => name === b) ? { ok: true } : { ok: false };
}

/**
 * @async
 * @function constructPackageObjectFull
 * @desc Takes the raw return of a full row from database.getPackageByName() and
 * constructs a standardized package object full from it.
 * This should be called only on the data provided by database.getPackageByName(),
 * otherwise the behavior is unexpected.
 * @param {object} pack - The anticipated raw SQL return that contains all data
 * to construct a Package Object Full.
 * @returns {object} A properly formatted and converted Package Object Full.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-full}
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/queries.md#retrieve-single-package--package-object-full}
 */
async function constructPackageObjectFull(pack) {
  const parseVersions = function (vers) {
    let retVer = {};

    for (let v of vers) {
      retVer[v.semver] = v.meta;
      retVer[v.semver].license = v.license;
      retVer[v.semver].engine = v.engine;
      retVer[v.semver].dist = {
        tarball: `${server_url}/api/packages/${pack.name}/versions/${v.semver}/tarball`,
      };
    }

    return retVer;
  };

  const findLatestVersion = function (vers) {
    for (const v of vers) {
      if (v.status === "latest") {
        return v.semver;
      }
    }
    return null;
  };

  let newPack = pack.data;
  newPack.name = pack.name;
  newPack.downloads = pack.downloads;
  newPack.stargazers_count = pack.stargazers_count + pack.original_stargazers;
  newPack.versions = parseVersions(pack.versions);
  newPack.releases = {
    latest: findLatestVersion(pack.versions),
  };

  return newPack;
}

/**
 * @async
 * @function constructPackageObjectShort
 * @desc Takes a single or array of rows from the db, and returns a JSON
 * construction of package object shorts
 * @param {object} pack - The anticipated raw SQL return that contains all data
 * to construct a Package Object Short.
 * @returns {object} A properly formatted and converted Package Object Short.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-short}
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/queries.md#retrieve-many-sorted-packages--package-object-short}
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
 * @param {object} pack - The expected raw SQL return of `getPackageVersionByNameAndVersion`
 * @returns {object} A properly formatted Package Object Mini.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-mini}
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
 * @returns {object} A Deep Copy of the original object, that should share zero references to the original.
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
