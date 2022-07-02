const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger.js");
const resources = require("./resources.js");

// Ideally in the future, reading from these files can be adstracted away, to aid in caching data to reduce
// disk reads, while additionally allowing methods of reading from the cloud and such.
// Currently Functions that read directly from the disk: GetUsers(), GetPackagePointer(), GetPackage()

// We know what global cache objects we will have, so lets make this easy.
let cached_user, cached_pointer, cached_packages;
let deletion_flags = [];

async function Shutdown() {
  logger.DebugLog("data.Shutdown called...");
  // This function will serve as a callee for any shutdown signals we receive, and to save the data right away.
  if (cached_user !== undefined) {
    if (cached_user.invalidated) {
      logger.DebugLog("Saving invalidated User Cache.");
      // this will tell us if we called for its data to be saved previously.
      // Now we will write it.
      return resources.Write("user", cached_user.data);
    } else {
      logger.DebugLog("No need to save valid User Cache.");
    }
  }
  if (cached_pointer !== undefined) {
    if (cached_pointer.invalidated) {
      logger.DebugLog("Saving invalidated Pointer Cache.");
      return resources.Write("pointer", cached_pointer.data);
    } else {
      logger.DebugLog("No need to save valid Pointer Cache.");
    }
  }
  if (deletion_flags.length > 0) {
    logger.DebugLog("Active Deletion Flags Stored. Moving to Delete.");
    for (let i = 0; i < deletion_flags.length; i++) {
      if (deletion_flags[i].type == "package") {
        let rm = await resources.Delete(deletion_flags[i].file);
        if (rm.ok) {
          logger.DebugLog(`Deleted Successfully: ${deletion_flags[i].file}`);
        } else {
          logger.DebugLog(
            `FAILED to Delete: ${deletion_flags[i].file}; ${rm.short} - ${rm.content}`
          );
        }
      } else {
        logger.DebugLog(
          `Unrecognized Type within Deletion Array: ${deletion_flags[i].type}, ${deletion_flags[i].file} not deleted.`
        );
      }
    }
  }
}

async function GetUsers() {
  const getNew = async function () {
    let tmpcache = await resources.Read("user");
    if (tmpcache.ok) {
      cached_user = tmpcache.content;
      return { ok: true, content: cached_user.data };
    } else {
      return tmpcache;
    }
  };

  if (cached_user === undefined) {
    logger.DebugLog("Creating User Cache.");
    // user object is not cached.
    return getNew();
  } else {
    // the user object is cached.
    // With the object cached we can check that its still valid.
    if (cached_user.Expired) {
      // object is now expired, we will want to get an updated copy after ensuring thers no data to write.
      logger.DebugLog("User data IS expired, getting new.");
      // The object is expired, we want to get a new one. But before we do, lets make sure there aren't any unsaved changes.
      if (cached_user.invalidated) {
        logger.DebugLog("Saving Invalidated, Expired User Cache.");
        let save = resources.Write("user", cached_user.data);
        if (save.ok) {
          // now with the data saved, lets get it agian, and refresh the cache.
          return getNew();
        } else {
          // the save failed. Return the error.
          return save;
        }
      } else {
        // no changes to save. Lets get new data.
        return getNew();
      }
    } else {
      logger.DebugLog("User data IS NOT expired.");
      // object is not expired, lets return it.
      return { ok: true, content: cached_user.data };
    }
  }
}

async function GetPackagePointer() {
  const getNew = async function () {
    let tmpcache = await resources.Read("pointer");
    if (tmpcache.ok) {
      cached_pointer = tmpcache.content;
      return { ok: true, content: cached_pointer.data };
    } else {
      return tmpcache;
    }
  };

  if (cached_pointer === undefined) {
    // pointer object is not cached.
    logger.DebugLog("Creating Pointer Cache.");
    return getNew();
  } else {
    // the pointer object is cached.
    if (cached_pointer.Expired) {
      logger.DebugLog("Pointer data IS expired, getting new.");
      return getNew();
    } else {
      logger.DebugLog("Pointer data IS NOT expired.");
      return { ok: true, content: cached_pointer.data };
    }
  }
}

