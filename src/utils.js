/**
 * @module utils
 * @desc A helper for any functions that are agnostic in hanlders.
 * @implements {resources}
 * @implements {logger}
 * @implements {users}
 * @implements {common}
 * @implements {config}
 */
const resources = require("./resources.js");
const logger = require("./logger.js");
const users = require("./users.js");
const common = require("./handlers/common_handler.js");
const { cache_time } = require("./config.js").getConfig();

async function isPackageNameBanned(name) {
  let names = await resources.read("name_ban_list");

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
  let user = await users.verifyAuth(params_user);

  if (!user.ok) {
    await common.authFail(req, res, user);
    return;
  }

  callback(user);
}

/**
 * @class
 * @desc Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.
 * @param {string} [name] - Optional name to assign to the Cached Object.
 * @param {object} contents - The contents of this cached object. Intended to be a JavaScript object. But could be anything.
 */
class CacheObject {
  constructor(contents, name) {
    this.birth = Date.now();
    this.data = contents;
    this.invalidated = false;
    this.last_validate = 0;
    this.cache_time = cache_time;
    this.name = name;
  }
  get Expired() {
    return Date.now() - this.birth > this.cache_time;
  }
  invalidate() {
    this.invalidated = true;
  }
}

module.exports = {
  isPackageNameBanned,
  localUserLoggedIn,
  CacheObject,
};
