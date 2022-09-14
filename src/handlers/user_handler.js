/**
 * @module user_handler
 * @desc Handler for endpoints whose slug after `/api/` is `user`.
 */

const logger = require("../logger.js");
const common = require("./common_handler.js");
const database = require("../database.js");
const utils = require("../utils.js");

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
    login: req.params.login,
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

module.exports = {
  getLoginStars,
};
