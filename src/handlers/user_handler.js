/**
 * @module user_handler
 * @desc Handler for endpoints whose slug after `/api/` is `user`.
 */

const logger = require("../logger.js");
const collection = require("../collection.js");
const common = require("./common_handler.js");
const database = require("../database.js");

/**
 * @async
 * @function getLoginStars
 * @desc Endpoint for `GET /api/users/:login/stars`. Whose goal is to return
 * An array of Package Object Short's collected from the authenticated user's
 * star gazer list.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function getLoginStars(req, res) {
  // GET /api/users/:login/stars 
  let params = {
    login: req.params.login,
  };
  
  let user = await database.getUserByName(params.login);
  
  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }
  
  let pointerCollection = await database.getStarredPointersByUserID(user.content.id);
  
  if (!pointerCollection.ok) {
    await common.handleError(req, res, pointerCollection);
    return;
  }
  
  let packageCollection = await database.getPackageCollectionByID(pointerCollection.content);
  
  if (!packageCollection.ok) {
    await common.handleError(req, res, packageCollection);
    return;
  }
  
  packageCollection = await collection.pruneShort(packageCollection.content);
  
  res.status(200).json(packageCollection);
  logger.httpLog(req, res);
}

module.exports = {
  getLoginStars,
};
