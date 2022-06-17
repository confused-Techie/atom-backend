var data = require("./data.js");

/**
* @desc Checks every existing user within the users file, to see if the token provided exists within their valid
* tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
* callback passing the user object, otherwise will just return the user object.
* If no valid user is found returns null.
* @param {string} token Provided Token to check against all valid users.
* @param {function} [callback] Optional function to invoke passing the matched user.
*/
async function VerifyAuth(token, callback) {
  data.GetUsers()
    .then((users) => {

      for (var user in users) {
        if (users.hasOwnProperty(user)) {
          // ensure we are getting a proper key from the object rather than a prototype.

          // now we need to get all of the users tokens
          var usrToken = users[user].tokens;

          if (typeof usrToken != "undefined") {
            // now that we have the users tokens and we know they are defined, we can check if our token is
            // in their array
            if (usrToken.includes(token)) {
              // the token is included and must be valid, granted this means no two users can ever have the
              // same token but that seems a valid assumption.
              // VerifyAuth will then return the user name
              if (typeof callback === "function") {
                callback(users[user]);
                return;
              } else {
                return users[user];
              }
            }
          } // else we know this cant be the authenticated user since the user has no tokens.
        }
      }
      // if the users token is never found, we want to return null
      if (typeof callback === "function") {
        callback(null);
        return;
      } else {
        return null;
      }
    });
}

module.exports = { VerifyAuth };
