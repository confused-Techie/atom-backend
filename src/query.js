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
  let max_length = 50; // While package.json names according to NPM can be up to 214 characters, for performance
  // on the server and assumed deminishing returns on longer queries, this is cut off at 50 as suggested by Digitalone1.
  var prov = req.query.q;

  if (prov === undefined) {
    return "";
  }

  try {
    var decodeProv = decodeURIComponent(prov); // this will undo any encoding done to get the request to us.

    // Then some basic checks to help prevent malicious queries.
    if (pathTraversalAttempt(decodeProv)) {
      // detected path traversal attack. Return empty query.
      return "";
    } else {
      // Do not allow strings longer than `max_length` characters
      return decodeProv.slice(0, max_length).trim();
    }
  } catch(err) {
    // an error occured while decoding the URI component. Return an empty query.
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

function pathTraversalAttempt(data) {
  // this will use several methods to check for the possibility of an attempted path traversal attack.

  // The definitions here are based off GoPage checks. https://github.com/confused-Techie/GoPage/blob/main/src/pkg/universalMethods/universalMethods.go
  // But we leave out any focused on defended against URL Encoded values, since this has already been decoded.
  //           unixBackNav, unixBackNavReverse, unixParentCatchAll,
  var checks = [ /\.{2}\//, /\.{2}\\/, /\.{2}/];

  for (var i = 0; i < checks.length; i++) {
    if (data.match(checks[i]) !== null) }
    return true;
  }
  return false; // if none of the matches are true.
}

module.exports = { page, sort, dir, query, engine, repo, tag, rename };
