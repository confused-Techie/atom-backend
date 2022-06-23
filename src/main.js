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
const server_url = "http://localhost";
const paginated_amount = 30;

app.use((req, res, next) => {
  // This adds a start to the request, logging the exact time a request was received.
  req.start = Date.now();
  next();
});

app.get("/", (req, res) => {
  // this is to display the ability to use this as the normal web page handler as well.
  // TODO: remove this, or modify as needed.
  res.send("Hello World");
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
    var packages = await collection.Sort(all_packages.content, params.sort);
    packages = await collection.Direction(packages, params.direction);
    packages = await collection.Prune(packages);
    // One note of concern with chaining all of these together, is that this will potentially loop
    // through the entire array of packages 3 times, resulting in a
    // linear time complexity of O(3). But testing will have to determine how much that is a factor of concern.
    var total_pages = Math.ceil(packages.length/paginated_amount);
    res.append('Link', `<${server_url}/api/packages?page=${params.page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/packages?page=${total_pages}&sort=${params.sort}&order=${params.direction}>; rel="last", <${server_url}/api/packages?page=${params.page++}&sort=${params.sort}&order=${params.direction}>; rel="next"`);

    res.status(200).json(packages);
    logger.HTTPLog(req, res);
  } else {
    error.ServerErrorJSON(res);
    logger.HTTPLog(req, res);
    logger.ErrorLog(req, res, all_packages.content);
  }
});

/**
 * @web
 * @ignore
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
    auth: req.get("Authorization"),
  };
  var user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // TODO: Stopped: Github auth
    error.UnsupportedJSON(res);
    logger.HTTPLog(req, res);
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
 *   @Rdesc Same format as listing packages.
 */
app.get("/api/packages/search", async (req, res) => {
  var params = {
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };
  // TODO: Stopper: Search
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
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
  var params = {
    engine: query.engine(req),
    name: req.params.packageName,
  };
  const pack = await data.GetPackageByName(params.name);

  if (pack.ok) {
    // from here we now have the package and just want to prune data from it
    pack = await collection.Prune(pack.content);
    pack = await collection.EngineFilter(pack);
    res.status(200).json(pack);
    logger.HTTPLog(req, res);
  } else {
    if (pack.short == "Not Found") {
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    } else if (pack.short == "Server Error") {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, pack.content);
    }
  }
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
app.delete("/api/packages/:packageName", async (req, res) => {
  var params = {
    auth: req.get("Authorization"),
    packageName: req.params.packageName,
  };
  // TODO: Stopper: Github auth
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
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
  var params = {
    auth: req.get("Authorization"),
    packageName: req.params.packageName,
  };
  var user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // with user.ok we already know the user has valid authentication credentails, and we can allow changes.
    var pack = await data.StarPackageByName(params.packageName, user.content.name);

    if (pack.ok) {
      // now with staring the package successfully, we also want to add this package to the user list stars.
      var star = await users.AddUserStar(params.packageName, user.content.name);
      // this lets us add the star to the users profile.
      if (star.ok) {
        // now that we know the star has been added to the users profile, we can return the package, with success
        res.status(200).json(pack.content);
        logger.HTTPLog(req, res);
      } else {
        // the users star was not applied properly to their profile, and we would likely want to remove their star from the package before returning.
        var unstar = await data.UnStarPackageByName(params.packageName, user.content.name);

        if (unstar.ok) {
          // since it still failed to star as originally intended, return error.
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, star.content);
        } else {
          // unstarring after a failed staring, failed again. Oh jeez...
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, "Failed to unstar package after failing to add star to user. Unstar error, followed by User Star error to follow...");
          logger.ErrorLog(req, res, unstar.content);
          logger.ErrorLog(req, res, star.content);
        }
      }
    } else {
      // the users star was not applied properly to the package, and we can return without further action.
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, pack.content);
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
app.delete("/api/packages/:packageName/star", async (req, res) => {
  var params = {
    auth: req.get("Authorization"),
    packageName: req.params.packageName,
  };
  var user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // now to unstar the package, by first removing the users star from the package itself.
    var pack = await data.UnStarPackageByName(params.packageName, user.content.name);

    if (pack.ok) {
      // we have removed the star from the package, now remove it from the user.
      var unstar = await users.RemoveUserStar(params.packageName, user.content.name);

      if (unstar.ok) {
        // now the star is successfully removed from the user, and from the package
        // respond according to spec.
        res.status(201).send();
      } else {
        // else an error has occured.
        // BUT important to note, the star was already removed from the package itself, so this means the package doesn't
        // list the user, but the user still lists the package, so we would need to restar the package
        // to allow this whole flow to try again, else it will fail to unstar the package on a second attempt, leaving the user
        // no way to actually remove the star later on.
        var restar = await data.StarPackageByName(params.packageName, user.content.name);

        if (restar.ok) {
          // we restared to allow the workflow to restart later, but the request still failed.
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, unstar.content);
        } else {
          // We failed to restar the package after failing to unstar the user, rough...
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, "Failed to restar the package, after failing to unstar the user. Unstar logs followed by Restar logs...");
          logger.ErrorLog(req, res, unstar.content);
          logger.ErrorLog(req, res, restar.content);
        }
      }
    } else {
      // unable to remove the star from the package, respond with error.
      if (pack.short == "Not Found") {
        // this means the user had never stared this package, or we were unable to find it. So lets move from the original
        // spec and return not found.
        error.NotFoundJSON(res);
        logger.HTTPLog(req, res);
      } else {
        error.ServerErrorJSON(res);
        logger.HTTPLog(req, res);
        logger.ErrorLog(req, res, pack.content);
      }
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
  var params = {
    packageName: req.params.packageName,
  };
  var pack = await data.GetPackageByName(params.packageName);

  if (pack.ok) {
    // then we can just directly return the star_gazers object.
    res.status(200).json(pack.content.star_gazers);
    logger.HTTPLog(req, res);
  } else {
    if (pack.short == "Not Found") {
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, pack.content);
    }
  }
});

