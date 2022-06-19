const express = require("express");
const app = express();

var query = require("./query.js");
var error = require("./error.js");
var users = require("./users.js");

// this will in time use a YAML config file to retreive details, since if the Hosting ends up in Google Cloud, thats were it stores variables.
// This method will allow us to detect local testing environments vs production environments by seeing if Google Cloud Run has entered our YAML variables into ENV variables.
// Otherwise we can read the yaml file manually and know its a local enviroment.
const port = 8080;

app.use((req, res, next) => {
  // Middleware that can be used for logging the requests.
  console.log(`Time: ${Date.now()}`);
  next();
});

/**
* @swagger
* /:
*   get:
*     description: Test Root Request.
*/
app.get('/', (req, res) => {
  // this is to display the ability to use this as the normal web page handler as well.
  res.send("Hello World");
});

// Package Slug Endpoints
/**
* @web
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
app.get("/api/packages", (req, res) => {
  var params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
  };

});

/**
* @web
* @path /api/packages
* @desc Publishes a new Package.
* @todo With auth not setup, nor atombot setup, this is non-functional.
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
*   @Rexample { "message": "That repo does not exist, ins't an atom package, or atombot does not have access." }, { "message": "The packagge.json at owner/repo isn't valid." }
* @response
*   @status 409
*   @Rtype application/json
*   @Rdesc A package by that name already exists.
*/
app.post("/api/packages", (req, res) => {
  // possible error messages for response 400 include:
  // - That repo does not exist, ins't an atom package, or atombot does not have access.
  // - The package.json at owner/repo isn't valid.
  var params = {
    repository: query.repo(req),
    auth: req.get('Authorization'),
  };

  error.UnsupportedJSON(res);
});

// Searching Endpoints
/**
* @web
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
*   @Rdesc Same format as listing packages.
*/
app.get("/api/packages/search", (req, res) => {
  var params = {
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

});

// Package Name Slug Endpoints
/**
* @web
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
app.get("/api/packages/:packageName", (req, res) => {
  var params = {
    engine: query.engine(req),
  };

});

/**
* @web
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
app.delete("/api/packages/:packageName", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Package Star Slug Endpoints
app.post("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

app.delete("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Package Stargazers Slug Endpoints
app.get("/api/packages/:packageName/stargazers", (req, res) => {

});

// Package New Version Endpoint
app.post("/api/packages/:packageName/versions", (req, res) => {
  var params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get('Authorization'),
  };

});

// Package Versions Endpoint
app.get("/api/packages/:packageName/versions/:versionName", (req, res) => {

});

app.delete("/api/packages/:packageName/versions/:versionName", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Get Any User's Starred Packages
app.get("/api/users/:login/stars", (req, res) => {

});

// List Authenticated User's Starred Packages
app.get("/api/stars", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

  users.VerifyAuth(params.auth, (user) => {
    console.log(user);
    console.log(params);
  });

});

// Listing Atom-Community Updates
app.get("/api/updates", (req, res) => {

});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  error.SiteWide404(res);
});

app.listen(port, () => {
  console.log(`Atom Server Listening on port ${port}`);
});
