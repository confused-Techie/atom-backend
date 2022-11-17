/**
 * @module oauth_handler
 * @desc Endpoint Handlers for Authentication URLs
 * @implements {config}
 * @implements {common_handler}
 */

const { GH_CLIENTID } = require("../config.js").getConfig();
const common = require("./common_handler.js");
const utils = require("../utils.js");

const stateStore = new utils.StateStore();

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

  // So lets go ahead and get our state
  let state = stateStore.setState(req.ip);

  if (!state.ok) {
    await common.handleError(req, res, state);
    return;
  }

  res
    .status(301)
    .redirect(
      `https://github.com/login/oauth/authorize?client_id=${GH_CLIENTID}&redirect_uri=${GH_REDIRECTURI}&state=${state.content}`
    );
  logger.httpLog(req, res);
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
  let params = {
    state: req.params.state ?? "",
    code: req.params.code ?? "",
  };

  // First we want to ensure that our state is still the same.
  let stateCheck = stateStore.getState(req.ip, params.state);

  if (!stateCheck.ok) {
    await common.handleError(req, res, stateCheck);
    return;
  }

  // TODO - Finish this feature

  await common.notSupported(req, res);
}

module.exports = {
  getLogin,
  getOauth,
};
