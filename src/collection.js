/**
 * @module collection
 * @desc Endpoint of all features related to sorting, organizing, or pruning package
 * collections, to be returned to the user.
 */

const search_func = require("./search.js");
const logger = require("./logger.js");
const { search_algorithm } = require("./config.js").GetConfig();

/**
 * @desc Intended for use for a collection of Packages, sort them according to any valid Sorting method.
 * Note this should be called before, any Pruning has taken place.
 * Prioritizes returning packages so if an invalid method is provided returns the packages
 * without modification.
 * @async
 * @function Sort
 * @param {string} method - The Method to Sort By
 * @param {object[]} packages - The Packages in which to sort.
 * @return {object[]} The provided packages now sorted accordingly.
 */
async function Sort(packages, method) {
  // Note Sort, should be called before ANY pruning action has taken place.
  // Additional note, this implementation will sort EVERY single package no matter what.
  // TODO: Feature Request: Provide the page requested during sort, or the last item needed to sort,
  // then discard the rest of the array. Pruning length of array may actually be a smart move for all additional functions.

  switch (method) {
    case "downloads":
      packages.sort((a, b) => {
        if (a.downloads < b.downloads) {
          return 1;
        }
        if (a.downloads > b.downloads) {
          return -1;
        }
        return 0;
      });
      break;

    case "created_at":
      packages.sort((a, b) => {
        if (a.created < b.created) {
          return 1;
        }
        if (a.created > b.created) {
          return -1;
        }
        return 0;
      });
      break;

    case "updated_at":
      packages.sort((a, b) => {
        if (a.updated < b.updated) {
          return 1;
        }
        if (a.updated > b.updated) {
          return -1;
        }
        return 0;
      });
      break;

    case "stars":
      packages.sort((a, b) => {
        if (a.stargazers_count < b.stargazers_count) {
          return 1;
        }
        if (a.stargazers_count > b.stargazers_count) {
          return -1;
        }
        return 0;
      });
      break;

    case "relevance":
      packages.sort((a, b) => {
        if (a.relevance < b.relevance) {
          return 1;
        }
        if (a.relevance > b.relevance) {
          return -1;
        }
        return 0;
      });
      break;

    default:
      logger.WarningLog(
        null,
        null,
        `Unrecognized Sorting Method Provided: ${method}`
      );
      break;
  }

  return packages;
}

/**
 * @function Direction
 * @desc Sorts an array of package objects based on the provided method.
 * Intended to occur after sorting the package. Prioritizes returning packages,
 * so if an invalid method is provided returns the packages with no changes.
 * @param {object[]} packages - The array of package objects to work on.
 * @param {string} method - The method of which they should be organized. Either
 * "desc" = Descending, or "asc" = Ascending.
 * @returns {object[]|string} The array of object packages, now organized, or directly
 * returned if an invalid 'method' is supplied.
 * @async
 */
async function Direction(packages, method) {
  // While previously
  if (method === "desc") {
    // since we wrote the sort, we know it will return results, sorted by the default of desc, and we can return.
    return packages;
  } else if (method === "asc") {
    // we will have to flip the array, upside down.
    // this should work, but finding any solid info on time complexity, hasn't been the easiest, we may want additional logging for
    // the collection functions, to measure what the performance is like.
    return packages.reverse();
  } else {
    logger.WarningLog(
      null,
      null,
      `Unrecognized Direction Method Used: ${method}`
    );
    return packages;
  }
}

async function POFPrune(packages) {
  // This will prune Package Object Full items,

  // this will prune the return packages, or all items that shouldn't be included in the return to end users.
  // conceptualy this could mean the entire array of packages is looped through three times,
  // Meaning a possible linear time complexity of O(3). Which isn't great, but we will see I suppose.

  // WARNING!! : Here I will use the delete operator on the object to prune data, not suitable to the end user.
  // Based on my current research delete only deletes the objects reference to the value, not the value itself.
  // Meaning delete can be used on the shallow copy of data without affecting the original copy. This will need to be tested.

  if (Array.isArray(packages)) {
    for (let i = 0; i < packages.length; i++) {
      delete packages.created;
      delete packages.updated;
      delete packages.star_gazers;
    }
    return packages;
  } else {
    // single instance of a package

    // Remove server side objects.
    delete packages.created;
    delete packages.updated;
    delete packages.star_gazers;

    return packages;
  }
}

async function POSPrune(packages) {
  // This will prune Package Object Short items,

  // this will prune the return packages, or all items that shouldn't be included in the return to end users.
  // conceptualy this could mean the entire array of packages is looped through three times,
  // Meaning a possible linear time complexity of O(3). Which isn't great, but we will see I suppose.

  // WARNING!! : Here I will use the delete operator on the object to prune data, not suitable to the end user.
  // Based on my current research delete only deletes the objects reference to the value, not the value itself.
  // Meaning delete can be used on the shallow copy of data without affecting the original copy. This will need to be tested.

  if (Array.isArray(packages)) {
    for (let i = 0; i < packages.length; i++) {
      // First prune server side data.
      delete packages[i].created;
      delete packages[i].updated;
      delete packages[i].star_gazers;

      if (packages[i].relevance) {
        // Now if these were passed through the search, it'll add this extra value.
        delete packages[i].relevance;
      }

      // Then really all we need to remove for the short package object is the versions property.
      delete packages[i].versions;
    }
    return packages;
  } else {
    // single instance of package
    delete packages.created;
    delete packages.updated;
    delete packages.star_gazers;
    delete packages.versions;

    return packages;
  }
}

async function SearchWithinPackages(
  search,
  packages,
  searchAlgorithm = search_algorithm
) {
  // This will be the method which data is searched, where once searched through will apply a relevance score to each object.
  // This score can then be used to sort the results.

  // Due to the high potential of this being reworked later on, we will rely on a config option of searchAlgorithm
  // to define what method we are wanting to use.

  switch (searchAlgorithm) {
    case "levenshtein_distance":
      // The Levenshtein Distance will be the most basic form of search.
      // Simple, not accounting for any word seperators
      // and simply returning the edit distance between strings.

      for (let i = 0; i < packages.length; i++) {
        packages[i].relevance = search_func.levenshtein(
          search,
          packages[i].name
        );
      }
      break;

    case "levenshtein_distance_wsdm":
      for (let i = 0; i < packages.length; i++) {
        packages[i].relevance = search_func.levenshteinWSDM(
          search,
          packages[i].name
        );
      }
      break;

    case "lcs":
      for (let i = 0; i < packages.length; i++) {
        packages[i].relevance = search_func.lcs(search, packages[i].name);
      }
      break;

    default:
      throw new Error(
        `Unrecognized Search Algorithm in Config: ${searchAlgorithm}`
      );
  }

  return packages;
}

async function EngineFilter(pack, engine) {
  // Comparison utils:
  // These ones expect to get valid strings as parameters, which should be convertible to numbers.
  // Providing other types may lead to unexpected behaviors.
  // Always to be executed after passing the semver format validity.
  const gt = (a1, a2) => {
    const v1 = a1.map((n) => parseInt(n));
    const v2 = a2.map((n) => parseInt(n));

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
    const v1 = a1.map((n) => parseInt(n));
    const v2 = a2.map((n) => parseInt(n));

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

async function DeepCopy(obj) {
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

    outObject[key] = await DeepCopy(value);
  }

  return outObject;
}

module.exports = {
  Sort,
  Direction,
  POFPrune,
  POSPrune,
  EngineFilter,
  SearchWithinPackages,
  DeepCopy,
};
