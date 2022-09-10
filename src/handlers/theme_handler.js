/**
 * @module theme_handler
 * @desc Endpoint Handlers relating to themes only.
 * @implements {command_handler}
 */

const common = require("./common_handler.js");

/**
 * @async
 * @function getThemeFeatured
 * @desc Used to retreive all Featured Packages that are Themes. Originally an undocumented
 * endpoint. Returns a 200 response based on other similar responses.
 * Additionally for the time being this list is created manually, the same method used
 * on Atom.ioi for now. Although there are plans to have this become automatic later on.
 * @see {@link https://github.com/atom/apm/blob/master/src/featured.coffee|Source Code}
 * @see {@link https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23|Discussion}
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/themes/featured
 * @todo This function has never been implemented on this system.
 */
async function getThemeFeatured(req, res) {
  // Returns Package Object Short Array
  // Supports engine query parameter.
  await common.notSupported(req, res);
}

module.exports = {
  getThemeFeatured,
};
