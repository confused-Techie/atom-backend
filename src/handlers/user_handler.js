/**
 * @module user_handler
 * @desc Handler for endpoints whose slug after `/api/` is `user`.
 */

const logger = require("../logger.js");
const common = require("./common_handler.js");
const database = require("../database.js");
const utils = require("../utils.js");
const query = require("../query.js");

/**
 * @async
 * @function getLoginStars
 * @desc Endpoint that returns another users Star Gazers List.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users/:login/stars
 */
async function getLoginStars(req, res) {
  let params = {
    login: query.login(req)
  };

  let user = await database.getUserByName(params.login);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  let pointerCollection = await database.getStarredPointersByUserID(
    user.content.id
  );

  if (!pointerCollection.ok) {
    await common.handleError(req, res, pointerCollection);
    return;
  }

  // Since even if the pointerCollection is okay, it could be empty. Meaning the user
  // has no stars. This is okay, but getPackageCollectionByID will fail, and result
  // in a not found when discovering no packages by the ids passed, which is none.
  // So we will catch the exception of pointerCollection being an empty array.

  if (
    Array.isArray(pointerCollection.content) &&
    pointerCollection.content.length === 0
  ) {
    // Check for array to protect from an unexpected return
    res.status(200).json([]);
    logger.httpLog(req, res);
    return;
  }

  let packageCollection = await database.getPackageCollectionByID(
    pointerCollection.content
  );

  if (!packageCollection.ok) {
    await common.handleError(req, res, packageCollection);
    return;
  }

  packageCollection = await utils.constructPackageObjectShort(
    packageCollection.content
  );

  res.status(200).json(packageCollection);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getAuthUser
 * @desc Endpoint that returns the currently authenticated Users User Details
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users
 */
async function getAuthUser(req, res) {
  const params = {
    auth: query.auth(req)
  };

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // TODO We need to find a way to add the users published pacakges here
  // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
  // Until now we will return the public details of their account.

  // Now with the user, since this is the authenticated user we can return all account details.
  res.status(200).json(user.content);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getUser
 * @desc Endpoint that returns the user account details of another user. Including all packages
 * published.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users/:login
 */
async function getUser(req, res) {
  const params = {
    login: query.login(req)
  };

  let user = await database.getUserByName(params.login);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // TODO We need to find a way to add the users published pacakges here
  // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
  // Until now we will return the public details of their account.

  // Although now we have a user to return, but we need to ensure to strip any sensitive details
  // since this return will go to any user.
  const returnUser = {
    username: user.content.username,
    avatar: user.content.avatar,
    created_at: user.content.created_at,
    data: user.content.data
  };

  res.status(200).json(returnUser);
  logger.httpLog(req, res);
}

module.exports = {
  getLoginStars,
  getAuthUser,
  getUser,
};
