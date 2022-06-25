// Here will be all features related to sorting, organizing, or pruning the package collections
// returned to the end user.

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
    // TODO search method to then find parameter of relevance.
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

async function Prune(packages) {
  // this will prune the return packages, or all items that shouldn't be included in the return to end users.
  // conceptualy this could mean the entire array of packages is looped through three times,
  // Meaning a possible linear time complexity of O(3). Which isn't great, but we will see I suppose.

  // WARNING!! : Here I will use the delete operator on the object to prune data, not suitable to the end user.
  // Based on my current research delete only deletes the objects reference to the value, not the value itself.
  // Meaning delete can be used on the shallow copy of data without affecting the original copy. This will need to be tested.

  // There is some data that these package objects will contain that shouldn't be passed to the end user.
  // star_gazers (A list of all star_gazers users), updated, created,

  // Prune may also encounter an array of items, or a single item.
  // TODO: TODO: This is based on an old schema model, and is now improper.
  if (Array.isArray(packages)) {
    for (var i = 0; i < packages.length; i++) {
      // Reference below non-array argument for each removed value.
      //delete packages[i].star_gazers;
      //delete packages[i].updated;
      //delete packages[i].created;
    }

    return packages;
  } else {
    // Remove star_gazers
    //delete packages.star_gazers;
    // Remove updated
    //delete packages.updated;
    // Remove created
    //delete packages.created;
    //Return the package
    return packages;
  }
}

async function EngineFilter(pack, engine) {
  // TODO: All of it
  return pack;
}

module.exports = {
  Sort,
  Direction,
  Prune,
  EngineFilter,
};
