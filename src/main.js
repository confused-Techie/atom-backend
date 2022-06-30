const express = require("express");
const app = express();

const query = require("./query.js");
const error = require("./error.js");
const users = require("./users.js");
const data = require("./data.js");
const collection = require("./collection.js");
const logger = require("./logger.js");
const { port, server_url, paginated_amount } =
  require("./config.js").GetConfig();

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
  let params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
  };

  let all_packages = await data.GetAllPackages();

  if (all_packages.ok) {
    // Now we have all_packages.content which is an array of every package
    // we will then need to organize this list, according to our params.
    // additionally remove any fields that are not natively shown to the end user.
    // And finally we would need to modify our headers, to include links for current, next, and last.
    let packages = await collection.Sort(all_packages.content, params.sort);
    packages = await collection.Direction(packages, params.direction);
    // Now with packages sorted in the right direction, lets prune the results.
    let total_pages = Math.ceil(packages.length / paginated_amount);
    if (params.page != 1) {
      packages.splice(0, params.page * paginated_amount); // Remove from the start to however many packages, should be visible.
    }
    if (params.page != total_pages) {
      packages.splice(
        params.page * paginated_amount + paginated_amount,
        packages.length
      );
      // Start after our paginated items, and remove till the end, as long as we aren't on the last page.
    }
    packages = await collection.POSPrune(packages); // Use the Package Object Short Prune
    // One note of concern with chaining all of these together, is that this will potentially loop
    // through the entire array of packages 3 times, resulting in a
    // linear time complexity of O(3). But testing will have to determine how much that is a factor of concern.

    res.append(
      "Link",
      `<${server_url}/api/packages?page=${params.page}&sort=${
        params.sort
      }&order=${
        params.direction
      }>; rel="self", <${server_url}/api/packages?page=${total_pages}&sort=${
        params.sort
      }&order=${
        params.direction
      }>; rel="last", <${server_url}/api/packages?page=${params.page++}&sort=${
        params.sort
      }&order=${params.direction}>; rel="next"`
    );

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
  let params = {
    repository: query.repo(req),
    auth: req.get("Authorization"),
  };
  let user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // Now here we need to check several things for a new package.
    // The package doesn't exist.
    // And the user is the proper owner of the repo they are attempting to link to.

    // To see if the package already exists, we will utilize our data.GetPackagePointerByName
    // to hope it returns an error, that the package doesn't exist, and will avoid reading the package file itself.
    let exists = await data.GetPackagePointerByName(params.repository);

    if (!exists.ok) {
      // Even further though we need to check that the error is not found, since errors here can bubble.
      if (exists.short == "Not Found") {
        // Now we know the package doesn't exist. And we want to check that the user owns this repo on git.
        let gitowner = await git.Ownership(user.content, repository);

        if (gitowner.ok) {
          // Now knowing they own the git repo, and it doesn't exist here, lets publish.
          // TODO: Publishing a package.
        } else {
          // Check why its not okay. But since it hasn't been written we can't reliably know how to check, or respond.
          // So we will respond with not supported for now.
          // TODO: Proper error checking based on function.
          error.UnsupportedJSON(res);
          logger.HTTPLog(req, res);
        }
      } else {
        // the server failed for some other bubbled reason, and is now encountering an error.
        error.ServerErrorJSON(res);
        logger.HTTPLog(req, res);
        logger.ErrorLog(req, res, exists.content);
      }
    } else {
      // this means the exists was okay, or otherwise it found a package by this name.
      error.PublishPackageExists(res);
      logger.HTTPLog(req, res);
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
  let params = {
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

  let all_packages = await data.GetAllPackages();

  if (all_packages.ok) {
    let packages = await collection.SearchWithinPackages(
      params.query,
      all_packages.content
    );
    packages = await collection.Sort(packages, params.sort);
    packages = await collection.Direction(packages, params.direction);
    // Now that the packages are sorted in the proper direction, we need to exempt results, according to our pagination.
    let total_pages = Math.ceil(packages.length / paginated_amount); // We need to get the total before we start splicing and dicing.
    if (params.page != 1) {
      packages.splice(0, params.page * paginated_amount); // Remove from the start to however many packages, should be visible on previous pages.
    }
    if (params.page != total_pages) {
      packages.splice(
        params.page * paginated_amount + paginated_amount,
        packages.length
      );
      // This will start after our paginated options, and remove till the end of the array, since we aren't on the last page.
    }
    packages = await collection.POSPrune(packages); // Package Object Short Prune.

    // now to get headers.

    res.append(
      "Link",
      `<${server_url}/api/packages/search?q=${params.query}&page=${
        params.page
      }&sort=${params.sort}&order=${
        params.direction
      }>; rel="self", <${server_url}/api/packages?q=${
        params.query
      }&page=${total_pages}&sort=${params.sort}&order=${
        params.direction
      }>; rel="last", <${server_url}/api/packages/search?q=${
        params.query
      }&page=${params.page++}&sort=${params.sort}&order=${
        params.direction
      }>; rel="next"`
    );

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
  let params = {
    engine: query.engine(req),
    name: decodeURIComponent(req.params.packageName),
  };
  let pack = await data.GetPackageByName(params.name);

  if (pack.ok) {
    // from here we now have the package and just want to prune data from it
    pack = await collection.POFPrune(pack.content); // package object full prune
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
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
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
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };
  let user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // with user.ok we already know the user has valid authentication credentails, and we can allow changes.
    let pack = await data.StarPackageByName(
      params.packageName,
      user.content.name
    );

    if (pack.ok) {
      // now with staring the package successfully, we also want to add this package to the user list stars.
      let star = await users.AddUserStar(params.packageName, user.content.name);
      // this lets us add the star to the users profile.
      if (star.ok) {
        // now that we know the star has been added to the users profile, we can return the package, with success
        res.status(200).json(pack.content);
        logger.HTTPLog(req, res);
      } else {
        // the users star was not applied properly to their profile, and we would likely want to remove their star from the package before returning.
        let unstar = await data.UnStarPackageByName(
          params.packageName,
          user.content.name
        );

        if (unstar.ok) {
          // since it still failed to star as originally intended, return error.
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, star.content);
        } else {
          // unstarring after a failed staring, failed again. Oh jeez...
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(
            req,
            res,
            "Failed to unstar package after failing to add star to user. Unstar error, followed by User Star error to follow..."
          );
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
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };
  let user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    // now to unstar the package, by first removing the users star from the package itself.
    let pack = await data.UnStarPackageByName(
      params.packageName,
      user.content.name
    );

    if (pack.ok) {
      // we have removed the star from the package, now remove it from the user.
      let unstar = await users.RemoveUserStar(
        params.packageName,
        user.content.name
      );

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
        let restar = await data.StarPackageByName(
          params.packageName,
          user.content.name
        );

        if (restar.ok) {
          // we restared to allow the workflow to restart later, but the request still failed.
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(req, res, unstar.content);
        } else {
          // We failed to restar the package after failing to unstar the user, rough...
          error.ServerErrorJSON(res);
          logger.HTTPLog(req, res);
          logger.ErrorLog(
            req,
            res,
            "Failed to restar the package, after failing to unstar the user. Unstar logs followed by Restar logs..."
          );
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
  let params = {
    packageName: decodeURIComponent(req.params.packageName),
  };
  let pack = await data.GetPackageByName(params.packageName);

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
  let params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };
  // TODO: Stopper: Version handling, github auth
  error.UnsupportedJSON(res);
  logger.HTTPLog(req, res);
});

// Package Versions Endpoint
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
    let params = {
      packageName: decodeURIComponent(req.params.packageName),
      versionName: req.params.versionName,
    };
    // To ensure the version we have been handed is a valid SemVer, we can pass it through the query.engine filter
    // if we get the same object back, we know its valid.
    if (params.versionName == query.engine(params.versionName)) {
      // Now we know the version is a valid semver.
      let pack = await data.GetPackageByName(params.packageName);

      if (pack.ok) {
        // now with the package itself, lets see if that version is a valid key within in the version obj.
        if (pack.content.versions[params.versionName]) {
          // the version does exist, lets return it.
          // Now additionally, we need to add a link to the tarball endpoint.
          pack.content.versions[params.versionName].dist = {
            tarball: `${server_url}/api/packages/${params.packageName}/versions/${params.versionName}/tarball`,
          };

          // now we can return the modified object.
          res.status(200).json(pack.content.versions[params.versionName]);
          logger.HTTPLog(req, res);
        } else {
          // the version does not exist, return 404
          error.NotFoundJSON(res);
          logger.HTTPLog(req, res);
        }
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
    } else {
      // we return a 404 for the version,
      error.NotFoundJSON(res);
      logger.HTTPLog(req, res);
    }
  }
);

// Previously undocumented endpoint discovered during developement.
// Seems this endpoint allows for download of packages. Further testing is required.
// Confirmed that this is a GET only endpoint.
app.get(
  "/api/packages/:packageName/versions/:versionName/tarball",
  async (req, res) => {
    let params = {
      packageName: decodeURIComponent(req.params.packageName),
      versionName: req.params.versionName,
    };
    // TODO: All of it, read above comment.
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
app.delete(
  "/api/packages/:packageName/versions/:versionName",
  async (req, res) => {
    let params = {
      auth: req.get("Authorization"),
      packageName: decodeURIComponent(req.params.packageName),
      versionName: req.params.versionName,
    };
    // TODO: Stopper: Version handling, github auth
    error.UnsupportedJSON(res);
    logger.HTTPLog(req, res);
  }
);

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
  let params = {
    login: req.params.login,
  };
  let user = await users.GetUser(params.login);

  if (user.ok) {
    let packages = await data.GetPackageCollection(user.content.stars);

    if (packages.ok) {
      packages = await collection.POSPrune(packages.content); // package object short prune

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
  let params = {
    auth: req.get("Authorization"),
  };
  let user = await users.VerifyAuth(params.auth);

  if (user.ok) {
    let packageCollection = await data.GetPackageCollection(user.content.stars);
    if (packageCollection.ok) {
      res.status(200).json(packageCollection.content);
      logger.HTTPLog(req, res);
    } else {
      error.ServerErrorJSON(res);
      logger.HTTPLog(res, req);
      logger.ErrorLog(req, res, packageCollection.content);
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

const server = app.listen(port, () => {
  logger.InfoLog(`Atom Server Listening on port ${port}`);
});

process.on("SIGTERM", async () => {
  await Exterminate();
});

process.on("SIGINT", async () => {
  await Exterminate();
});

async function Exterminate() {
  console.log("SIGTERM/SIGINT signal receved: closing HTTP server.");
  server.close(() => {
    console.log("HTTP Server Closed.");
  });
  // Here we should handle the closing of any file handles, and saving data, as quickly as possible if needed.
}
