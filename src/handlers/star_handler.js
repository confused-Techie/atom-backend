/**
 * @module star_handler
 * @desc Handler for any endpoints whose slug after `/api/` is `star`.
 * @implements {logger}
 * @implements {users}
 * @implements {data}
 * @implements {common_handler}
 */

const logger = require("../logger.js");
const users = require("../users.js");
const data = require("../data.js");
const common = require("./common_handler.js");
const collection = require("../collection.js");
const utils = require("../utils.js");

/**
 * @async
 * @function GETStars
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
async function GETStars(req, res) {
  // GET /api/stars
  let params = {
    auth: req.get("Authorization"),
  };

  await utils.LocalUserLoggedIn(req, res, params.auth, async (user) => {
    let packageCollection = await data.GetPackageCollection(user.content.stars);

    if (!packageCollection.ok) {
      await common.HandleError(req, res, packageCollection);
      return;
    }

    // We need to prune these items from a Server Package Full Item.
    let newCollection = await collection.DeepCopy(packageCollection.content);
    newCollection = await collection.POSPrune(newCollection);

    res.status(200).json(newCollection);
    logger.HTTPLog(req, res);
  });
}

module.exports = {
  GETStars,
};
