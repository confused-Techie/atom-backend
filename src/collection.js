// Here will be all features related to sorting, organizing, or pruning the package collections
// returned to the end user.

/**
 * @desc Intended for use for a collection of Packages, sort them according to any valid Sorting method.
 * @async
 * @function Sort
 * @param {string} method - The Method to Sort By
 * @param {object} packages - The Packages in which to sort.
 * @return {object} The provided packages now sorted accordingly.
 */
async function Sort(packages, method) {
  if (method == "downloads") {
    return packages;
  } else if (method == "created_at") {
  } else if (method == "updated_at") {
  } else if (method == "stars") {
  } else if (method == "relevance") {
  } else {
    return "Unrecognized Sorting Method!";
  }
}

async function Direction(packages, method) {
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
  if (Array.isArray(packages)) {
    for (var i = 0; i < packages.length; i++) {
      // Reference below non-array argument for each removed value.
      delete packages[i].star_gazers;
      delete packages[i].updated;
      delete packages[i].created;
    }

    return packages;
  } else {
    // Remove star_gazers
    delete packages.star_gazers;
    // Remove updated
    delete packages.updated;
    // Remove created
    delete packages.created;
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
