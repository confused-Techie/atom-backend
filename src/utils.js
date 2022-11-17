/**
 * @module utils
 * @desc A helper for any functions that are agnostic in handlers.
 */
const logger = require("./logger.js");
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
    if (pack.length == 0) {
      // Sometimes it seems an empty array will be passed here, in that case we will protect against
      // manipulation of `undefined` objects
      return [];
    }
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
  }

  // not an array
  if (
    pack.data === undefined ||
    pack.downloads === undefined ||
    pack.stargazers_count === undefined ||
    pack.semver === undefined
  ) {
    return {};
  }

  let newPack = pack.data;
  newPack.downloads = pack.downloads;
  newPack.stargazers_count = pack.stargazers_count;
  newPack.releases = {
    latest: pack.semver,
  };

  return newPack;
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
    if (newPack.sha) {
      delete newPack.sha;
    }
    newPack.dist ??= {};
    newPack.dist.tarball = `${server_url}/api/packages/${pack.meta.name}/versions/${pack.semver}/tarball`;
    newPack.engines = pack.engine;
    return newPack;
  }

  let arrPack = [];

  for (let i = 0; i < pack.length; i++) {
    let newPack = pack[i].meta;
    if (newPack.sha) {
      delete newPack.sha;
    }
    newPack.dist ??= {};
    newPack.dist.tarball = `${server_url}/api/packages/${pack[i].meta.name}/versions/${pack[i].semver}/tarball`;
    newPack.engines = pack[i].engine;
    arrPack.push(newPack);
  }

  return arrPack;
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
  console.warn(`utils.deepCopy is depreciated! ${deepCopy.caller}`);
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

/**
 * @function engineFilter
 * @desc A complex function that provides filtering by Atom engine version.
 * This should take a package with it's versions and retreive whatever matches
 * that engine version as provided.
 */
