var data = require("./data.js");

/**
 * @desc Checks every existing user within the users file, to see if the token provided exists within their valid
 * tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
 * callback passing the user object, otherwise will just return the user object.
 * If no valid user is found returns null.
 * @param {string} token Provided Token to check against all valid users.
 * @param {function} [callback] Optional function to invoke passing the matched user.
 */
async function VerifyAuth(token) {
  const users = await data.GetUsers();
  if (users.ok) {
    for (const user in users.content) {
      var usrToken = users.content[user].tokens;

      if (typeof usrToken != "undefined") {
        if (usrToken.includes(token)) {
          return { ok: true, content: users.content[user] };
        }
      }
    }
    return { ok: false, content: "No valid token found.", short: "Bad Auth" };
  } else {
    return users;
  }
}

module.exports = {
  VerifyAuth,
};
