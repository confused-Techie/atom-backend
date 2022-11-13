/**
 * @module star_handler
 * @desc Handler for any endpoints whose slug after `/api/` is `star`.
 */

const logger = require("../logger.js");
const database = require("../database.js");
const common = require("./common_handler.js");
const utils = require("../utils.js");

/**
 * @async
 * @function getStars
 * @desc Endpoint for `GET /api/stars`. Whose endgoal is to return an array of all packages
 * the authenticated user has stared.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/stars
 */
async function getStars(req, res) {
  let params = {
    auth: req.get("Authorization"),
  };

  let user = await database.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  let userStars = await database.getStarredPointersByUserID(user.content.id);

  if (!userStars.ok) {
    await common.handleError(req, res, userStars);
    return;
  }

  if (userStars.content.length == 0) {
    // If we have a return with no items, means the user has no stars.
    // And this will error out later when attempting to collect the data for the stars.
    // So we will reutrn here
    res.status(200).json([]);
    logger.httpLog(req, res);
    return;
  }

  let packCol = await database.getPackageCollectionByID(userStars.content);

  if (!packCol.ok) {
    await common.handleError(req, res, packCol);
    return;
  }

  let newCol = await utils.constructPackageObjectShort(packCol.content);

  res.status(200).json(newCol);
  logger.httpLog(req, res);
}

module.exports = {
  getStars,
};