async function engineFilter(pack, engine) {
  // Comparison utils:
  // These ones expect to get valid strings as parameters, which should be convertible to numbers.
  // Providing other types may lead to unexpected behaviors.
  // Always to be executed after passing the semver format validity.
  const gt = (a1, a2) => {
    const v1 = a1.map((n) => parseInt(n, 10));
    const v2 = a2.map((n) => parseInt(n, 10));

    if (v1[0] > v2[0]) {
      return true;
    } else if (v1[0] < v2[0]) {
      return false;
    }

    if (v1[1] > v2[1]) {
      return true;
    } else if (v1[1] < v2[1]) {
      return false;
    }

    return v1[2] > v2[2];
  };

  const lt = (a1, a2) => {
    const v1 = a1.map((n) => parseInt(n, 10));
    const v2 = a2.map((n) => parseInt(n, 10));

    if (v1[0] < v2[0]) {
      return true;
    } else if (v1[0] > v2[0]) {
      return false;
    }

    if (v1[1] < v2[1]) {
      return true;
    } else if (v1[1] > v2[1]) {
      return false;
    }

    return v1[2] < v2[2];
  };

  const eq = (a1, a2) => {
    return a1[0] === a2[0] && a1[1] === a2[1] && a1[2] === a2[2];
  };

  // Function start.
  // If a compatible version is found, we add its data to the metadata property of the package
  // Otherwise we return an unmodified package, so that it is usable to the consumer.

  // Validate engine type.
  if (typeof engine !== "string") {
    return pack;
  }

  const eng_sv = engine.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

  // Validate engine semver format.
  if (eng_sv === null) {
    return pack;
  }

  // We will want to loop through each version of the package, and check its engine version against the specified one.
  let compatible_version = "";

  for (const ver in pack.versions) {
    // Make sure the key we need is available, otherwise skip the current loop.
    if (!pack.versions[ver].engines.atom) {
      continue;
    }

    // Core Atom Packages contain '*' as the engine type, and will require a manual check.
    if (pack.versions[ver].engines.atom === "*") {
      break;
    }

    // Track the upper and lower end conditions.
    // Null type means not available; Bool type means available with the relative result.
    let lower_end = null;
    let upper_end = null;

    // Extract the lower end semver condition (i.e >=1.0.0)
    const low_sv = pack.versions[ver].engines.atom.match(
      /(>=?)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/
    );

    if (low_sv != null) {
      // Lower end condition present, so test it.
      switch (low_sv[1]) {
        case ">":
          lower_end = gt(
            [eng_sv[1], eng_sv[2], eng_sv[3]],
            [low_sv[2], low_sv[3], low_sv[4]]
          );

          break;
        case ">=":
          lower_end =
            gt(
              [eng_sv[1], eng_sv[2], eng_sv[3]],
              [low_sv[2], low_sv[3], low_sv[4]]
            ) ||
            eq(
              [eng_sv[1], eng_sv[2], eng_sv[3]],
              [low_sv[2], low_sv[3], low_sv[4]]
            );

          break;
      }
    }

    // Extract the upper end semver condition (i.e <=2.0.0)
    const up_sv = pack.versions[ver].engines.atom.match(
      /(<=?)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/
    );

    if (up_sv != null) {
      // Upper end condition present, so test it.
      switch (up_sv[1]) {
        case "<":
          upper_end = lt(
            [eng_sv[1], eng_sv[2], eng_sv[3]],
            [up_sv[2], up_sv[3], up_sv[4]]
          );

          break;
        case "<=":
          upper_end =
            lt(
              [eng_sv[1], eng_sv[2], eng_sv[3]],
              [up_sv[2], up_sv[3], up_sv[4]]
            ) ||
            eq(
              [eng_sv[1], eng_sv[2], eng_sv[3]],
              [up_sv[2], up_sv[3], up_sv[4]]
            );

          break;
      }
    }

    if (lower_end === null && upper_end === null) {
      // Both lower and upper end condition are unavailable.
      // So, as last resort, check if there is an equality condition (i.e =1.0.0)
      const eq_sv = pack.versions[ver].engines.atom.match(
        /^=(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
      );

      if (
        eq_sv !== null &&
        eq([eng_sv[1], eng_sv[2], eng_sv[3]], [eq_sv[1], eq_sv[2], eq_sv[3]])
      ) {
        compatible_version = ver;

        break; // Found the compatible version, break the loop.
      }

      // Equality condition unavailable or not satisfied, skip the current loop.
      continue;
    }

    // One of the semver condition may still be not present.
    if (lower_end === null) {
      // Only upper end available
      if (upper_end) {
        compatible_version = ver;

        break; // The version is under the upper end, break the loop.
      }
    } else if (upper_end === null) {
      // Only lower end available
      if (lower_end) {
        compatible_version = ver;

        break; // The version is over the lower end, break the loop.
      }
    }

    // Both lower and upper end are available.
    if (lower_end && upper_end) {
      compatible_version = ver;

      break; // The version is within the range, break the loop.
    }
  }

  // After the loop ends, or breaks, check the extracted compatible version.
  if (compatible_version === "") {
    // No valid version found.
    return pack;
  }

  // We have a compatible version, let's add its data to the metadata property of the package.
  pack.metadata = pack.versions[compatible_version];

  return pack;
}

/**
  * @class StateStore
  * @desc This simple state store acts as a hash map, allowing authentication request
  * to quickly add a new state related to an IP, and retrieve it later on.
  * These states are used during the authentication flow to help ensure against malicious activity.
  */
class StateStore {
  constructor() {
    this.hashmap = {};
    // In the future ideally we could allow the choice of how to generate the state
    // But in this case it'll currently be hard coded
  }
  getState(ip, state) {
    if (this.hashmap[ip]) {
      return { ok: true, content: this.hashmap[ip] };
    } else {
      return { ok: false, short: "Not Found", content: "Couldn't find IP within StateStore" };
    }
  }
  setState(ip) {
    let state = this.createState();
    this.hashmap[ip] = state;
    return { ok: true, content: state };
  }
  createState() {
    crypto.generateKey('aes', { length: 128 }, (err, key) => {
      if (err) {
        return { ok: false, short: "Server Error", content: `Failed to generate AES State: ${err}` };
      }
      return { ok: true, content: key.export().toString('hex') };
    });
  }
}

module.exports = {
  isPackageNameBanned,
  constructPackageObjectFull,
  constructPackageObjectShort,
  constructPackageObjectJSON,
  deepCopy,
  engineFilter,
  StateStore,
};
