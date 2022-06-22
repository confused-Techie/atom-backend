var fs = require("fs");
var logger = require("./logger.js");

// Ideally in the future, reading from these files can be adstracted away, to aid in caching data to reduce
// disk reads, while additionally allowing methods of reading from the cloud and such.
// Currently Functions that read directly from the disk: GetUsers(), GetPackagePointer(), GetPackage()

function GetUsers() {
  try {
    const users = fs.readFileSync("./data/users.json", "utf8");
    return { ok: true, content: JSON.parse(users) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ok: false, content: err, short: "File Not Found" };
    } else {
      return { ok: false, content: err, short: "Server Error" };
    }
  }
}

function SetUsers(data) {
  try {
    fs.writeFileSync("./data/users.json", JSON.stringify(data, null, 4));
    return { ok: true };
  } catch(err) {
    return { ok: false, content: error, short: "Server Error" };
  }
}

function GetPackagePointer() {
  try {
    const pointers = fs.readFileSync("./data/package_pointer.json", "utf8");
    return { ok: true, content: JSON.parse(pointers) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ok: false, content: err, short: "File Not Found" };
    } else {
      return { ok: false, content: err, short: "Server Error" };
    }
  }
}

function SetPackagePointer() {}

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
    var package_collection = [];
    for (const pointer in pointers.content) {
      // now with the key of a value, we can grab the actual package.
      var pack = await GetPackageByID(pointers.content[pointer]);
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
          //console.log(`Missing Package during GetAllPackages: ${pointers.content[pointer]}`);
        }
      }
    }
    // once all packages have been iterated through, we can return the collection as a status object.
    return { ok: true, content: package_collection };
  }
}

async function GetPackageCollection(packages) {
  var packageCollection = [];

  for (var i = 0; i < packages.length; i++) {
    var pack = await GetPackageByName(packages[i]);
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

  var point = await GetPackagePointerByName(packageName);

  if (point.ok) {
    // now with the pointer, we can get the package
    var pack = await GetPackageByID(point.content);

    if (pack.ok) {
      // now we have the package
      pack.content.star_gazers.push({ login: userName });

      var write = await SetPackageByID(point.content, pack.content);

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
  var point = await GetPackagePointerByName(packageName);

  if (point.ok) {
    var pack = await GetPackageByID(point.content);

    if (pack.ok) {
      // now we need to find the index in the array of the user we want to unstar.
      var usrIdx = -1;
      for (var i = 0; i < pack.content.star_gazers.length; i++) {
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
        var write = await SetPackageByID(point.content, pack.content);

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
    fs.writeFileSync(`../data/packages/${id}`, JSON.stringify(data, null, 4));
    return { ok: true };
  } catch(err) {
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
};
