const error = require("../error.js");
const logger = require("../logger.js");

async function GETUpdates(req, res) {
  // TODO: Stopped: Update Method
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
}

module.exports = {
  GETUpdates,
};
