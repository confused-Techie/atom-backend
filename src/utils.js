/**
 * @module utils
 * @desc A helper for any functions that are agnostic in hanlders.
 */
const logger = require("./logger.js");
const common = require("./handlers/common_handler.js");
const database = require("./database.js");
const storage = require("./storage.js");

async function isPackageNameBanned(name) {
  let names = await storage.getBanList();

  if (!names.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.warningLog(null, null, "Unable to locate Name Ban List");
    return { ok: true };
  }

  for (let i = 0; i < names.content.length; i++) {
    if (name === names.content[i]) {
      // it was found on a ban list.
      return { ok: false };
    }
  }

  // name wasn't found on any ban lists.
  return { ok: true };
}

/**
 * @async
 * @function localUserLoggedIn
 * @desc Used as a less verbose way to check if the current user token, is associated
 * with a logged in user. If not handles errors automatically, if so calls the callback
 * function passing the Server Status Object, where content is User.
 * @param {object} req -
 * @param {object} res -
 * @param {string} params_user - Usually `params.auth` or otherwise the authorization
 * token within the header field.
 * @param {function} callback - The callback to invoke only if the user is properly authenticated.
 */
async function localUserLoggedIn(req, res, params_user, callback) {
  let user = await database.verifyAuth(params_user);

  if (!user.ok) {
    await common.authFail(req, res, user);
    return;
  }

  callback(user);
}

module.exports = {
  isPackageNameBanned,
  localUserLoggedIn,
};
