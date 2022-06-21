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

function SetUsers() {}

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
    const package = fs.readFileSync(`./data/packages/${id}`, "utf8");
    return { ok: true, content: JSON.parse(package) };
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
      const package = await GetPackageByID(pointers.content[name]);
      if (package.ok) {
        return { ok: true, content: package.content };
      } else {
        return { ok: false, content: package.content, short: "Server Error" };
      }
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
      var package = await GetPackageByID(pointers.content[pointer]);
      if (package.ok) {
        package_collection.push(package.content);
      } else {
        // this will prioritize giving a response, so if a single package isn't found, it'll log it. Then move on.
        if (package.short != "Not Found") {
          return package;
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

function SetPackage(id) {
  // used to update EXISITNG package
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
  SetPackage,
  NewPackage,
};
