// Here will be all features related to sorting, organizing, or pruning the package collections
// returned to the end user.

const search_func = require("./search.js");
const { search_algorithm } = require("./config.js").GetConfig();

/**
 * @desc Intended for use for a collection of Packages, sort them according to any valid Sorting method.
 * Note this should be called before, any Pruning has taken place.
 * @async
 * @function Sort
 * @param {string} method - The Method to Sort By
 * @param {object} packages - The Packages in which to sort.
 * @return {object} The provided packages now sorted accordingly.
 */
async function Sort(packages, method) {
  // Note Sort, should be called before ANY pruning action has taken place.
  // Additional note, this implementation will sort EVERY single package no matter what.
  // TODO: Feature Request: Provide the page requested during sort, or the last item needed to sort,
  // then discard the rest of the array. Pruning length of array may actually be a smart move for all additional functions.
  if (method == "downloads") {
    packages.sort((a, b) => {
      if (a.downloads < b.downloads) {
        return 1;
      }
      if (a.downloads > b.downloads) {
        return -1;
      }
      return 0;
    });

    return packages;
  } else if (method == "created_at") {
    packages.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      }
      if (a.created > b.created) {
        return -1;
      }
      return 0;
    });

    return packages;
  } else if (method == "updated_at") {
    packages.sort((a, b) => {
      if (a.updated < b.updated) {
        return 1;
      }
      if (a.updated > b.updated) {
        return -1;
      }
      return 0;
    });

    return packages;
  } else if (method == "stars") {
    packages.sort((a, b) => {
      if (a.stargazers_count < b.stargazers_count) {
        return 1;
      }
      if (a.stargazers_count > b.stargazers_count) {
        return -1;
      }
      return 0;
    });

    return packages;
  } else if (method == "relevance") {
    packages.sort((a,b) => {
      if (a.relevance < b.relevance) {
        return 1;
      }
      if (a.relevance > b.relevance) {
        return -1;
      }
      return 0;
    });

    return packages;
  } else {
    return "Unrecognized Sorting Method!";
  }
}

async function Direction(packages, method) {
  // While previously
  if (method == "desc") {
    // since we wrote the sort, we know it will return results, sorted by the default of desc, and we can return.
    return packages;
  } else if (method == "asc") {
    // we will have to flip the array, upside down.
    // this should work, but finding any solid info on time complexity, hasn't been the easiest, we may want additional logging for
    // the collection functions, to measure what the performance is like.
    return packages.reverse();
  } else {
    return "Unrecognized Direction Method!";
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
  // this will be the method which data is searched, where once searched through will apply a relevance score to each object.
  // This score can then be used to sort the results.

  // Due to the high potential of this being reworked later on, we will rely on a config option of searchAlgorithm
  // to define what method we are wanting to use.

  if (searchAlgorithm == "levenshtein_distance") {
    // The Levenshtein Distance will be the most basic form of search. Simple, not accounting for any word seperators
    // and simply returning the edit distance between strings.

    for (let i = 0; i < packages.length; i++) {
      packages[i].relevance = search_func.levenshtein(search, packages[i].name);
    }

    return packages;
  } else if (searchAlgorithm == "levenshtein_distance_wsdm") {
    for (let i = 0; i < packages.length; i++) {
      packages[i].relevance = search_func.levenshteinWSDM(
        search,
        packages[i].name
      );
    }
    return packages;
  } else if (searchAlgorithm == "lcs") {
    for (let i = 0; i < packages.length; i++) {
      packages[i].relevance = search_func.lcs(search, packages[i].name);
    }
    return packages;
  } else {
    throw new Error(
      `Unrecognized Search Algorithm in Config: ${searchAlgorithm}`
    );
  }
}

async function EngineFilter(pack, engine) {
  // TODO: All of it
  return pack;
}

module.exports = {
  Sort,
  Direction,
  POFPrune,
  POSPrune,
  EngineFilter,
  SearchWithinPackages,
};
