// Here will be for the interactions between the backend and github.

async function VerifyAuth(token, repo) {
  // until this is properly implemented, lets return true;
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

async function Ownership(user, repo) {
  // user here is a full fledged user object. And repo is a text representation of the repository.
  // Since git auth is not setup, this will return positive.
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

module.exports = {
  VerifyAuth,
  Ownership,
};
