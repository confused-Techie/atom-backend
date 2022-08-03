/**
 * @module main
 * @desc The Main functionality for the entire server. Sets up the Express server, providing
 * all endpoints it listens on. With those endpoints being further documented in `api.md`.
 * @implements {update_handler}
 * @implements {star_handler}
 * @implements {user_handler}
 * @implements {theme_handler}
 * @implements {package_handler}
 * @implements {common_handler}
 */

const express = require("express");
const app = express();

const update_handler = require("./handlers/update_handler.js");
const star_handler = require("./handlers/star_handler.js");
const user_handler = require("./handlers/user_handler.js");
const theme_handler = require("./handlers/theme_handler.js");
const package_handler = require("./handlers/package_handler.js");
const common_handler = require("./handlers/common_handler.js");
const oauth_handler = require("./handlers/oauth_handler.js");
const server_version = require("../package.json").version;

app.use((req, res, next) => {
  // This adds a start to the request, logging the exact time a request was received.
  req.start = Date.now();
  next();
});

/**
 * @web
 * @ignore
 * @path /
 * @desc A non-essential endpoint, returning a status message, and the server version.
 * @method GET
 * @auth FALSE
 */
app.get("/", (req, res) => {
  // While originally here in case this became the endpoint to host the
  // frontend website, now that that is no longer planned, it can be used
  // as a way to check the version of the server. Not needed, but may become helpful.
  res
    .status(200)
    .json({ message: `Server is up and running Version ${server_version}` });
});

/**
 * @web
 * @ignore
 * @path /api/oauth
 * @desc OAuth Callback URL. Other details TBD.
 * @method GET
 * @auth FALSE
 */
