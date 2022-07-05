/**
 * @module git
 * @desc Assists in interactions between the backend and GitHub.
 */

/**
 * @async
 * @function VerifyAuth
 * @desc This <b>Unfinished</b> function is intended to return true or false,
 * if the provided token owns the provided repo. Th rest of the documentation will
 * wait until this function is completed. Apon further inspection it seems this function
 * is not actually implemented, or intended to be implemented anywhere, and possibly should be removed.
 */
async function VerifyAuth(token, repo) {
  // until this is properly implemented, lets return true;
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

/**
 * @async
 * @function Ownership
 * @desc This <b>Unfinished</b> function is intended to return a Server Status Object.
 * Proving ownership over a GitHub repo. Which is used to determine if the user
 * is allowed to make changes to its corresponding package. Should return true
 * in the Server Status Object if ownership is valid. But until it is written, will
 * not be fully documented.
 */
async function Ownership(user, repo) {
  // user here is a full fledged user object. And repo is a text representation of the repository.
  // Since git auth is not setup, this will return positive.
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

/**
 * @async
 * @function CreatePackage
 * @desc This <b>Unfinished</b> function is intended to create a compatible package object
 * to be used directly as a `Server Package Object`. Meaning it will need to create
 * all properties, and fill all keys. Until this is completed, the documentation will
 * also be uncompleted.
 */
async function CreatePackage(repo) {
  // TODO: ALL OF IT
  // This is expected to generate the internal package metadata, to be directly used as the Server Package Object.
  return { ok: false };
}

module.exports = {
  VerifyAuth,
  Ownership,
  CreatePackage,
};
