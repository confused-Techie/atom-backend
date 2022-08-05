/**
 * @module user_handler
 * @desc Handler for endpoints whose slug after `/api/` is `user`.
 * @implements {logger}
 * @implements {users}
 * @implements {data}
 * @implements {collection}
 * @implements {common_handler}
 */

const logger = require("../logger.js");
const users = require("../users.js");
const data = require("../data.js");
const collection = require("../collection.js");
const common = require("./common_handler.js");

/**
 * @async
 * @function getLoginStars
 * @desc Endpoint for `GET /api/users/:login/stars`. Whose goal is to return
 * An array of Package Object Short's collected from the authenticated user's
 * star gazer list.
 * @param {object} req -
 * @param {object} res -
 * @implements {users.GetUser}
 * @implements {data.GetPackageCollection}
 * @implements {collection.POSPrune}
 * @implements {logger.HTTPLog}
 * @implements {common.ServerError}
 * @implements {common.NotFound}
 */
async function getLoginStars(req, res) {
  // GET /api/users/:login/stars
  let params = {
    login: req.params.login,
  };

  let user = await users.getUser(params.login);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  let packages = await data.getPackageCollection(user.content.stars);

  if (!packages.ok) {
    await common.handleError(req, res, packages);
    return;
  }
  let cpPackages = await collection.deepCopy(packages.content);
  cpPackages = await collection.prunePOS(cpPackages.content); // package object short prune

  res.status(200).json(cpPackages);
  logger.httpLog(req, res);
}

module.exports = {
  getLoginStars,
};
