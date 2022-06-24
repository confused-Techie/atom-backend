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
  return prov.match(/^\d+$/) !== null ? prov : def;
}

function sort(req, def = "downloads") {
  // using sort with a default def value of downloads, means when using the generic sort parameter
  // it will default to downloads, but if we pass the default, such as during search we can provide
  // the default relevance
  var valid = ["downloads", "created_at", "updated_at", "stars"];
  var prov = req.query.sort;

  if (prov === undefined) {
    return def;
  }

  return valid.includes(prov) ? prov : def;
}

function dir(req) {
  var def = "desc";
  var valid = ["asc", "desc"];
  var prov = req.query.direction;

  if (prov === undefined) {
    return def;
  }

  return valid.includes(prov) ? prov : def;
}

function query(req) {
  // TODO: here we would want to handle any methods to avoid malicious actors with a search query.
  let max_length = 50;
  var prov = req.query.q;

  if (prov === undefined) {
    return "";
  }

  // Do not allow strings longer than `max_length` characters
  return prov.slice(0, max_length).trim();
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
  return prov.match(regex) !== null ? prov : false;
}

function repo(req) {
  let prov = req.query.repository;

  if (prov === undefined) {
    return "";
  }

  // ensure the repo is in the format "owner/repo"
  return prov.match(/^[\w\-.]+\/[\w\-.]+$/) !== null ? prov : "";
}

function tag(req) {
  var prov = req.query.tag;

  return prov !== undefined ? prov : "";
}

function rename(req) {
  var prov = req.query.rename;

  if (prov === undefined) {
    // since this is supposed to be a boolean value, return false as the defaulting behavior
    return false;
  }

  if (prov == "true" || prov == "TRUE") {
    return true;
  } else if (prov == "false" || prov == "FALSE") {
    return false;
  } else {
    return false;
  }
}

module.exports = { page, sort, dir, query, engine, repo, tag, rename };
