/**
 * @module error
 * @desc Contains different error messages that can be returned, adding them and their
 * respective HTTP Status Codes to the `Response` object provided to them.
 * Letting them all be defined in one place for ease of modification, and easily route
 * to them from different handlers.
 */

/**
 * @function notFoundJSON
 * @desc The Standard JSON Handling when an object is not found.
 * ###### Setting:
 * * Status Code: 404
 * * JSON Respone Body: message: "Not Found"
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function notFoundJSON(res) {
  res.status(404).json({ message: "Not Found" });
}

/**
 * @function siteWide404
 * @desc The standard Website Page 404 not found handler.
 * @todo Currently this returns a JSON object, but in the future should return an HTML Not Found page.
 * ###### Setting Currently:
 * * Status Code: 404
 * * JSON Response Body: message: "This is a standin for the proper site wide 404 page."
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function siteWide404(res) {
  res
    .status(404)
    .json({ message: "This is a standin for the proper site wide 404 page." });
}

/**
 * @function missingAuthJSON
 * @desc JSON Handling when authentication fails.
 * ###### Setting:
 * * Status Code: 401
 * * JSON Response Body: message: "Requires authentication. Please update your token if you haven't done so recently."
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function missingAuthJSON(res) {
  res.status(401).json({
    message:
      "Requires authentication. Please update your token if you haven't done so recently.",
  });
}

/**
 * @function serverErrorJSON
 * @desc The Standard Server Error JSON Endpoint.
 * ###### Setting:
 * * Status Code: 500
 * * JSON Response Body: message: "Application Error"
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function serverErrorJSON(res) {
  res.status(500).json({ message: "Application Error" });
}

/**
 * @function publishPackageExists
 * @desc JSON Response announcing a package already exists.
 * ###### Setting:
 * * Status Code: 409
 * * JSON Response Body: message: "A Package by that name already exists."
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function publishPackageExists(res) {
  res.status(409).json({ message: "A Package by that name already exists." });
}

/**
 * @function badRepoJSON
 * @desc JSON Response announcing that the repo doesn't exist, or is inaccessible.
 * ###### Setting:
 * * Status Code: 400
 * * JSON Response Body: message: That repo does not exist, isn't an atom package, or atombot does not have access.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function badRepoJSON(res) {
  res.status(400).json({
    message:
      "That repo does not exist, isn't an atom package, or atombot does not have access.",
  });
}

/**
 * @function badPackageJSON
 * @desc JSON Response annoucning that the package.json of a repo is invalid.
 * ###### Setting:
 * * Status Code: 400
 * * JSON Response Body: message: The package.json at owner/repo isn't valid.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function badPackageJSON(res) {
  res
    .status(400)
    .json({ message: "The package.json at owner/repo isn't valid." });
}

/**
 * @function unsupportedJSON
 * @desc This is a standard JSON endpoint to define an endpoint that is currently not supported.
 * Used currently to delineate which endpoints have not been fully implemented. Or a specific error endpoint
 * that has not been written yet.
 * ###### Setting:
 * * Status Code: 501
 * * JSON Response Body: message: "While under development this feature is not supported."
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
function unsupportedJSON(res) {
  // this is only an interm response while the server is under development.
  res.status(501).json({
    message: "While under development this feature is not supported.",
  });
}

module.exports = {
  notFoundJSON,
  siteWide404,
  missingAuthJSON,
  serverErrorJSON,
  unsupportedJSON,
  publishPackageExists,
  badRepoJSON,
  badPackageJSON,
};
