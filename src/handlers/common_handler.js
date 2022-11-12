/**
 * @module common_handler
 * @desc Provides a simplistic way to refer to implement common endpoint returns.
 * So these can be called as an async function without more complex functions, reducing
 * verbosity, and duplication within the codebase.
 * @implements {error}
 * @implements {logger}
 */

const error = require("../error.js");
const logger = require("../logger.js");

/**
 * @async
 * @function authFail
 * @desc Will take the <b>failed</b> user object from VerifyAuth, and respond for the endpoint as
 * either a "Server Error" or a "Bad Auth", whichever is correct based on the Error bubbled from VerifyAuth.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object} user - The Raw Status Object of the User, expected to return from `VerifyAuth`.
 * @implements {error.MissingAuthJSON}
 * @implements {error.ServerErrorJSON}
 * @implements {logger.HTTPLog}
 * @implements {logger.ErrorLog}
 */
async function authFail(req, res, user, num) {
  switch (user.short) {
    case "Bad Auth":
    case "Auth Fail":
    case "No Repo Access":// support for being passed a git return.
      error.missingAuthJSON(res);
      logger.httpLog(req, res);
      break;
    default:
      error.serverErrorJSON(res);
      logger.httpLog(req, res);
      logger.errorLog(req, res, user.content, num);
      break;
  }
}

/**
 * @async
 * @function serverError
 * @desc Returns a standard Server Error to the user as JSON. Logging the detailed error message to the server.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {string} err - The detailed error message to log server side.
 * @implements {error.ServerErrorJSON}
 * @implements {logger.HTTPLog}
 * @implements {logger.ErrorLog}
 */
async function serverError(req, res, err, num) {
  error.serverErrorJSON(res);
  logger.httpLog(req, res);
  logger.errorLog(req, res, err, num);
}

/**
 * @async
 * @function notFound
 * @desc Standard endpoint to return the JSON Not Found error to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.NotFoundJSON}
 * @implements {logger.HTTPLog}
 */
async function notFound(req, res) {
  error.notFoundJSON(res);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function notSupported
 * @desc Returns a Not Supported message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.UnsupportedJSON}
 * @implements {logger.HTTPLog}
 */
async function notSupported(req, res) {
  error.unsupportedJSON(res);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function siteWideNotFound
 * @desc Returns the SiteWide 404 page to the end user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.SiteWide404}
 * @implements {logger.HTTPLog}
 */
async function siteWideNotFound(req, res) {
  error.siteWide404(res);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function badRepoJSON
 * @desc Returns the BadRepoJSON message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.BadRepoJSON}
 * @implements {logger.HTTPLog}
 */
async function badRepoJSON(req, res) {
  error.badRepoJSON(res);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function badPackageJSON
 * @desc Returns the BadPackageJSON message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.BadPackageJSON}
 * @implements {logger.HTTPLog}
 */
async function badPackageJSON(req, res, num) {
  error.badPackageJSON(res, num);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function handleError
 * @desc Generic error handler mostly used to reduce the duplication of error handling in other modules.
 * It checks the short error string and calls the relative endpoint.
 * Note that it's designed to be called as the last async function before the return.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object} obj - the Raw Status Object of the User, expected to return from `VerifyAuth`.
 */
async function handleError(req, res, obj, num) {
  switch (obj.short) {
    case "Not Found":
      await notFound(req, res);
      break;

    case "Bad Repo":
      await badRepoJSON(req, res, num);
      break;

    case "Bad Package":
      await badPackageJSON(req, res, num);
      break;

    case "No Repo Access":
    case "Bad Auth":
      await authFail(req, res, obj, num);
      break;

    case "File Not Found":
    case "Server Error":
    default:
      await serverError(req, res, obj.content, num);
      break;
  }
}

module.exports = {
  authFail,
  serverError,
  notFound,
  siteWideNotFound,
  notSupported,
  badRepoJSON,
  badPackageJSON,
  handleError,
};
