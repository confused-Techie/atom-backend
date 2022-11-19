/**
 * @module oauth_handler
 * @desc Endpoint Handlers for Authentication URLs
 * @implements {config}
 * @implements {common_handler}
 */

const { GH_CLIENTID, GH_REDIRECTURI, GH_CLIENTSECRET, GH_USERAGENT } =
  require("../config.js").getConfig();
const common = require("./common_handler.js");
const utils = require("../utils.js");
const logger = require("../logger.js");
const superagent = require("superagent");
const database = require("../database.js");

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
  // Please note that because of the usage of the crypto module, this is one of the only functions that
  // return a promise

  stateStore
    .setState(req.ip)
    .then((state) => {
      console.log(state);
      res
        .status(301)
        .redirect(
          `https://github.com/login/oauth/authorize?client_id=${GH_CLIENTID}&redirect_uri=${GH_REDIRECTURI}&state=${state.content}`
        );
      logger.httpLog(req, res);
    })
    .catch((err) => {
      common.handleError(req, res, err);
    });
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
    state: req.query.state ?? "",
    code: req.query.code ?? "",
  };

  // First we want to ensure that our state is still the same.
  let stateCheck = stateStore.getState(req.ip, params.state);

  if (!stateCheck.ok) {
    await common.handleError(req, res, stateCheck);
    return;
  }

  const initial_auth = await superagent
    .post(`https://github.com/login/oauth/access_token`)
    .query({
      code: params.code,
      redirect_uri: GH_REDIRECTURI,
      client_id: GH_CLIENTID,
      client_secret: GH_CLIENTSECRET,
    });

  if (
    initial_auth.body.access_token === null ||
    initial_auth.body.token_type === null
  ) {
    await common.handleError(req, res, {
      ok: false,
      short: "Server Error",
      content: initial_auth,
    });
    return;
  }

  try {
    const user_data = await superagent
      .get("https://api.github.com/user")
      .set({ Authorization: `Bearer ${initial_auth.body.access_token}` })
      .set({ "User-Agent": GH_USERAGENT });

    if (user_data.status !== 200) {
      await common.handleError(req, res, {
        ok: false,
        short: "Server Error",
        content: user_data,
      });
      return;
    }

    // now to get a hashed form of their token.
    let access_token = initial_auth.body.access_token;

    // Now we have a valid user object, and other data from authentication that we want to put into the DB.
    let userObj = {
      username: user_data.body.login,
      node_id: user_data.body.node_id,
      avatar: user_data.body.avatar_url,
    };

    let check_user_existance = await database.getUserByNodeID(userObj.node_id);

    if (check_user_existance.ok) {
      // This means that the user does in fact already exist.
      // And from there they are likely reauthenticating,
      // But since we don't save any type of auth tokens, the user just needs a new one
      // and we should return their new one to them.

      // before returning lets append their proper access token to the object.
      userObj.token = access_token;

      res.status(200).json(userObj);
      logger.httpLog(req, res);
      return;
    }

    let create_user = await database.insertNewUser(userObj);

    if (!create_user.ok) {
      await common.handleError(req, res, create_user);
      return;
    }

    // TODO: For now we will just return the user data as JSON.
    // In the future this should redirect to `package-frontend` passing the user token as a query param.
    // Once passed package-frontend should save it to the browser, logging the user in.
    // And should be redirected to a user page, where they can view their user details.

    // Before returning, lets append their access token
    create_user.content.token = access_token;
    res.status(200).json(create_user.content);
    logger.httpLog(req, res);
  } catch (err) {
    await common.handleError(req, res, err);
    return;
  }
}

module.exports = {
  getLogin,
  getOauth,
};
