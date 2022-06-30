const fs = require("fs");
const logger = require("./logger.js");
const resources = require("./resources.js");

// Ideally in the future, reading from these files can be adstracted away, to aid in caching data to reduce
// disk reads, while additionally allowing methods of reading from the cloud and such.
// Currently Functions that read directly from the disk: GetUsers(), GetPackagePointer(), GetPackage()

// We know what global cache objects we will have, so lets make this easy.
let cached_user, cached_pointer;

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
}

async function GetUsers() {
  if (cached_user === undefined) {
    logger.DebugLog("Creating User Cache.");
    // user object is not cached.
    let tmpcache = await resources.Read("user");
    if (tmpcache.ok) {
      cached_user = tmpcache.content;

      return { ok: true, content: cached_user.data };
    } else {
      // we weren't able to read correctly. We will return the error.
      return tmpcache;
    }
  } else {
    // the user object is= cached.
    // With the object cached we can check that its still valid.
    if (cached_user.Expired) {
      // object is now expired, we will want to get an updated copy after ensuring thers no data to write.
      logger.DebugLog("User data IS expired, getting new.");
      // the object is expired but our in memory copy is still valid. lets get a new one then return
      let tmpcache = await resources.Read("user");
      if (tmpcache.ok) {
        cached_user = tmpcache.content;
        return { ok: true, content: cached_user.data };
      } else {
        // failed to get the current data, pass along error.
        return tmpcache;
      }
    } else {
      logger.DebugLog("User data IS NOT expired.");
      // object is not expired, lets return it.
      return { ok: true, content: cached_user.data };
    }
  }
}

async function GetPackagePointer() {
  if (cached_pointer === undefined) {
    // pointer object is not cached.
    logger.DebugLog("Creating Pointer Cache.");
    let tmpcache = await resources.Read("pointer");
    if (tmpcache.ok) {
      cached_pointer = tmpcache.content;
      return { ok: true, content: cached_pointer.data };
    } else {
      return tmpcache;
    }
  } else {
    // the pointer object is cached.
    if (cached_pointer.Expired) {
      logger.DebugLog("Pointer data IS expired, getting new.");
      let tmpcache = await resources.Read("pointer");
      if (tmpcache.ok) {
        cached_pointer = tmpcache.content;
        return { ok: true, content: cached_pointer };
      } else {
        return tmpcache;
      }
    } else {
      logger.DebugLog("Pointer data IS NOT expired.");
      return { ok: true, content: cached_pointer.data };
    }
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

function RemovePackageByPointer(pointer) {
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
          // TODO: Determine how we handle this error.
          // We may want to implement something like caching the file, instead of deleting it. And keeping it for some time.
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

function GetPackageByID(id) {
  try {
    const pack = fs.readFileSync(`./data/packages/${id}`, "utf8");
    return { ok: true, content: JSON.parse(pack) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ok: false, content: err, short: "File Not Found" };
    } else {
      return { ok: false, content: err, short: "Server Error" };
    }
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

async function GetAllPackages() {
  // first we will retrieve the package pointer.
  const pointers = await GetPackagePointer();

  if (!pointers.ok) {
    // any other error handling could be here, but for now we can leave it up to the handler.
    return pointers;
  } else {
    // now with the pointers, we want to get each package object, and shove it in an array.
    let package_collection = [];
    for (const pointer in pointers.content) {
      // now with the key of a value, we can grab the actual package.
      let pack = await GetPackageByID(pointers.content[pointer]);
      if (pack.ok) {
        package_collection.push(pack.content);
      } else {
        // this will prioritize giving a response, so if a single package isn't found, it'll log it. Then move on.
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
    // once all packages have been iterated through, we can return the collection as a status object.
    return { ok: true, content: package_collection };
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

async function SetPackageByID(id, data) {
  // used to update EXISITNG package
  try {
    fs.writeFileSync(`./data/packages/${id}`, JSON.stringify(data, null, 4));
    return { ok: true };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

function NewPackage() {
  // Used to create a new package file.
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
  NewPackage,
  StarPackageByName,
  UnStarPackageByName,
  GetPackagePointerByName,
  RemovePackageByPointer,
  RemovePackageByName,
  Shutdown,
};
