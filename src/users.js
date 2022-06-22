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
      var usrToken = users.content[user].atom_token;

      if (typeof usrToken != "undefined") {
        if (usrToken == token) {
          return { ok: true, content: users.content[user] };
        }
      }
    }
    return { ok: false, content: "No valid token found.", short: "Bad Auth" };
  } else {
    return users;
  }
}

async function GetUser(username) {
  const users = await data.GetUsers();
  if (users.ok) {
    if (users.content[username]) {
      // user has been found, and we have a user object available.
      return { ok: true, content: users.content[username] };
    } else {
      // user isn't found.
      return { ok: false, content: "Not Found", short: "Not Found" };
    }
  } else {
    return users;
  }
}

async function AddUserStar(packageName, userName) {
  // this lets us add the packageName to the users list of stars.
  var user = await GetUser(userName);

  if (user.ok) {
    // with the user, lets add the package
    user.content.stars.push(packageName);
    // then write the user data.
    var write = data.SetUsers(user.content);

    if (write.ok) {
      return { ok: true };
    } else {
      // unsuccessful write
      return write;
    }
  } else {
    return user;
  }
}

async function RemoveUserStar(packageName, userName) {
  var user = await GetUser(userName);

  if (user.ok) {
    // find the index of the star in the users stars array
    var starIdx = -1;
    for (var i = 0; i < user.content.stars.length; i++) {
      if (user.content.stars[i] == packageName) {
        starIdx = i;
        break;
      }
    }
    if (starIdx != -1) {
      // now to remove
      user.content.stars.splice(starIdx, 1);

      // then to write the new user data
      var write = data.SetUsers(user.content);

      if (write.ok) {
        return { ok: true };
      } else {
        // failed to write
        return write;
      }
    } else {
      // failed to find the star in the user star array
      return { ok: false, content: "Not Found", short: "Not Found" };
    }
  } else {
    return user;
  }
}

async function Prune(userObj) {
  // WARNING!! : Here I will use the delete operator on the object to prune data, not suitable to the end user.
  // Based on my current research delete only deletes the objects reference to the value, not the value itself.
  // Meaning delete can be used on the shallow copy of data without affecting the original copy. This will need to be tested.

  // But as research and clarification goes on, there may never be an endpoint that returns full user objects, and this may be useless.

  // Remove User Atom Token
  delete userObj.atom_token;
  // Remove User Github Token
  delete userObj.github_token;
  // Remove User created at time
  delete userObj.created_at;

  // Return the object.
  return userObj;
}

module.exports = {
  VerifyAuth,
  GetUser,
  Prune,
  AddUserStar,
  RemoveUserStar,
};
