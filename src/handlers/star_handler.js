/**
 * @module star_handler
 * @desc Handler for any endpoints whose slug after `/api/` is `star`.
 */

const logger = require("../logger.js");
const database = require("../database.js");
const common = require("./common_handler.js");
const collection = require("../collection.js");
const utils = require("../utils.js");

/**
 * @async
 * @function getStars
 * @desc Endpoint for `GET /api/stars`. Whose endgoal is to return an array of all packages
 * the authenticated user has stared.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {users.VerifyAuth}
 * @implements {data.GetPackageCollection}
 * @implements {logger.HTTPLog}
 * @implements {common.ServerError}
 * @implements {common.AuthFail}
 */
async function getStars(req, res) {
  // GET /api/stars
  let params = {
    auth: req.get("Authorization"),
  };

  const onLogin = async (user) => {

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
  };

  await utils.localUserLoggedIn(req, res, params.auth, onLogin);
}

module.exports = {
  getStars,
};
