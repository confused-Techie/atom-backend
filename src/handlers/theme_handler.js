/**
 * @module theme_handler
 * @desc Endpoint Handlers relating to themes only.
 * @implements {command_handler}
 * @implements {database}
 * @implements {utils}
 * @implements {logger}
 */

const common = require("./common_handler.js");
const database = require("../database.js");
const utils = require("../utils.js");
const logger = require("../logger.js");

/**
 * @async
 * @function getThemeFeatured
 * @desc Used to retreive all Featured Packages that are Themes. Originally an undocumented
 * endpoint. Returns a 200 response based on other similar responses.
 * Additionally for the time being this list is created manually, the same method used
 * on Atom.io for now. Although there are plans to have this become automatic later on.
 * @see {@link https://github.com/atom/apm/blob/master/src/featured.coffee|Source Code}
 * @see {@link https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23|Discussion}
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/themes/featured
 */
async function getThemeFeatured(req, res) {
  // Returns Package Object Short Array
  // Supports engine query parameter.
  let col = await database.getFeaturedThemes();

  if (!col.ok) {
    await common.handleError(req, res, col);
    return;
  }

  let newCol = await utils.constructPackageObjectShort(col.content);

  res.status(200).json(newCol);
  logger.httpLog(req, res);
}

async function getThemes(req, res) {
  res.status(200).json({message: "todo"});
}

async function getThemesSearch(req, res) {
  res.status(200).json({ message: "todo" });
}

module.exports = {
  getThemeFeatured,
  getThemes,
  getThemesSearch,
};
