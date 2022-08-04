const common = require("./common_handler.js");

async function getUpdates(req, res) {
  // GET /api/updates
  // TODO: Stopped: Update Method
  await common.notSupported(req, res);
}

module.exports = {
  getUpdates,
};
