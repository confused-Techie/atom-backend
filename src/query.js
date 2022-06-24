// This will serve as a method to parse all query parameters and ensure that they are valid responses.

// While most values will just return their default there are some expecptions:
// q or the query of the search will return false if nothing is provided, to allow a fast way to return an empty
// array
// engines of the showing package details will return false if not defined, to allow a fast way
// of knowing not to prune results

function page(req) {
  let def = 1;

  if (req.query.page === undefined) {
    return def;
  }

  // ensure it's a proper number
  return (prov.match(/^\d+$/) !== null) ? prov : def;
}

function sort(req, def = "downloads") {
  // using sort with a default def value of downloads, means when using the generic sort parameter
  // it will default to downloads, but if we pass the default, such as during search we can provide
  // the default relevance
  var valid = ["downloads", "created_at", "updated_at", "stars"];

  var prov = req.query.sort;

  if (typeof prov !== undefined) {
    if (valid.includes(prov)) {
      // ensure it is a valid existing value.
      return prov;
    } else {
      return def;
    }
  } else {
    return def;
  }
}

function dir(req) {
  var def = "desc";
  var valid = ["asc", "desc"];
  var prov = req.query.direction;

  if (typeof prov !== undefined) {
    if (valid.includes(prov)) {
      // ensure that the provided value is a valid existing value.
      return prov;
    } else {
      return def;
    }
  } else {
    return def;
  }
}

function query(req) {
  // TODO: here we would want to handle any methods to avoid malicious actors with a search query.
  var prov = req.query.q;

  if (typeof prov !== undefined) {
    return prov;
  } else {
    return "";
  }
}

function engine(req) {
  let prov = req.query.engine;

  if (prov === undefined) {
    return false;
  }

  // Taken from
  // - https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  // - https://regex101.com/r/vkijKf/1/

  const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

  // Check if it's a valid semver
  return (prov.match(regex) !== null) ? prov : false;
}

function repo(req) {
  let prov = req.query.repository;

  if (prov === undefined) {
    return "";
  }

  // ensure the repo is in the format "owner/repo"
  return (prov.match(/^[[a-zA-Z0-9_\-.]+\/[[a-zA-Z0-9_\-.]+$/) !== null) ? prov : "";
}

function tag(req) {
  var prov = req.query.tag;

  if (typeof prov !== undefined) {
    return prov;
  } else {
    return "";
  }
}

function rename(req) {
  var prov = req.query.rename;

  if (typeof prov !== undefined) {
    if (prov == "true" || prov == "TRUE") {
      return true;
    } else if (prov == "false" || prov == "FALSE") {
      return false;
    } else {
      return false;
    }
  } else {
    // since this is supposed to be a boolean value, return false as the defaulting behavior
    return false;
  }
}

module.exports = { page, sort, dir, query, engine, repo, tag, rename };
