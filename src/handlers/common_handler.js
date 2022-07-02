const error = require("../error.js");
const logger = require("../logger.js");

async function AuthFail(req, res, user) {
  if (user.short == "Bad Auth") {
    error.MissingAuthJSON(res);
    logger.HTTPLog(req, res);
  } else {
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
    logger.ErrorLog(req, res, user.content);
  }
}

async function ServerError(req, res, err) {
  error.ServerErrorJSON(res);
  logger.HTTPLog(req, res);
  logger.ErrorLog(req, res, err);
}

module.exports = {
  AuthFail,
  ServerError,
};