app.get("/api/login", async (req, res) => {
  await oauth_handler.GETLogin(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/oauth
 * @desc OAuth Callback URL. Other details TDB.
 * @method GET
 * @auth FALSE
 */
app.get("/api/oauth", async (req, res) => {
  await oauth_handler.GETOauth(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages
 * @desc List all packages.
 * @method GET
 * @auth false
 * @param
 *   @name page
 *   @location query
 *   @Ptype integer
 *   @default 1
 *   @required false
 *   @Pdesc Indicate the page number to return.
 * @param
 *   @name sort
 *   @Ptype string
 *   @location query
 *   @default downloads
 *   @valid downloads, created_at, updated_at, stars
 *   @required false
 *   @Pdesc The method to sort the returned pacakges by.
 * @param
 *   @name direction
 *   @Ptype string
 *   @default desc
 *   @valid desc, asc
 *   @required false
 *   @Pdesc Which direction to list the results. If sorting by stars, can only be sorted by desc.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Returns a list of all packages. Paginated 30 at a time. Links to the next and last pages are in the 'Link' Header.
 */
app.get("/api/packages", async (req, res) => {
  await package_handler.GETPackages(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages
 * @desc Publishes a new Package.
 * @method POST
 * @auth true
 * @param
 *   @name repository
 *   @Ptype string
 *   @location query
 *   @required true
 *   @Pdesc The repository containing the plugin, in the form 'owner/repo'.
 * @param
 *   @name Authentication
 *   @Ptype string
 *   @location header
 *   @required true
 *   @Pdesc A valid Atom.io token, in the 'Authorization' Header.
 * @response
 *   @status 201
 *   @Rtype application/json
 *   @Rdesc Successfully created, return created package.
 * @response
 *   @status 400
 *   @Rtype application/json
 *   @Rdesc Repository is inaccessible, nonexistant, not an atom package. Could be different errors returned.
 *   @Rexample { "message": "That repo does not exist, ins't an atom package, or atombot does not have access." }, { "message": "The package.json at owner/repo isn't valid." }
 * @response
 *   @status 409
 *   @Rtype application/json
 *   @Rdesc A package by that name already exists.
 */
app.post("/api/packages", async (req, res) => {
  await package_handler.POSTPackages(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/featured
 * @desc Previously Undocumented endpoint. Used to return featured packages from all existing packages.
 * @method GET
 * @auth false
 * @response
 *   @status 200
 *   @Rdesc An array of packages similar to /api/packages endpoint.
 */
app.get("/api/packages/featured", async (req, res) => {
  await package_handler.GETPackagesFeatured(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/search
 * @desc Searches all Packages.
 * @method GET
 * @auth false
 * @param
 *   @name q
 *   @Ptype string
 *   @required true
 *   @location query
 *   @Pdesc Search query.
 * @param
 *   @name page
 *   @Ptype integer
 *   @required false
 *   @location query
 *   @Pdesc The page of search results to return.
 * @param
 *   @name sort
 *   @Ptype string
 *   @required false
 *   @valid downloads, created_at, updated_at, stars
 *   @default relevance
 *   @location query
 *   @Pdesc Method to sort the results.
 * @param
 *   @name direction
 *   @Ptype string
 *   @required false
 *   @valid asc, desc
 *   @default desc
 *   @location query
 *   @Pdesc Direction to list search results.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Same format as listing packages, additionally paginated at 30 items.
 */
app.get("/api/packages/search", async (req, res) => {
  await package_handler.GETPackagesSearch(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName
 * @desc Show package details.
 * @method GET
 * @auth false
 * @param
 *   @name packageName
 *   @location path
 *   @Ptype string
 *   @Pdesc The name of the package to return details for. URL escaped.
 *   @required true
 * @param
 *   @name engine
 *   @location query
 *   @Ptype string
 *   @Pdesc Only show packages compatible with this Atom version. Must be valid SemVer.
 *   @required false
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Returns package details and versions for a single package.
 */
app.get("/api/packages/:packageName", async (req, res) => {
  await package_handler.GETPackagesDetails(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName
 * @method DELETE
 * @auth true
 * @desc Delete a package.
 * @param
 *   @name packageName
 *   @location path
 *   @Ptype string
 *   @Pdesc The name of the package to delete.
 *   @required true
 * @param
 *   @name Authorization
 *   @location header
 *   @Ptype string
 *   @Pdesc A valid Atom.io token, in the 'Authorization' Header.
 *   @required true
 * @response
 *   @status 204
 *   @Rtype application/json
 *   @Rdesc Successfully deleted package.
 *   @Rexample { "message": "Success" }
 * @response
 *   @status 400
 *   @Rtype application/json
 *   @Rdesc Repository is inaccessible.
 *   @Rexample { "message": "Respository is inaccessible." }
 * @response
 *   @status 401
 *   @Rtype application/json
 *   @Rdesc Unauthorized.
 */
app.remove("/api/packages/:packageName", async (req, res) => {
  await package_handler.DELETEPackagesName(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/star
 * @method POST
 * @auth true
 * @desc Star a packge.
 * @param
 *    @name packageName
 *    @location path
 *    @Ptype string
 *    @Pdesc The name of the package to star.
 *    @required true
 * @param
 *    @name Authorization
 *    @location header
 *    @Ptype string
 *    @Pdesc A valid Atom.io token, in the 'Authorization' Header
 *    @required true
 * @response
 *    @status 200
 *    @Rtype application/json
 *    @Rdesc Returns the package that was stared.
 */
app.post("/api/packages/:packageName/star", async (req, res) => {
  await package_handler.POSTPackagesStar(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/star
 * @method DELETE
 * @auth true
 * @desc Unstar a package, requires authentication.
 * @param
 *  @location header
 *  @Ptype string
 *  @name Authentication
 *  @required true
 *  @Pdesc Atom Token, in the Header Authentication Item
 * @param
 *  @location path
 *  @Ptype string
 *  @name packageName
 *  @required true
 *  @Pdesc The package name to unstar.
 * @response
 *  @status 201
 *  @Rdesc An empty response to convey successfully unstaring a package.
 */
app.remove("/api/packages/:packageName/star", async (req, res) => {
  await package_handler.DELETEPackagesStar(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/stargazers
 * @method GET
 * @desc List the users that have starred a package.
 * @param
 *  @location path
 *  @required true
 *  @name packageName
 *  @Pdesc The package name to check for users stars.
 * @response
 *  @status 200
 *  @Rdesc A list of user Objects.
 *  @Rexample [ { "login": "aperson" }, { "login": "anotherperson" } ]
 */
app.get("/api/packages/:packageName/stargazers", async (req, res) => {
  await package_handler.GETPackagesStargazers(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions
 * @auth true
 * @method POST
 * @desc Creates a new package version from a git tag. If `rename` is not `true`, the `name` field in `package.json` _must_ match the current package name.
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The Package to modify.
 * @param
 *  @location query
 *  @name rename
 *  @required false
 *  @Pdesc Boolean indicating whether this version contains a new name for the package.
 * @param
 *  @location query
 *  @name tag
 *  @required true
 *  @Pdesc A git tag for the version you'd like to create. It's important to note that the version name will not be taken from the tag, but from the `version` key in the `package.json` file at that ref.
 * @param
 *  @location header
 *  @name auth
 *  @required true
 *  @Pdesc A valid Atom.io API token, to authenticate with Github.
 * @response
 *  @status 201
 *  @Rdesc Successfully created. Returns created version.
 * @response
 *  @status 400
 *  @Rdesc Git tag not found / Repository inaccessible / package.json invalid.
 * @response
 *  @status 409
 *  @Rdesc Version exists.
 */
app.post("/api/packages/:packageName/versions", async (req, res) => {
  await package_handler.POSTPackagesVersion(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName
 * @method GET
 * @auth false
 * @desc Returns `package.json` with `dist` key added for tarball download.
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The package name we want to access
 * @param
 *  @location path
 *  @name versionName
 *  @required true
 *  @Pdesc The Version we want to access.
 * @response
 *  @status 200
 *  @Rdesc The `package.json` modified as explainged in the endpoint description.
 */
app.get(
  "/api/packages/:packageName/versions/:versionName",
  async (req, res) => {
    await package_handler.GETPackagesVersion(req, res);
  }
);

// Previously undocumented endpoint discovered during developement.
// Seems this endpoint allows for download of packages. Further testing is required.
// Confirmed that this is a GET only endpoint.
/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName/tarball
 * @method GET
 * @auth false
 * @desc Previously undocumented endpoint. Seems to allow for installation of a package. This is not currently implemented.
 * @param
 *   @location path
 *   @name packageName
 *   @required true
 *   @Pdesc The package we want to download.
 * @param
 *   @location path
 *   @name versionName
 *   @required true
 *   @Pdesc The package version we want to download.
 * @response
 *   @status 200
 *   @Rdesc The tarball data for the user to then be able to install.
 */
app.get(
  "/api/packages/:packageName/versions/:versionName/tarball",
  async (req, res) => {
    await package_handler.GETPackagesVersionTarball(req, res);
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName
 * @method DELETE
 * @auth true
 * @desc Deletes a package version. Note once a version is deleted, that same version should not be reused again.
 * @param
 *  @location header
 *  @name Authentication
 *  @required true
 *  @Pdesc The Authentication header containing a valid Atom Token
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The package name to check for the version to delete.
 * @param
 *  @location path
 *  @name versionName
 *  @required true
 *  @Pdesc The Package Version to actually delete.
 * @response
 *  @status 204
 *  @Rdesc Indicates a successful deletion.
 */
app.remove(
  "/api/packages/:packageName/versions/:versionName",
  async (req, res) => {
    await package_handler.DELETEPackageVersion(req, res);
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName/events/uninstall
 * @desc Previously undocumented endpoint. BETA: Decreases the packages download count, by one. Indicating an uninstall.
 * @method POST
 * @auth true
 * @param
 *   @name packageName
 *   @location path
 *   @required true
 *   @Pdesc The name of the packge to modify.
 * @param
 *   @name versionName
 *   @location path
 *   @required true
 *   @Pdesc This value is within the original spec. But has no use in its current implementation.
 * @param
 *   @name auth
 *   @location header
 *   @required true
 *   @Pdesc Valid Atom.io token.
 * @response
 *   @status 200
 *   @Rdesc Returns JSON ok: true
 */
app.post(
  "/api/packages/:packageName/versions/:versionName/events/uninstall",
  async (req, res) => {
    await package_handler.POSTPackagesEventUninstall(req, res);
  }
);

/**
 * @web
 * @ignore
 * @path /api/themes/featured
 * @desc Previously undocumented endpoint. BETA: Returns 'Featured' Themes from all available themes.
 * @method GET
 * @auth false
 * @response
 *   @status 200
 *   @Rdesc Returns an array of Theme Packages. Similar to the /api/packages Endpoint.
 */
app.get("/api/themes/featured", async (req, res) => {
  await theme_handler.GETThemeFeatured(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/users/:login/stars
 * @method GET
 * @auth false
 * @desc List a user's starred packages.
 * @param
 *   @name login
 *   @Ptype string
 *   @required true
 *   @Pdesc The username of who to list their stars.
 * @response
 *   @status 200
 *   @Rdesc Return value is similar to GET /api/packages
 * @response
 *  @status 404
 *  @Rdesc If the login does not exist, a 404 is returned.
 */
app.get("/api/users/:login/stars", async (req, res) => {
  await user_handler.GETLoginStars(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/stars
 * @method GET
 * @desc List the authenticated user's starred packages.
 * @auth true
 * @param
 *   @name auth
 *   @location header
 *   @Ptype string
 *   @required true
 *   @Pdesc Authorization Header of valid Atom.io Token.
 * @response
 *   @status 200
 *   @Rdesc Return value similar to GET /api/packages, an array of package objects.
 *   @Rtype application/json
 */
app.get("/api/stars", async (req, res) => {
  await star_handler.GETStars(req, res);
});

/**
 * @web
 * @ignore
 * @path /api/updates
 * @method GET
 * @desc List Atom Updates.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Atom update feed, following the format expected by Squirrel.
 */
app.get("/api/updates", async (req, res) => {
  await update_handler.GETUpdates(req, res);
});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  common_handler.siteWideNotFound(req, res);
});

module.exports = app;
