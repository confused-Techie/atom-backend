const error = require("../error.js");
const logger = require("../logger.js");
const users = require("../users.js");
const data = require("../data.js");

async function GETStars(req, res) {
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
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, packageCollection.content);
    }
  } else {
    if (user.short == "Bad Auth") {
      error.MissingAuthJSON(res);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, user.content);
    }
  }
}

module.exports = {
  GETStars,
};
