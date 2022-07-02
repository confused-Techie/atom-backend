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

async function NotFound(req, res) {
  error.NotFoundJSON(res);
  logger.HTTPLog(req, res);
}

async function NotSupported(req, res) {
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
}

async function SiteWideNotFound(req, res) {
  error.SiteWide404(res);
  logger.HTTPLog(req, res);
}

module.exports = {
  AuthFail,
  ServerError,
  NotFound,
  SiteWideNotFound,
  NotSupported,
};
