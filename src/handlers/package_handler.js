/**
 * @module package_handler
 * @desc Endpoint Handlers in all relating to the packages themselves.
 * @implements {common_handler}
 * @implements {users}
 * @implements {data}
 * @implements {collection}
 * @implements {query}
 * @implements {git}
 * @implements {logger}
 * @implements {error}
 * @implements {config}
 */

const common = require("./common_handler.js");
const users = require("../users.js");
const data = require("../data.js");
const collection = require("../collection.js");
const query = require("../query.js");
const git = require("../git.js");
const logger = require("../logger.js");
const error = require("../error.js");
const { server_url, paginated_amount } = require("../config.js").getConfig();
const utils = require("../utils.js");
const database = require("../database.js");

/**
 * @async
 * @function getPackages
 * @desc Endpoint to return all packages to the user. Based on any filtering
 * theyved applied via query parameters.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function getPackages(req, res) {
  // GET /api/packages
  let params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
  };
  let packages = await database.getSortedPackages(
    params.page,
    params.direction,
    params.sort
  );

  if (!packages.ok) {
    await common.handleError(req, res, packages);
    return;
  }

  let pruned = await collection.PruneShort(packages.content);

  let total_pages = await database.getTotalPackageEstimate();

  if (!total_pages.ok) {
    await common.handleError(req, res, total_pages);
    return;
  }

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

  res.status(200).json(pruned);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function postPackages
 * @desc This endpoint is used to publish a new package to the backend server.
 * Taking the repo, and your authentication for it, determines if it can be published,
 * then goes about doing so.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function postPackages(req, res) {
  // TODO wait for set db functions.
  // POST /api/packages
  let params = {
    repository: query.repo(req),
    auth: req.get("Authorization"),
  };

  let user = await users.verifyAuth(params.auth);

  // Check authentication.
  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // Check repository format validity.
  if (params.repository === "") {
    // The repository format is invalid.
    await common.badRepoJSON(req, res);
    return;
  }

  // Now here we need to check several things for a new package:
  // - The package doesn't exist.
  // - The user is the proper owner of the repo they are attempting to link to.

  // To see if the package already exists, we will utilize our data.GetPackagePointerByName
  // to hope it returns an error, that the package doesn't exist, and will avoid reading the package file itself.
  // currently though, the repository, is `owner/repo` meanwhile GetPackagePointerByName expects just `repo`
  let exists = await data.getPackagePointerByName(
    params.repository.split("/")[1]
  );

  if (exists.ok) {
    // The package exists.
    error.publishPackageExists(res);
    logger.httpLog(req, res);
    return;
  }

  // Even further though we need to check that the error is not found, since errors here can bubble.
  if (exists.short !== "Not Found") {
    // The server failed for some other bubbled reason, and is now encountering an error.
    await common.handleError(req, res, exists);
    return;
  }

  // Now we know the package doesn't exist. And we want to check that the user owns this repo on git.
  let gitowner = await git.ownership(user.content, params.repository);

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner);
    return;
  }

  // Now knowing they own the git repo, and it doesn't exist here, lets publish.
  let pack = await git.createPackage(params.repository);

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  // Now with valid package data, we can pass it along.
  let create = await data.newPackage(pack.content);

  if (!create.ok) {
    await common.handleError(req, res, create);
    return;
  }

  // The package has been successfully created.
  // And we want to now do a small test, and grab the new package to return it.
  let new_pack = await data.getPackageByName(pack.content.name);

  if (!new_pack.ok) {
    // We were unable to get the new package, and should return an error.
    await common.handleError(req, res, new_pack);
    return;
  }

  new_pack = await collection.prunePOF(new_pack.content); // Package Object Full Prune before return.
  res.status(201).json(new_pack);
}

async function getPackagesFeatured(req, res) {
  // GET /api/packages/featured
  // https://github.com/atom/apm/blob/master/src/featured.coffee
  // Returns featured packages, but its unknown how these are determined.
  // At least currently just returns 6 items. No link headers or anything fancy like that.
  // Just Package Object Short array
  // Supports engine query parameter.
  // Assumption: This utlizies a mystery rating system to return only themes. Allowing specificity
  // into versions that are currently compatible.
  // Returns a 200 response if everything goes well.
  // Sort by package name, in alphabetical order is implemented client side. Wether this means we want to implement it
  // or leave it to the client is hard to say.

  // See https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23

  // As of now, it seems that currently there is no rating system, the featured packages
  // were manually choosen by the atom team. While in the future there are plans
  // to have an automatic rating system to determine featured packages,
  // for now we will do the same. If only to reach feature parity quicker.
  let col = await database.getFeaturedPackages();

  if (!col.ok) {
    await common.handleError(req, res, col);
    return;
  }

  let newCol = await collection.pruneShort(col.content);

  res.status(200).json(newCol);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesSearch
 * @desc Allows user to search through all packages. Using their specified
 * query parameter.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function getPackagesSearch(req, res) {
  // GET /api/packages/search
  let params = {
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

  let all_packages = await data.getAllPackages();

  if (!all_packages.ok) {
    await common.handleError(req, res, all_packages);
    return;
  }

  let packages = await collection.deepCopy(all_packages.content);
  packages = await collection.searchWithinPackages(params.query, packages);
  packages = await collection.sort(packages, params.sort);
  packages = await collection.direction(packages, params.direction);
  // Now that the packages are sorted in the proper direction, we
  // need to exempt results, according to our pagination.
  let total_pages = Math.ceil(packages.length / paginated_amount);
  // ^^^ We need to get the total before we start splicing and dicing.
  if (params.page !== 1) {
    packages.splice(0, params.page * paginated_amount);
    // Remove from the start to however many packages, should be visible on previous pages.
  }
  if (params.page !== total_pages) {
    packages.splice(
      params.page * paginated_amount + paginated_amount,
      packages.length
    );
    // This will start after our paginated options, and remove till the
    // end of the array, since we aren't on the last page.
  }
  packages = await collection.prunePOS(packages); // Package Object Short Prune.

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
  logger.httpLog(req, res);
}

async function getPackagesDetails(req, res) {
  // GET /api/packages/:packageName
  let params = {
    engine: query.engine(req),
    name: decodeURIComponent(req.params.packageName),
  };
  let pack = await database.getPackageByName(params.name);

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  // now that we are using a database, and the data is no longer stored in a cache like
  // before, we don't have to worry about deep copy nonsense
  pack = await collection.pruneDetail(pack.content); // Package Object Full Prune

  if (params.engine) {
    // query.engine returns false if no valid query param is found.
    // before using engineFilter we need to check the truthiness of it.
    pack = await collection.engineFilter(pack, params.engine);
  }

  res.status(200).json(pack);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function deletePackagesName
 * @desc Allows the user to delete a repo they have ownership of.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function deletePackagesName(req, res) {
  // DELETE /api/packages/:packageName
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };
  let user = await users.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  let gitowner = await git.ownership(user.content, params.packageName);

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner);
    return;
  }

  // they are logged in properly, and own the git repo they are referencing via the package name.
  // Now we can delete the package.
  let rm = await data.removePackageByName(params.packageName);

  if (!rm.ok) {
    await common.handleError(req, res, rm);
    return;
  }

  // we have successfully removed the package.
  res.status(204).json({ message: "Success" });
  logger.httpLog(req, res);
}

async function postPackagesStar(req, res) {
  // POST /api/packages/:packageName/star
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };
  let user = await users.verifyAuth(params.auth);

  if (user.ok) {
    // with user.ok we already know the user has valid authentication credentails, and we can allow changes.
    let pack = await data.starPackageByName(
      params.packageName,
      user.content.name
    );

    if (pack.ok) {
      // now with staring the package successfully, we also want to add this package to the user list stars.
      let star = await users.addUserStar(params.packageName, user.content.name);
      // this lets us add the star to the users profile.
      if (star.ok) {
        // now that we know the star has been added to the users profile, we can return the package, with success
        res.status(200).json(pack.content);
        logger.httpLog(req, res);
      } else {
        // the users star was not applied properly to their profile, and we would likely want to remove their star from the package before returning.
        let unstar = await data.unstarPackageByName(
          params.packageName,
          user.content.name
        );

        if (unstar.ok) {
          // since it still failed to star as originally intended, return error.
          await common.serverError(req, res, star.content);
        } else {
          // unstarring after a failed staring, failed again. Oh jeez...
          error.serverErrorJSON(res);
          logger.httpLog(req, res);
          logger.errorLog(
            req,
            res,
            "Failed to unstar package after failing to add star to user. Unstar error, followed by User Star error to follow..."
          );
          logger.errorLog(req, res, unstar.content);
          logger.errorLog(req, res, star.content);
        }
      }
    } else {
      // the users star was not applied properly to the package, and we can return without further action.
      await common.serverError(req, res, pack.content);
    }
  } else {
    await common.authFail(req, res, user);
  }
}

async function deletePackagesStar(req, res) {
  // DELETE /api/packages/:packageName/star
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };

  const onLogin = async (user) => {
    // now to unstar the package, by first removing the users star from the package.
    let pack = await data.unstarPackageByName(
      params.packageName,
      user.content.name
    );

    if (!pack.ok) {
      await common.handleError(req, res, pack);
      return;
    }
    // we have removed the star from the package, then remove from the user.
    let unstar = await users.removeUserStar(
      params.packageName,
      user.content.name
    );

    if (!unstar.ok) {
      // BUT important to note, the star was already removed from the package itself, so this means the package doesn't
      // list the user, but the user still lists the package, so we would need to restar the package
      // to allow this whole flow to try again, else it will fail to unstar the package on a second attempt, leaving the user
      // no way to actually remove the star later on.
      let restar = await data.starPackageByName(
        params.packageName,
        user.content.name
      );

      if (restar.ok) {
        await common.serverError(req, res, unstar.content);
        return;
      }

      // We failed to restar the package after failing to unstar the user, rough...
      error.serverErrorJSON(res);
      logger.httpLog(req, res);
      logger.errorLog(
        req,
        res,
        "Failed to restar the package, after failing to unstar the user. Unstar logs followed by Restar logs..."
      );
      logger.errorLog(req, res, unstar.content);
      logger.errorLog(req, res, restar.content);
      return;
    }

    // now the star is successfully removed from the user, and from the package.
    res.status(201).send();
  };

  await utils.localUserLoggedIn(req, res, params.auth, onLogin);
}

/**
 * @async
 * @function getPackagesStargazers
 * @desc Endpoint returns the array of `star_gazers` from a specified package.
 * Taking only the package wanted, and returning it directly.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function getPackagesStargazers(req, res) {
  // GET /api/packages/:packageName/stargazers
  let params = {
    packageName: decodeURIComponent(req.params.packageName),
  };
  let pack = await database.getPackageByName(params.packageName);
  let pointer = await database.getPackagePointerByName(params.packageName);

  if (!pointer.ok) {
    await common.handleError(req, res, pointer);
    return;
  }

  let stars = await database.getStarringUsersByPointer(pointer.content);

  if (!stars.ok) {
    await common.handleError(req, res, stars);
    return;
  }

  let gazers = await database.getUserCollectionById(stars.content);

  if (!gazers.ok) {
    await common.handleError(req, res, gazers);
    return;
  }

  res.status(200).json(gazers.content);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function postPackagesVersion
 * @desc Allows a new version of a package to be published. But also can allow
 * a user to rename their application during this process.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function postPackagesVersion(req, res) {
  // POST /api/packages/:packageName/versions
  let params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
  };

  const onLogin = async (user) => {
    let gitowner = await git.ownership(user.content, params.packageName);

    if (!gitowner.ok) {
      await common.handleError(req, res, gitowner);
      return;
    }

    // TODO: Unkown how to handle a rename, so it must be planned before completion.
    await common.notSupported(req, res);
  };

  await utils.localUserLoggedIn(req, res, params.auth, onLogin);
}

async function getPackagesVersion(req, res) {
  // GET /api/packages/:packageName/versions/:versionName
  let params = {
    packageName: decodeURIComponent(req.params.packageName),
    versionName: query.engine(req.params.versionName),
  };
  // Check the truthiness of the returned query engine.
  if (!params.versionName) {
    console.log("returning not found due to invalid semver.");
    // we return a 404 for the version, since its an invalid format
    await common.notFound(req, res);
    return;
  }
  // Now we know the version is a valid semver.
  let pack = await database.getPackageByName(params.packageName);

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }
  // now with the package itself, lets see if that version is a valid key within in the version obj.
  if (pack.content.versions[params.versionName]) {
    // the version does exist, lets return it.
    // Now additionally, we need to add a link to the tarball endpoint.
    pack.content.versions[params.versionName].dist = {
      tarball: `${server_url}/api/packages/${params.packageName}/versions/${params.versionName}/tarball`,
    };

    // now we can return the modified object.
    res.status(200).json(pack.content.versions[params.versionName]);
    logger.httpLog(req, res);
  } else {
    // the version does not exist, return 404
    await common.notFound(req, res);
  }
}

/**
 * @async
 * @function getPackagesVersionTarball
 * @desc Allows the user to get the tarball for a specific package version.
 * Which should initiate a download of said tarball on their end.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function getPackagesVersionTarball(req, res) {
  // GET /api/packages/:packageName/versions/:versionName/tarball
  let params = {
    packageName: decodeURIComponent(req.params.packageName),
    versionName: query.engine(req.params.versionName),
  };
  // Now that migration has began we know that each version will have
  // a tarball_url key on it, linking directly to the tarball from gh for that version.

  // we initially want to ensure we have a valid version.
  if (!params.versionName) {
    // since query.engine gives false if invalid, we can just check if its truthy
    // additionally if its false, we know the version will never be found.
    await common.notFound(req, res);
    return;
  }

  // first lets get the package
  let pack = await database.getPackageByName(params.packageName);

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  if (!pack.content.versions[params.versionName]) {
    // the package doesn't contain the version requested.
    await common.notFound(req, res);
    return;
  }

  // lets add the download to the package.
  pack.content.downloads++;

  // then lets save this updated info.
  let save = await database.updatePackageByName(params.packageName, pack.content);

  if (!save.ok) {
    logger.warningLog(req, res, save.content);
    // we don't want to exit on a failed to update downloads count, but should be logged.
  }
  // For simplicity, we will redirect the request to gh tarball url, to allow
  // the download to take place from their servers.
  res.redirect(pack.content.versions[params.versionName].tarball_url);
  logger.httpLog(req, res);
  return;
}

/**
 * @async
 * @function deletePackageVersion
 * @desc Allows a user to delete a specific version of their package.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function deletePackageVersion(req, res) {
  // DELETE /api/packages/:packageName/versions/:versionName
  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
    versionName: req.params.versionName,
  };
  let user = await users.verifyAuth(params.auth);

  if (!user.ok) {
    await common.authFail(req, res, user);
    return;
  }

  let gitowner = await git.ownership(user.content, params.packageName);

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner);
    return;
  }

  let pack = await database.getPackageByName(params.packageName);

  if (!pack.ok) {
    // getting package returned error.
    await common.handleError(req, res, pack);
    return;
  }

  if (!pack.content[params.versionName]) {
    // the version does not exist.
    // we will return not found for a non-existant version deletion.
    await common.notFound(req, res);
  }

  // the version exists
  delete pack.content[params.versionName];

  // now to write back the modified data.
  let write = database.updatePackageByName(params.packageName, pack.content);

  if (!write.ok) {
    await common.handleError(req, res, write);
    return;
  }

  // successfully wrote the modified data
  res.status(204).send();
}

/**
 * @async
 * @function postPackagesEventUninstall
 * @desc Used when a package is uninstalled, decreases the download count by 1.
 * And saves this data. Originally an undocumented endpoint.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 */
