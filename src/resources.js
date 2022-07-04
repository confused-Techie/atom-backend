/**
 * @module resources
 * @desc This module provides a way for other functions to read/write/delete data without knowing or
 * thinking about the underlying file structure. Providing abstraction if the data resides on a local
 * filesystem, Google Cloud Storage, or something else entirely.
 * @implements {config}
 */

const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const { cache_time, file_store, GCS_BUCKET, GCS_SERVICE_ACCOUNT_FILE } =
  require("./config.js").GetConfig();

let gcs_storage;

/**
 * @class
 * @desc Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.
 * @param {string} [name] - Optional name to assign to the Cached Object.
 * @param {object} contents - The contents of this cached object. Intended to be a JavaScript object. But could be anything.
 */
class CacheObject {
  constructor(contents, name) {
    this.birth = Date.now();
    this.data = contents;
    this.invalidated = false;
    this.last_validate = 0;
    this.cache_time = cache_time;
    this.name = name;
  }
  get Expired() {
    return Date.now() - this.birth > this.cache_time;
  }
  invalidate() {
    this.invalidated = true;
  }
}

/**
 * @async
 * @function Read
 * @desc Exported function to read data from the filesystem, whatever that may be.
 * @param {string} type - The type of data we are reading. Valid Types: "user", "pointer", "package".
 * @param {string} name - The name of the file we are reading. Only needed if type is "package",
 * in which case this <b>MUST</b> include `.json` for example `UUID.json`.
 * @return {object} If type is "package" or "pointer" returns a Server Status Object, with `content`
 * being a `CacheObject` class, already initialized and ready for consumption. Otherwise if type is
 * "package" returns the return from `readFile`. Errors bubble up from `readFile`.
 * @implments {readFile}
 */
async function Read(type, name) {
  if (type == "user") {
    let data = await readFile("./data/users.json");
    if (data.ok) {
      // now with the data lets make our cache object, and we can return that.

      let obj = new CacheObject(data.content);
      obj.last_validate = Date.now(); // give it the time we last read from disk.
      return { ok: true, content: obj }; // now its data can be accessed via the data property.
    } else {
      // data was not read okay, just return error message.
      return data;
    }
  } else if (type == "pointer") {
    let data = await readFile("./data/package_pointer.json");
    if (data.ok) {
      let obj = new CacheObject(data.content);
      obj.last_validate = Date.now();
      return { ok: true, content: obj };
    } else {
      return data;
    }
  } else if (type == "package") {
    return readFile(`./data/packages/${name}`);
  }
}

/**
 * @async
 * @desc Non-Exported function to read data from the filesystem. Whatever that may be.
 * @function readFile
 * @param {string} path - The Path to whatever file we want.
 * @returns {object} A Server Status Object, with `content` being the read file parsed from JSON.
 * If error returns "Server Error" or "File Not Found".
 */
async function readFile(path) {
  if (file_store == "filesystem") {
    try {
      const data = fs.readFileSync(path, "utf8");
      return { ok: true, content: JSON.parse(data) };
    } catch (err) {
      if (err.code === "ENOENT") {
        return { ok: false, content: err, short: "File Not Found" };
      } else {
        return { ok: false, content: err, short: "Server Error" };
      }
    }
  } else if (file_store == "gcs") {
    // check we have a valid storage object.
    if (gcs_storage === undefined) {
      gcs_storage = new Storage({ keyFilename: GCS_SERVICE_ACCOUNT_FILE });
    }

    // then continue on
    try {
      let contents = await gcs_storage.bucket(GCS_BUCKET).file(path).download();
      return { ok: true, content: JSON.parse(contents) };
    } catch (err) {
      return { ok: false, content: err, short: "Server Error" };
    }
  } else {
    console.log("UNRECOGNIZED FILE STORE METHOD! Exiting...");
    process.exit(1);
  }
}

/**
 * @async
 * @function Write
 * @desc The Exported Write function, to allow writing of data to the filesystem.
 * @param {string} type - The Type of data we are writing. Valid Types: "user", "pointer", "package"
 * @param {object} data - A JavaScript Object that will be `JSON.stringify`ed before writing.
 * @param {string} name - The path name of the file we are writing. Only required when type is "package",
 * in which case it should be `UUID.json`, it <b>MUST</b> include the `.json`.
 * @return {object} Returns the object returned from `writeFile`. Errors bubble up from `writeFile`.
 * @implements {writeFile}
 */
async function Write(type, data, name) {
  if (type == "user") {
    return writeFile("./data/users.json", JSON.stringify(data, null, 4));
  } else if (type == "pointer") {
    return writeFile(
      "./data/package_pointers.json",
      JSON.stringify(data, null, 4)
    );
  } else if (type == "package") {
    return writeFile(`./data/packages/${name}`, JSON.stringify(data, null, 4));
  }
}

/**
 * @async
 * @function writeFile
 * @desc Non-Exported write function. Used to directly write data to the filesystem. Whatever that may be.
 * @param {string} path - The path to the file we are writing. Including the destination file.
 * @param {object} data - The Data we are writing to the filesystem. Already encoded in a compatible format.
 * @return {object} A Server Status Object, with `content` only on an error.
 * Errors returned "Server Error".
 */
async function writeFile(path, data) {
  if (file_store == "filesystem") {
    try {
      fs.writeFileSync(path, data);
      return { ok: true };
    } catch (err) {
      return { ok: false, content: err, short: "Server Error" };
    }
  } else if (file_store == "gcs") {
    // check we have a valid storage object.
    if (gcs_storage === undefined) {
      gcs_storage = new Storage({ keyFilename: GCS_SERVICE_ACCOUNT_FILE });
    }

    // then continue on
    try {
      await gcs_storage.bucket(GCS_BUCKET).file(path).save(data);
      return { ok: true };
    } catch (err) {
      return { ok: false, content: err, short: "Server Error" };
    }
  } else {
    console.log("UNRECOGNIZED FILE STORE METHOD! Exiting...");
    process.exit(1);
  }
}

/**
 * @async
 * @function Delete
 * @descc Exported function to delete data from the filesystem, whatever that may be. But since we know
 * we will only ever be deleting packages, these will only ever attempt to delete a package.
 * @param {string} name - The name of the package we want to delete. <b>MUST</b> include `.json`, as in `UUID.json`.
 * @return {object} A Server Status Object, with `content` non-existant on a successful deletion.
 * Errors returned as "Server Error".
 */
async function Delete(name) {
  // since we know the only data we ever want to delete from disk will be packages,
  // a type is not needed here.
  if (file_store == "filesystem") {
    try {
      let rm = fs.rmSync(`./data/packages/${name}`);
      // since rmSync returns undefined, we can check that, just in case it doesn't throw an error.
      if (rm === undefined) {
        return { ok: true };
      } else {
        return { ok: false, content: "Not Available", short: "Server Error" };
      }
    } catch (err) {
      return { ok: false, content: err, short: "Server Error" };
    }
  } else if (file_store == "gcs") {
    if (gcs_storage === undefined) {
      gcs_storage = new Storage({ keyFilename: GCS_SERVICE_ACCOUNT_FILE });
    }
    try {
      await gcs_storage.bucket(GCS_BUCKET).file(name).delete();
      return { ok: true };
    } catch (err) {
      return { ok: false, content: err, short: "Server Error" };
    }
  } else {
    console.log("UNRECOGNIZED FILE STORE METHOD! Exiting...");
    process.exit(1);
  }
}

module.exports = {
  Read,
  Write,
  Delete,
  CacheObject,
};
