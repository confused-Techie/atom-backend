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
 * @function GETLoginStars
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
async function GETLoginStars(req, res) {
  // GET /api/users/:login/stars
  let params = {
    login: req.params.login,
  };
  let user = await users.GetUser(params.login);

  if (user.ok) {
    let packages = await data.GetPackageCollection(user.content.stars);

    if (packages.ok) {
      packages = await collection.POSPrune(packages.content); // package object short prune

      res.status(200).json(packages);
      logger.HTTPLog(req, res);
    } else {
      await common.ServerError(req, res, packages.content);
    }
  } else {
    if (user.short === "Not Found") {
      await common.NotFound(req, res);
    } else {
      await common.ServerError(req, res, user.content);
    }
  }
}

module.exports = {
  GETLoginStars,
};
