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
 * @function AuthFail
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
async function AuthFail(req, res, user) {
  if (user.short === "Bad Auth") {
    error.MissingAuthJSON(res);
    logger.HTTPLog(req, res);
  } else {
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
    logger.ErrorLog(req, res, user.content);
  }
}

/**
 * @async
 * @function ServerError
 * @desc Returns a standard Server Error to the user as JSON. Logging the detailed error message to the server.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {string} err - The detailed error message to log server side.
 * @implements {error.ServerErrorJSON}
 * @implements {logger.HTTPLog}
 * @implements {logger.ErrorLog}
 */
async function ServerError(req, res, err) {
  error.ServerErrorJSON(res);
  logger.HTTPLog(req, res);
  logger.ErrorLog(req, res, err);
}

/**
 * @async
 * @function NotFound
 * @desc Standard endpoint to return the JSON Not Found error to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.NotFoundJSON}
 * @implements {logger.HTTPLog}
 */
async function NotFound(req, res) {
  error.NotFoundJSON(res);
  logger.HTTPLog(req, res);
}

/**
 * @async
 * @function NotSupported
 * @desc Returns a Not Supported message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.UnsupportedJSON}
 * @implements {logger.HTTPLog}
 */
async function NotSupported(req, res) {
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
}

/**
 * @async
 * @function SiteWideNotFound
 * @desc Returns the SiteWide 404 page to the end user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.SiteWide404}
 * @implements {logger.HTTPLog}
 */
async function SiteWideNotFound(req, res) {
  error.SiteWide404(res);
  logger.HTTPLog(req, res);
}

/**
 * @async
 * @function BadRepoJSON
 * @desc Returns the BadRepoJSON message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.BadRepoJSON}
 * @implements {logger.HTTPLog}
 */
async function BadRepoJSON(req, res) {
  error.BadRepoJSON(res);
  logger.HTTPLog(req, res);
}

/**
 * @async
 * @function BadPackageJSON
 * @desc Returns the BadPackageJSON message to the user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {error.BadPackageJSON}
 * @implements {logger.HTTPLog}
 */
async function BadPackageJSON(req, res) {
  error.BadPackageJSON(res);
  logger.HTTPLog(req, res);
}

module.exports = {
  AuthFail,
  ServerError,
  NotFound,
  SiteWideNotFound,
  NotSupported,
};