async function postPackagesEventUninstall(req, res) {
  // POST /api/packages/:packageName/versions/:versionName/events/uninstall
  // This was originally an Undocumented endpoint, discovered as the endpoint using during an uninstall by APM.
  // https://github.com/atom/apm/blob/master/src/uninstall.coffee
  // The decision to return a '201' was based on how other POST endpoints return, during a successful event.

  let params = {
    auth: req.get("Authorization"),
    packageName: decodeURIComponent(req.params.packageName),
    versionName: req.params.versionName,
  };

  const onLogin = async (user) => {
    let pack = await database.getPackageByName(params.packageName);

    if (!pack.ok) {
      await common.handleError(req, res, pack);
      return;
    }

    pack.content.downloads--;

    let write = await database.updatePackageByName(
      params.packageName,
      pack.content
    );

    if (!write.ok) {
      await common.handleError(req, res, write);
      return;
    }

    res.status(201).json({ ok: true });
    logger.httpLog(req, res);
    return;
  };

  await utils.localUserLoggedIn(req, res, params.auth, onLogin);
}

module.exports = {
  getPackages,
  postPackages,
  getPackagesFeatured,
  getPackagesSearch,
  getPackagesDetails,
  deletePackagesName,
  postPackagesStar,
  deletePackagesStar,
  getPackagesStargazers,
  postPackagesVersion,
  getPackagesVersion,
  getPackagesVersionTarball,
  deletePackageVersion,
  postPackagesEventUninstall,
};
