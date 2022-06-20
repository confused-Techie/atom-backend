const express = require("express");
const app = express();

var query = require("./query.js");
var error = require("./error.js");
var users = require("./users.js");
var data = require("./data.js");
var collection = require("./collection.js");
var logger = require("./logger.js");

// this will in time use a YAML config file to retreive details, since if the Hosting ends up in Google Cloud, thats were it stores variables.
// This method will allow us to detect local testing environments vs production environments by seeing if Google Cloud Run has entered our YAML variables into ENV variables.
// Otherwise we can read the yaml file manually and know its a local enviroment.
// TODO proper env variables.
const port = 8080;

app.use((req, res, next) => {
  // This adds a start to the request, logging the exact time a request was received.
  req.start = Date.now();
  next();
});

app.get('/', (req, res) => {
  // this is to display the ability to use this as the normal web page handler as well.
  // TODO: remove this, or modify as needed.
  res.send("Hello World");
});

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
app.get("/api/packages", async (req, res) => {
  var params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
  };

  var all_packages = await data.GetAllPackages();

  if (all_packages.ok) {
    // Now we have all_packages.content which is an array of every package
    // we will then need to organize this list, according to our params.
    // additionally remove any fields that are not natively shown to the end user.
    // And finally we would need to modify our headers, to include links for current, next, and last.
    // TODO: Link Headers
    var packages = await collection.Sort(all_packages.content, params.sort);
    var packages = await collection.Direction(packages, params.direction);
    var packages = await collection.Prune(packages);
    // One note of concern with chaining all of these together, is that this will potentially loop
    // through the entire array of packages 3 times, resulting in a
    // linear time complexity of O(3). But testing will have to determine how much that is a factor of concern.
    res.status(200).json(packages);
    logger.HTTPLog(req, res);
  } else {
    console.log(all_packages.content);
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
  }
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
app.post("/api/packages", async (req, res) => {
  var params = {
    repository: query.repo(req),
    auth: req.get('Authorization'),
  };
  var user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // TODO: UnsupportedJSON
    error.UnsupportedJSON(res);
    logger.HTTPLog(req, res);
  } else {
    if (user.short == "Bad Auth") {
      error.MissingAuthJSON(res);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
    }
  }
});

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
  // TODO: All of it.

});

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
app.get("/api/packages/:packageName", async (req, res) => {
  var params = {
    engine: query.engine(req),
    name: req.params.packageName,
  };
  const package = await data.GetPackageByName(params.name);

  if (package.ok) {
    // from here we now have the package and just want to prune data from it
    var pack = collection.Prune(package.content);
    // TODO: filter by atom engine version.
    res.status(200).json(pack);
    logger.HTTPLog(req, res);
  } else {
    if (package.short == "Not Found") {
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    } else if (package.short == "Server Error") {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
    }
  }
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
  // TODO: all of it.
});

// Package Star Slug Endpoints
/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#starring-a-package
*/
app.post("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };
  // TODO: all of it.
});

/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#delete-apipackagesnamestar
*/
app.delete("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };
  // TODO: all of it.
});

// Package Stargazers Slug Endpoints
/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#listing-a-packages-stargazers
*/
app.get("/api/packages/:packageName/stargazers", async (req, res) => {
  var params = {
    packageName: req.params.packageName,
  };
  var package = await data.GetPackageByName(params.packageName);

  if (package.ok) {
    // then we can just directly return the star_gazers object.
    res.status(200).json(package.content.star_gazers);
    logger.HTTPLog(req, res);
  } else {
    if (package.short == "Not Found") {
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
    }
  }
});

// Package New Version Endpoint
/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#post-apipackagespackage_nameversions
*/
app.post("/api/packages/:packageName/versions", (req, res) => {
  var params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get('Authorization'),
  };
  // TODO: all of it.
});

// Package Versions Endpoint
/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#get-apipackagespackage_nameversionsversion_name
*/
app.get("/api/packages/:packageName/versions/:versionName", (req, res) => {
  // TODO: all of it.
});

/**
* https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#delete-apipackagespackage_nameversionsversion_name
*/
app.delete("/api/packages/:packageName/versions/:versionName", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };
  // TODO: all of it.
});

/**
* @web
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
*/
app.get("/api/users/:login/stars", (req, res) => {
  // TODO: all of it.
});

/**
* @web
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
  var params = {
    auth: req.get('Authorization'),
  };
  var user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    var packageCollection = await data.GetPackageCollection(user.content.stars);
    if (packageCollection.ok) {
      res.status(200).json(packageCollection.content);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
    }
  } else {
    if (user.short == "Bad Auth") {
      error.MissingAuthJSON(res);
      logger.HTTPLog(res, req);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(res, req);
    }
  }
});

/**
* @web
* @path /api/updates
* @method GET
* @desc List Atom Updates.
* @response
*   @status 200
*   @Rtype application/json
*   @Rdesc Atom update feed, following the format expected by Squirrel.
*/
app.get("/api/updates", (req, res) => {
  // TODO: all of it.
});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  error.SiteWide404(res);
  logger.HTTPLog(res, req);
});

app.listen(port, () => {
  console.log(`Atom Server Listening on port ${port}`);
});
