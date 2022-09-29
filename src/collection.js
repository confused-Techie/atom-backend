/**
 * @module collection
 * @desc Endpoint of all features related to sorting, organizing, or pruning package
 * collections, to be returned to the user.
 */

const search_func = require("./search.js");
const { search_algorithm } = require("./config.js").getConfig();

async function searchWithinPackages(
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

module.exports = {
  engineFilter,
  searchWithinPackages,
};
