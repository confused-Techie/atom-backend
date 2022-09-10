/**
 * @module oauth_handler
 * @desc Endpoint Handlers for Authentication URLs
 * @implements {config}
 * @implements {common_handler}
 */

const { GH_CLIENTID } = require("../config.js").getConfig();
const common = require("./common_handler.js");

/**
 * @async
 * @function getLogin
 * @desc Endpoint used to direct users to login, directing the user to the
 * proper GitHub OAuth Page based on the backends client id.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET 
 * @property {http_endpoint} - /api/oauth 
 * @todo Finish Implementation.
 */
async function getLogin(req, res) {
  // GET /api/oauth

  // the first point of contact to log into the app.

  // since this will be the endpoint for a user to login, we need to redirect to GH.
  // @see https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
  // need to setup callback_uri, and state.
  res
    .status(301)
    .redirect(
      `https://github.com/login/oauth/authorize?client_id=${GH_CLIENTID}`
    );
}

/**
 * @async
 * @function getOauth
 * @desc Endpoint intended to use as the actual return from GitHub to login.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET 
 * @property {http_endpoint} - ?
 * @todo Just about everything here.
 */
async function getOauth(req, res) {
  await common.notSupported(req, res);
}

module.exports = {
  getLogin,
  getOauth,
};
