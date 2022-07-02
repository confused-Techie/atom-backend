const error = require("../error.js");
const logger = require("../logger.js");
const users = require("../users.js");
const data = require("../data.js");
const collection = require("../collection.js");
const common = require("./common_handler.js");

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
    if (user.short == "Not Found") {
      await common.NotFound(req, res);
    } else {
      await common.ServerError(req, res, user.content);
    }
  }
}

module.exports = {
  GETLoginStars,
};
