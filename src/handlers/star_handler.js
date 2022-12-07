/**
 * @module star_handler
 * @desc Handler for any endpoints whose slug after `/api/` is `star`.
 */

const logger = require("../logger.js");
const database = require("../database.js");
const common = require("./common_handler.js");
const utils = require("../utils.js");
const auth = require("../auth.js");
const query = require("../query.js");

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
    auth: query.auth(req),
  };

  let user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    logger.generic(3, "getStars auth.verifyAuth() Not OK", { type: "object", obj: user });
    await common.handleError(req, res, user);
    return;
  }

  let userStars = await database.getStarredPointersByUserID(user.content.id);

  if (!userStars.ok) {
    logger.generic(3, "getStars database.getStarredPointersByUserID() Not OK", {type: "object", obj: userStars});
    await common.handleError(req, res, userStars);
    return;
  }

  if (userStars.content.length === 0) {
    logger.generic(6, "getStars userStars Has Length of 0. Returning empty");
    // If we have a return with no items, means the user has no stars.
    // And this will error out later when attempting to collect the data for the stars.
    // So we will reutrn here
    res.status(200).json([]);
    logger.httpLog(req, res);
    return;
  }

  let packCol = await database.getPackageCollectionByID(userStars.content);

  if (!packCol.ok) {
    logger.generic(3, "getStars database.getPackageCollectionByID() Not OK", {type: "object", obj: packCol});
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
