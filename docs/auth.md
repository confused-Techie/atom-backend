# Auth

There are two levels of access when making requests to the server.

## Server Only

Server Only Auth, relates to actions that only affect the server side data, with no reference outside.

Such as:
  * User Stars

### Example

```javascript
let user = await users.VerifyAuth(params.auth);
if (user.ok) {
  // preform action
} else {
  if (user.short == "Bad Auth") {
    error.MissingAuthJSON(res);
    logger.HTTPLog(req, res);
  } else {
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
    logger.ErrorLog(req, res, user.content);
  }
}
```

## Packages

Package Auth, relates to actions that have an affect on the packages, or depend on ownership for the GitHub repo.

Such as:
  * Publishing a new Package
  * Deleting a Package
  * Publishing new Package Versions
  * Delete Packing Versions

### Example

```javascript
let user = await users.VerifyAuth(params.auth);
if (user.ok) {
  let gitowner = await git.Ownership(user.content, repository);

  if (gitowner.ok) {
    // they own the repo they are referencing, and are a varified user.
  } else {
    // they do not own the repo, but do have a valid login.
  }
} else {
  if (user.short == "Bad Auth") {
    error.MissingAuthJSON(res);
    logger.HTTPLog(req, res);
  } else {
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
    logger.ErrorLog(req, res, user.content);
  }
}
```
