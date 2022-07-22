/**
 * @module utils
 * @desc A helper for any functions that are agnostic in hanlders.
 * @implements {resources}
 * @implements {logger}
 * @implements {users}
 * @implements {common}
 */
const resources = require("./resources.js");
const logger = require("./logger.js");
const users = require("./users.js");
const common = require("./handlers/common_handler.js");

async function IsPackageNameBanned(name) {
  let names = await resources.Read("name_ban_list");

  if (!names.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.WarningLog(null, null, "Unable to locate Name Ban List");
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
 * @function LocalUserLoggedIn
 * @desc Used as a less verbose way to check if the current user token, is associated
 * with a logged in user. If not handles errors automatically, if so calls the callback
 * function passing the Server Status Object, where content is User.
 * @param {object} req -
 * @param {object} res -
 * @param {string} params_user - Usually `params.auth` or otherwise the authorization
 * token within the header field.
 * @param {function} callback - The callback to invoke only if the user is properly authenticated.
 */
async function LocalUserLoggedIn(req, res, params_user, callback) {
  let user = await users.VerifyAuth(params_user);

  if (!user.ok) {
    await common.AuthFail(req, res, user);
    return;
  }

  callback(user);
}

module.exports = {
  IsPackageNameBanned,
  LocalUserLoggedIn,
};
