# Auth

There are two seperate levels of authentication for end users on the server, which are below as well as a short summary of our authentication strategy.

## How does Authentication work on the Pulsar Backend

Since it was found to be essential to not be saving any delicate user information on our systems, the team of Pulsar decided to offload the major responsibility of authentication to GitHub.

When a user has a valid token, one retreived from the sign up page or a self created PAT token, and the user has an account on our backend (which would contain very few details of the user account, with the `node_id` being most important) they would then only need to provide whatever this token is to the backend for authentication.

The important thing to note is that the Pulsar Backend does not store the users token, we simply use this token and provide it to GitHub asking for the details of the account the token belongs to. When we get that information back we check the returned `node_id` with the `node_id` of all the users we have stored. If there is a match, we assume that this is the user. Since the `node_id` should be consistent for a user on GitHub over the lifetime of their account, there shouldn't be any action a user can take to change this. Additionally the `node_id` is public information for a non-authenticated request to GitHub so it isn't considered sensitive information.

From there for Global Authentication, we can provide that `node_id` or the `username` of their GitHub account to find all repos they have administrative access over, to determine if they should be able to make changes to that repo/package.

### Local (Server Side)

Local Authentication, meaning that the user's provided token is valid, and the `node_id` returned from GitHub for that user does already have an account existing within the backend database.

This means the user can complete actions that have only Local Changes to our database, with no reference or permissions to the outside world.

Such as:
  * Viewing User Stars
  * Starring a Package in the Backend Database

#### Example

```javascript
const auth = require("./auth.js");
const query = require("./query.js");
const common = require("./common_handler.js");

async function methodOurEndpoint(req, res) {
  let params = {
    auth: query.auth(req)
  };

  let user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // The user is locally verified, and we can complete whatever local action
  // we want to.
}
```

### Global

Global Authentication, meaning the user has ownership or rights over a specific GitHub repository.

Such as:
  * Publishing a new Package
  * Deleting a Package
  * Publishing new Package Versions
  * Delete Packing Versions

#### Example

```javascript
const git = require("./git.js");
const auth = require("./auth.js");
const query = require("./query.js");
const common = require("./common_handler.js");

async function methodOurEndpoint(req, res) {
  let params = {
    auth: query.auth(req),
    packageName: decodeURIComponent(req.params.packageName)
  };

  let user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // Notice we have to pass the repo we are attempting to ensure ownership of.
  let gitowner = await git.ownership(user.content, params.packageName);

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner);
    return;
  }

  // The user is Globally verified, and we can complete whatever
  // request they intended.
}
```
