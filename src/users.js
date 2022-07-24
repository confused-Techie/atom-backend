/**
 * @module users
 * @desc Focused on interacting with User Data only. Provides functions required
 * to modify, or compile user data specifically.
 * @implements {data}
 */

const data = require("./data.js");

/**
 * @function VerifyAuth
 * @desc Checks every existing user within the users file, to see if the token provided exists within their valid
 * tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
 * callback passing the user object, otherwise will just return the user object.
 * If no valid user is found returns null.
 * @param {string} token Provided Token to check against all valid users.
 * @param {function} [callback] Optional function to invoke passing the matched user.
 * @implements {GetUsers}
 * @returns {object} Error Object bubbled from GetUsers, Error Object of 'Bad Auth', Object containing the User Object.
 */
async function VerifyAuth(token) {
  const users = await data.GetUsers();

  if (!users.ok) {
    return users;
  }

  for (const user in users.content) {
    const usrToken = users.content[user].atom_token;

    if (usrToken !== undefined && usrToken == token) {
      return { ok: true, content: users.content[user] };
    }
  }

  return { ok: false, content: "No valid token found.", short: "Bad Auth" };
}

/**
 * @function GetUser
 * @desc Searches for a user within the user file, and if found will return the standard object
 * containing the full User Object. Otherwise an error.
 * @implements {GetUsers}
 * @param {string} username The UserName we want to search for.
 * @returns {object} An error object bubbled up from GetUsers, Error Object of 'Not Found',
 * Object containing full User Object.
 */
async function GetUser(username) {
  const users = await data.GetUsers();

  if (!users.ok) {
    return users;
  }

  if (users.content[username]) {
    // user has been found, and we have a user object available.
    return { ok: true, content: users.content[username] };
  } else {
    // user isn't found.
    return { ok: false, content: "Not Found", short: "Not Found" };
  }
}

/**
 * @function AddUserStar
 * @desc Adds the desired Package to the list of packages the User has starred.
 * @implements {GetUser}
 * @implements {GetUsers}
 * @impmplements {SetUsers}
 * @param {string} packageName The Name of the Package we want to add to the users star list.
 * @param {string} userName The user we want to make this modification to.
 * @returns {object} Error Object Bubbled from GetUser, Error Object Bubbled from GetUsers,
 * Error Object Bubbled from SetUsers, Short Object of 'ok' if successful.
 */
async function AddUserStar(packageName, userName) {
  // this lets us add the packageName to the users list of stars.
  let user = await GetUser(userName);

  if (!user.ok) {
    return user;
  }

  // with the user, lets add the package
  user.content.stars.push(packageName);
  // then write the user data.

  // A bug discovered is this writes the user data singular object, not the entire user file object.
  let users = await data.GetUsers();

  if (!users.ok) {
    //unable to read file
    return users;
  }

  users.content[userName] = user.content;

  // now with the new user object assigned as the key to the user file, we can save.
  const write = data.SetUsers(users.content);

  return write.ok ? { ok: true } : write;
}

/**
 * @function RemoveUserStar
 * @desc Removes the specified Package from the Users list of stars.
 * @implements {GetUser}
 * @implements {GetUsers}
 * @implements {SetUsers}
 * @param {string} packageName The Name of the package we want to remove from the users star list.
 * @param {string} userName The User we want to make these changes to.
 * @returns {object} Error Object Bubbled from GetUser, ErrorObject Bubbled from GetUsers,
 * Error Object Bubbled from SetUsers, Error Object of 'Not Found', Short Object of successful write ok.
 */
async function RemoveUserStar(packageName, userName) {
  let user = await GetUser(userName);

  if (!user.ok) {
    return user;
  }

  // find the index of the star in the users stars array
  let starIdx = -1;
  for (let i = 0; i < user.content.stars.length; i++) {
    if (user.content.stars[i] === packageName) {
      starIdx = i;
      break;
    }
  }

  if (starIdx === -1) {
    // failed to find the star in the user star array
    return { ok: false, content: "Not Found", short: "Not Found" };
  }

  // now to remove
  user.content.stars.splice(starIdx, 1);

  // then to write the new user data
  // Same bug as AddUserStar
  let users = await data.GetUsers();

  if (!users.ok) {
    return users;
  }

  users.content[userName] = user.content;
  const write = data.SetUsers(users.content);

  return write.ok ? { ok: true } : write;
}

/**
 * @function Prune
 * @desc Takes a single User Object, and prunes any server side only data from the object to return to the user.
 * This pruned item should never be written back to disk, as removed the data from it removes any pointers to those values.
 * @param {object} userObj The object of which to preform the pruning on.
 * @returns {object} The Pruned userObj.
 */
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