async function GetAllPackages() {
  const getNew = async function () {
    const pointers = await GetPackagePointer();
    if (!pointers.ok) {
      return pointers;
    } else {
      let package_collection = [];
      for (const pointer in pointers.content) {
        let pack = await GetPackageByID(pointers.content[pointer]);
        if (pack.ok) {
          package_collection.push(pack.content);
        } else {
          // this will prioritize giving a response, so if a single package isn't found, it'll log it.
          // then move on.
          if (pack.short != "Not Found") {
            return pack;
          } else {
            logger.WarningLog(
              undefined,
              undefined,
              `Missing Package during GetAllPackages: ${pointers.content[pointer]}`
            );
          }
        }
      }
      // once all packages have been iterated, return the collection, to the internal caller.
      return { ok: true, content: package_collection };
    }
  };

  if (cached_packages === undefined) {
    logger.DebugLog("Creating Full Package Cache.");
    let tmpcache = await getNew();
    if (tmpcache.ok) {
      cached_packages = new resources.CacheObject(tmpcache.content);
      cached_packages.last_validate = Date.now();
      return { ok: true, content: cached_packages.data };
    } else {
      return tmpcache;
    }
  } else {
    // packages are cached
    if (cached_packages.Expired) {
      logger.DebugLog("Full Package data IS expired.");
      let tmpcache = await getNew();
      if (tmpcache.ok) {
        cached_packages = new resources.CacheObject(tmpcache.content);
        cached_packages.last_validate = Date.now();
        return { ok: true, content: cached_packages.data };
      } else {
        return tmpcache;
      }
    } else {
      logger.DebugLog("Full Package data IS NOT expired.");
      return { ok: true, content: cached_packages.data };
    }
  }
}

async function GetPackageByID(id) {
  let pack = await resources.Read("package", id);
  if (pack.ok) {
    return { ok: true, content: pack.content };
  } else {
    return pack;
  }
}

function SetUsers(data) {
  // Instead of actually writing to disk, this will just update its cached data.
  if (cached_user === undefined) {
    // for whatever reason our cache data doesn't exist. Which would mean we haven't read it yet,
    // but then how are we updating the data we dont have?? But thats not for this low level function to worry about.
    // Lets write that data to disk, to ensure we keep it updated.
    return resources.Write("user", data);
  } else {
    // We have a cached data of users, lets update our cache.
    cached_user.data = data;
    cached_user.invalidate();
    return { ok: true };
  }
}

function SetPackagePointer(data) {
  if (cached_pointer === undefined) {
    // well our cache doesn't exist. Ignoring the implecation we are writing data we didn't grab lets save just in case.
    return resources.Write("pointer", data);
  } else {
    cached_pointer.data = data;
    cached_pointer.invalidate();
    return { ok: true };
  }
}

async function SetPackageByID(id, data) {
  return resources.Write("package", data, id);
}

