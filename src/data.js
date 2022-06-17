var fs = require("fs");

function GetUsers() {
  return new Promise(function (resolve, reject) {
    fs.readFile("./data/users.json", "utf8", (err, data) => {
      if (err) {
        reject(err);

      }
      resolve(JSON.parse(data));
    });
  });
}

function SetUsers() {

}

function GetPackagePointer() {

}

function SetPackagePointer() {

}

function GetPackage(id) {

}

function SetPackage(id) {
  // used to update EXISITNG package
}

function NewPackage() {
  // Used to create a new package file.
}

module.exports = { GetUsers };
