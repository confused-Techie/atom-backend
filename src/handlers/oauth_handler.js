const { GH_CLIENTID } = require("../config.js").GetConfig();
async function GETLogin(req, res) {
  // GET /api/oauth

  // the first point of contact to log into the app.

  // since this will be the endpoint for a user to login, we need to redirect to GH.
  // @see https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
  res
    .status(301)
    .redirect(
      `https://github.com/login/oauth/authorize?client_id=${GH_CLIENTID}`
    );
}

async function GETOauth(req, res) {}

module.exports = {
  GETLogin,
  GETOauth,
};
