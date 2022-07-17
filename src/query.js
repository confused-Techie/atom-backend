/**
 * @module query
 * @desc Home to parsing all query parameters from the `Request` object. Ensuring a valid response.
 */

// While most values will just return their default there are some expecptions:
// q or the query of the search will return false if nothing is provided, to allow a fast way to return an empty
// array
// engines of the showing package details will return false if not defined, to allow a fast way
// of knowing not to prune results

/**
 * @function page
 * @desc Parser of the Page query parameter. Defaulting to 1.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns the valid page provided in the query parameter or 1, as the default.
 */
function page(req) {
  let def = 1;
  let prov = req.query.page;

  if (prov === undefined) {
    return def;
  }

  // ensure it's a proper number
  return prov.match(/^\d+$/) !== null ? prov : def;
}

/**
 * @function sort
 * @desc Parser for the 'sort' query parameter. Defaulting usually to downloads.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {string} [def="downloads"] - The default provided for sort. Allowing
 * The search function to use "relevance" instead of the default "downloads".
 * @returns {string} Either the user provided 'sort' query parameter, or the default specified.
 */
function sort(req, def = "downloads") {
  // using sort with a default def value of downloads, means when using the generic sort parameter
  // it will default to downloads, but if we pass the default, such as during search we can provide
  // the default relevance
  let valid = ["downloads", "created_at", "updated_at", "stars", "relevance"];
  let prov = req.query.sort;

  if (prov === undefined) {
    return def;
  }

  return valid.includes(prov) ? prov : def;
}

/**
 * @function dir
 * @desc Parser for either 'direction' or 'order' query parameter, prioritizing
 * 'direction'.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} The valid direction value from the 'direction' or 'order'
 * query parameter.
 */
function dir(req) {
  let def = "desc";
  let valid = ["asc", "desc"];
  let prov = req.query.direction;

  if (prov === undefined) {
    // Seems that the autolink headers use order, while documentation uses direction.
    // Since we are not sure where in the codebase it uses the other, we will just accept both.
    let altprov = req.query.order;

    if (altprov === undefined) {
      return def;
    }
    return valid.includes(altprov) ? altprov : def;
  }

  return valid.includes(prov) ? prov : def;
}

/**
 * @function query
 * @desc Checks the 'q' query parameter, trunicating it at 50 characters, and checking simplisticly that
 * it is not a malicious request.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} A valid search string derived from 'q' query parameter. Or '' if invalid.
 * @implements {pathTraversalAttempt}
 */
function query(req) {
  let max_length = 50; // While package.json names according to NPM can be up to 214 characters, for performance
  // on the server and assumed deminishing returns on longer queries, this is cut off at 50 as suggested by Digitalone1.
  let prov = req.query.q;

  if (prov === undefined) {
    return "";
  }

  try {
    let decodeProv = decodeURIComponent(prov); // this will undo any encoding done to get the request to us.

    // Then some basic checks to help prevent malicious queries.
    if (pathTraversalAttempt(decodeProv)) {
      // detected path traversal attack. Return empty query.
      return "";
    } else {
      // Do not allow strings longer than `max_length` characters
      return decodeProv.slice(0, max_length).trim();
    }
  } catch (err) {
    // an error occured while decoding the URI component. Return an empty query.
    return "";
  }
}

/**
 * @function engine
 * @desc Parses the 'engine' query parameter to ensure its valid, otherwise returning false.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns the valid 'engine' specified, or if none, returns false.
 */
function engine(req) {
  let prov = req.query.engine;

  if (prov === undefined) {
    return false;
  }

  // Taken from
  // - https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  // - https://regex101.com/r/vkijKf/1/

  const regex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  // Check if it's a valid semver
  return prov.match(regex) !== null ? prov : false;
}

/**
 * @function repo
 * @desc Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning the valid 'repository' query parameter, or '' if invalid.
 */
function repo(req) {
  let prov = req.query.repository;

  if (prov === undefined) {
    return "";
  }

  const re = /^[a-zA-Z0-9\-][\w\-.]{0,213}\/[a-zA-Z0-9\-][\w\-.]{0,213}$/;

  // Ensure req is in the format "owner/repo" and
  // owner and repo observe the following rules:
  // - less than or equal to 214 characters
  // - only URL safe characters (letters, digits, dashes, underscores and/or dots)
  // - cannot begin with a dot or an underscore
  // - cannot contain a space.
  return prov.match(re) !== null ? prov : "";
}

/**
 * @function tag
 * @desc Parses the 'tag' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns a valid 'tag' query parameter. Or '' if invalid.
 */
function tag(req) {
  let prov = req.query.tag;

  return prov !== undefined ? prov : "";
}

/**
 * @function rename
 * @desc Since this is intended to be returning a boolean value, returns false
 * if invalid, otherwise returns true. Checking for mixed captilization.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {boolean} Returns false if invalid, or otherwise returns the boolean value of the string.
 */
function rename(req) {
  let prov = req.query.rename;

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

/**
 * @function pathTraversalAttempt
 * @desc Completes some short checks to determine if the data contains a malicious
 * path traversal attempt. Returning a boolean indicating if a path traversal attempt
 * exists in the data.
 * @param {string} data - The data to check for possible malicious data.
 * @returns {boolean} True indicates a path traversal attempt was found. False otherwise.
 */
function pathTraversalAttempt(data) {
  // this will use several methods to check for the possibility of an attempted path traversal attack.

  // The definitions here are based off GoPage checks. https://github.com/confused-Techie/GoPage/blob/main/src/pkg/universalMethods/universalMethods.go
  // But we leave out any focused on defended against URL Encoded values, since this has already been decoded.
  //           unixBackNav, unixBackNavReverse, unixParentCatchAll,
  const checks = [/\.{2}\//, /\.{2}\\/, /\.{2}/];

  for (let i = 0; i < checks.length; i++) {
    if (data.match(checks[i]) !== null) {
      return true;
    }
  }
  return false; // if none of the matches are true.
}

module.exports = { page, sort, dir, query, engine, repo, tag, rename };
