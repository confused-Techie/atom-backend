// This file will be the only file called on to do any reading and writing to the actual disk.
// The idea is to allow this to be a buffer for disk reads and writes.
// Letting it read from disk once, possibly before even the first API request, read on startup,
// and hold the data in memory. Allowing the rest of the requests to not be dependent on disk reads or writes.
// Allowing them to be faster, and less cost prohibitive to server owners.
// This absolutely needs to be fleshed out. But for the time being, will be simple.
// Additionally this allows one simple location to make any changes, if the data moves to a db, or to google cloud,
// or to some other authenticated service.

const fs = require("fs");

// The first argument is the TYPE of file. These are custom types, aligned to the intention of this server.
// TYPES: 'user', 'pointer', 'package', in all types but package, the name may be left out.
// The name will only be the name of the file, everything else will be determined here.
async function Read(type, name) {
  if (type == "user") {
    return readFile("./data/users.json");
  } else if (type == "pointer") {
    return readFile("./data/package_pointer.json");
  } else if (type == "package") {
    return readFile(`./data/packages/${name}`);
  }
}

function readFile(path) {
  try {
    const data = fs.readFileSync(path, "utf8");
    return { ok: true, content: JSON.parse(data) };
  } catch(err) {
    if (err.code === "ENOENT") {
      return { ok: false, content: err, short: "File Not Found" };
    } else {
      return { ok: false, content: err, short: "Server Error" };
    }
  }
}

async function Write(type, data, name) {
  if (type == "user") {
    return writeFile("./data/users.json", JSON.stringify(data, null, 4));
  } else if (type == "pointer") {
    return writeFile("./data/package_pointers.json", JSON.stringify(data, null, 4));
  } else if (type == "package") {
    return writeFile(`./data/packages/${name}`, JSON.stringify(data, null, 4));
  }
}

function writeFile(path, data) {
  try {
    fs.writeFileSync(path, data);
    return { ok: true };
  } catch(err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function Delete(name) {
  // since we know the only data we ever want to delete from disk will be packages,
  // a type is not needed here.
}

module.exports = {
  Read,
  Write,
  Delete,
};
