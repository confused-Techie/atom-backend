// This will serve as a method to parse all query parameters and ensure that they are valid responses.

// While most values will just return their default there are some expecptions:
// q or the query of the search will return false if nothing is provided, to allow a fast way to return an empty
// array
// engines of the showing package details will return false if not defined, to allow a fast way
// of knowing not to prune results

function page(req) {
  var def = 1;
  var prov = req.query.page;

  if (typeof prov != "undefined") {
    // ensure it exists.
    // then ensure its a proper number
    // TODO
    return prov;
  } else {
    return def;
  }
}

function sort(req, def = "downloads") {
  // using sort with a default def value of downloads, means when using the generic sort parameter
  // it will default to downloads, but if we pass the default, such as during search we can provide
  // the default relevance
  var valid = ["downloads", "created_at", "updated_at", "stars"];

  var prov = req.query.sort;

  if (typeof prov != "undefined") {
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

  if (typeof prov != "undefined") {
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

  if (typeof prov != "undefined") {
    return prov;
  } else {
    return "";
  }
}

function engine(req) {
  var prov = req.query.engine;

  if (typeof prov != "undefined") {
    // TODO: engine also needs to be a valid semver.
    return prov;
  } else {
    return false;
  }
}

function repo(req) {
  var prov = req.query.repository;

  if (typeof prov != "undefined") {
    // TODO: may be a good future feature to check that this matches owner/repo
    return prov;
  } else {
    return "";
  }
}

function tag(req) {
  var prov = req.query.tag;

  if (typeof prov != "undefined") {
    return prov;
  } else {
    return "";
  }
}

function rename(req) {
  var prov = req.query.rename;

  if (typeof prov != "undefined") {
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
