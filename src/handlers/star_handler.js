const logger = require("../logger.js");
const users = require("../users.js");
const data = require("../data.js");
const common = require("./common_handler.js");

async function GETStars(req, res) {
  // GET /api/stars
  let params = {
    auth: req.get("Authorization"),
  };
  let user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    let packageCollection = await data.GetPackageCollection(user.content.stars);
    if (packageCollection.ok) {
      res.status(200).json(packageCollection.content);
      logger.HTTPLog(req, res);
    } else {
      await common.ServerError(req, res, packageCollection.content);
    }
  } else {
    await common.AuthFail(req, res, user);
  }
}

module.exports = {
  GETStars,
};
