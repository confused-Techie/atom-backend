/**
* @module oauth_handler
* @desc Endpoint Handlers for Authentication URLs
* @implements {config}
* @implements {common_handler}
*/

const { GH_CLIENTID } = require("../config.js").GetConfig();
const common = require("./common_handler.js");

/**
* @async
* @function GETLogin
* @desc Endpoint used to direct users to login, directing the user to the
* proper GitHub OAuth Page based on the backends client id.
* @param {object} req - The `Request` object inherited from the Express endpoint.
* @param {object} res - The `Response` object inherited from the Express endpoint.
*/
async function GETLogin(req, res) {
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
* @function GETOauth
* @desc Endpoint intended to use as the actual return from GitHub to login.
* @todo
* @param {object} req - The `Request` object inherited from the Express endpoint.
* @param {object} res - The `Response` object inherited from the Express endpoint.
*/
async function GETOauth(req, res) {
  await common.NotSupported(req, res);
}

module.exports = {
  GETLogin,
  GETOauth,
};
