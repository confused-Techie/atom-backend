// Here will be all features related to sorting, organizing, or pruning the package collections
// returned to the end user.

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
    return packages.reverse();
  } else {
    return "Unrecognized Direction Method!";
  }
}

async function Prune(packages) {
  // this will prune the return packages, or all items that shouldn't be included in the return to end users.
  // conceptualy this could mean the entire array of packages is looped through three times,
  // Meaning a possible linear time complexity of O(3). Which isn't great, but we will see I suppose.

  // Prune may also encounter an array of items, or a single item.
  if (Array.isArray(packages)) {
    return packages;
  } else {
    return packages;
  }
}

module.exports = {
  Sort,
  Direction,
  Prune,
};