function RemovePackageByPointerV1(pointer) {
  try {
    let rm = fs.rmSync(`./data/packages/${pointer}`);
    // since rmSync returns undefined, we can check that, just in case it doesn't throw an error.
    if (rm === undefined) {
      return { ok: true };
    } else {
      return { ok: false, content: "Not Available", short: "Server Error" };
    }
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function RemovePackageByPointer(pointer) {
  try {
    deletion_flags.push({
      type: "package",
      file: pointer,
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function RestorePackageByPointer(pointer) {
  let idx = -1;
  for (let i = 0; i < deletion_flags.length; i++) {
    if (deletion_flags[i].file == pointer) {
      idx = i;
    }
  }

  if (idx === -1) {
    return {
      ok: false,
      content: `Unable to find ${pointer} within Deletion Array.`,
      short: "Not Found",
    };
  } else {
    deletion_flags.splice(idx, 1);
    return { ok: true };
  }
}

async function RemovePackageByName(name) {
  let pointers = await GetPackagePointer();

  if (pointers.ok) {
    if (pointers.content[name]) {
      let pack_pointer = pointers.content[name];

      let new_pointer = pointers.content;

      delete new_pointer[name];

      let rm = await RemovePackageByPointer(pack_pointer);

      if (rm.ok) {
        // Now we can write the new packages, since we don't want to do that then have this fail.
        let rewrite = await SetPackagePointer(new_pointer);

        if (rewrite.ok) {
          return { ok: true, content: rewrite.content };
        } else {
          // Since the RemovePackageByPointer only marks the file for deletion, if this fails, we can then go back,
          // and call for it to be resotred.
          let rs = await RestorePackageByPointer(pack_pointer);

          if (rs.ok) {
            // This still did fail to remove the file. But we recovered and will  return an error.
            return {
              ok: false,
              content:
                "Failed to rewrite the package pointer file. Recovered Package File. No Change.",
              short: "Server Error",
            };
          } else {
            return {
              ok: false,
              content:
                "Failed to rewrite the package pointer file. The Package is still marked for deletion. The Old pointer still exists!",
              short: "Server Error",
            };
          }
        }
      } else {
        // if this first part fails we can return the standard error, knowing that nothing permentant has been done.
        return rm;
      }
    } else {
      return { ok: false, content: "Not Found", short: "Not Found" };
    }
  } else {
    return pointers;
  }
}

async function GetPackageByName(name) {
  const pointers = await GetPackagePointer();

  if (!pointers.ok) {
    return pointers;
  } else {
    // now that we have the name we are after we can just check if it exists in the object.
    if (pointers.content[name]) {
      // we know we have a valid object now and can grab the data.
      const pack = await GetPackageByID(pointers.content[name]);
      if (pack.ok) {
        return { ok: true, content: pack.content };
      } else {
        return { ok: false, content: pack.content, short: "Server Error" };
      }
    } else {
      return { ok: false, content: "Not Found", short: "Not Found" };
    }
  }
}

async function GetPackagePointerByName(name) {
  const pointers = await GetPackagePointer();

  if (!pointers.ok) {
    return pointers;
  } else {
    if (pointers.content[name]) {
      // we know the package by this name exists
      return { ok: true, content: pointers.content[name] };
    } else {
      return { ok: false, content: "Not Found", short: "Not Found" };
    }
  }
}

async function GetPackageCollection(packages) {
  let packageCollection = [];

  for (let i = 0; i < packages.length; i++) {
    const pack = await GetPackageByName(packages[i]);
    if (pack.ok) {
      packageCollection.push(pack.content);
    } else {
      // to prioritize returning something, its possible, that a package has been removed that was stared.
      // so we will check the error returned.
      if (pack.short != "Not Found") {
        // this will only return an error if the error is not "Not Found", meaning that otherwise it will just continue on.
        return pack;
      } else {
        logger.WarningLog(
          undefined,
          undefined,
          `Missing Package During GetPackageCollection: ${packages[i]}`
        );
      }
    }
  }
  return { ok: true, content: packageCollection };
}

async function StarPackageByName(packageName, userName) {
  // we need the package pointer to later write the file, and we need the package file to modify,
  // which after modification we want to write the data, and return the package itself.

  let point = await GetPackagePointerByName(packageName);

  if (point.ok) {
    // now with the pointer, we can get the package
    let pack = await GetPackageByID(point.content);

    if (pack.ok) {
      // now we have the package
      pack.content.star_gazers.push({ login: userName });

      const write = await SetPackageByID(point.content, pack.content);

      if (write.ok) {
        // on successful completion we want to return the package.
        return { ok: true, content: pack.content };
      } else {
        // write unsuccessful.
        return write;
      }
    } else {
      return pack;
    }
  } else {
    return point;
  }
}

async function UnStarPackageByName(packageName, userName) {
  const point = await GetPackagePointerByName(packageName);

  if (point.ok) {
    const pack = await GetPackageByID(point.content);

    if (pack.ok) {
      // now we need to find the index in the array of the user we want to unstar.
      let usrIdx = -1;
      for (let i = 0; i < pack.content.star_gazers.length; i++) {
        if (pack.content.star_gazers[i].login == userName) {
          usrIdx = i;
          // since we know we only are looking once, lets just break the loop once we assign the idx
          break;
        }
      }

      // after done looping, then we can check our IDX.
      if (usrIdx != -1) {
        // now we can remove that element from the array.
        pack.content.star_gazers.splice(usrIdx, 1);

        // now to write the content.
        const write = await SetPackageByID(point.content, pack.content);

        if (write.ok) {
          // and we will return the new content.
          return { ok: true, content: pack.content };
        } else {
          // write was unsuccessful
          return write;
        }
      } else {
        // if it does still equal -1, then we were never able to find our user on the star_gazers list.
        return { ok: false, content: "Not Found", short: "Not Found" };
      }
    } else {
      return pack;
    }
  } else {
    return point;
  }
}

async function SetPackageByName(name, data) {
  const pointers = await GetPackagePointer();

  if (pointers.ok) {
    if (pointers.content[name]) {
      let write = await SetPackageByID(pointers.content[name], data);

      if (write.ok) {
        return { ok: true };
      } else {
        return write;
      }
    } else {
      return {
        ok: false,
        content: "Unable to Find Package within Package Pointer Keys",
        short: "Not Found",
      };
    }
  } else {
    return pointers;
  }
}

async function NewPackage(data) {
  // Used to create a new package file.
  // this expects to be handed fully constructed proper package data. All handling of adding star_gazers, created
  // needs to be handled elsewhere.

  // so lets get our new unique ID.
  let id = uuidv4();
  // then the pointers.
  let pointers = await GetPackagePointer();

  if (pointers.ok) {
    pointers.content[data.name] = id;
    let write_pointer = await SetPackagePointer(pointers.content);

    if (write_pointer.ok) {
      // now with the pointers updated, lets write the package itself.
      let write_pack = await SetPackageByID(`${id}.json`, data);

      if (write_pack.ok) {
        return { ok: true };
      } else {
        // writing the package was unsuccessful.
        // TODO: We probably want to then remove the package pointer entry if this fails.
        return write_pack;
      }
    } else {
      return write_pointer;
    }
  } else {
    return pointers;
  }
}

module.exports = {
  GetUsers,
  SetUsers,
  GetPackagePointer,
  SetPackagePointer,
  GetPackageByID,
  GetPackageByName,
  GetAllPackages,
  GetPackageCollection,
  SetPackageByID,
  SetPackageByName,
  NewPackage,
  StarPackageByName,
  UnStarPackageByName,
  GetPackagePointerByName,
  RemovePackageByPointer,
  RemovePackageByName,
  Shutdown,
};