// Package New Version Endpoint
/**
 * @ignore
 * https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#post-apipackagespackage_nameversions
 */
app.post("/api/packages/:packageName/versions", async (req, res) => {
  var params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get("Authorization"),
    packageName: req.params.packageName,
  };
  // TODO: Stopper: Version handling, github auth
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
});

// Package Versions Endpoint
/**
 * @ignore
 * https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#get-apipackagespackage_nameversionsversion_name
 */
app.get("/api/packages/:packageName/versions/:versionName", async (req, res) => {
  var params = {
    packageName: req.params.packageName,
    versionName: req.params.versionName,
  };
  // TODO: Stopper: Version Handling
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
});

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
app.delete("/api/packages/:packageName/versions/:versionName", async (req, res) => {
  var params = {
    auth: req.get("Authorization"),
    packageName: req.params.packageName,
    versionName: req.params.versionName,
  };
  // TODO: Stopper: Version handling, github auth
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
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
  var params = {
    login: req.params.login,
  };
  var user = await users.GetUser(params.login);

  if (user.ok) {
    var packages = await data.GetPackageCollection(user.content.stars);

    if (packages.ok) {
      packages = await collection.Prune(packages.content);

      res.stats(200).json(packages);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, packages.content);
    }
  } else {
    if (user.short == "Not Found") {
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(req, res);
      logger.ErrorLog(req, res, user.content);
    }
  }
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
  var params = {
    auth: req.get("Authorization"),
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
      logger.ErrorLog(req, res, packageCollection.content);
    }
  } else {
    if (user.short == "Bad Auth") {
      error.MissingAuthJSON(res);
      logger.HTTPLog(res, req);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(res, req);
      logger.ErrorLog(req, res, user.content);
    }
  }
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
  // TODO: Stopper: Update Method
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  error.SiteWide404(res);
  logger.HTTPLog(res, req);
});

app.listen(port, () => {
  logger.InfoLog(`Atom Server Listening on port ${port}`);
});
