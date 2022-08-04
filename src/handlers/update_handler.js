const common = require("./common_handler.js");

async function GETUpdates(req, res) {
  // GET /api/updates
  // TODO: Stopped: Update Method
  await common.notSupported(req, res);
}

module.exports = {
  GETUpdates,
};
