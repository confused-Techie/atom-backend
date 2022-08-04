const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("./config.js").getConfig();

let sql_storage; // sql object, to interact with the DB,
// should be set after first call.

function checkSQLSetup() {
  if (sql_storage === undefined) {
    sql_storage = postgres({
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_DB,
      port: DB_PORT,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_SSL_CERT).toString(),
      },
    });
  }
}

function shutdownSQL() {
  if (sql_storage !== undefined) {
    sql_storage.end();
  }
}

async function getPackageByID(id) {
  checkSQLSetup();

  try {
    const command = await sql_storage`
      SELECT data FROM packages 
      WHERE pointer=${id};
    `;

    if (command.length === 0) {
      return {
        ok: false,
        content: `${id} was not found within packages db.`,
        short: "Not Found",
      };
    }
    return { ok: true, content: command[0].data };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getPackageByName(name) {
  checkSQLSetup();
  // It may be smart to have this use getPackagePointer, then direct
  // to getPackageByID, instead of reimplementing this command here.
  try {
    const command = await sql_storage`
      SELECT pointer FROM pointers
      WHERE name=${name};
    `;

    // the above should give us the UUID of the package name,
    // now we can rely on getPackageByID
    if (command.length === 0) {
      return {
        ok: false,
        content: `${name} was not found within pointer db.`,
        short: "Not Found",
      };
    }
    return await getPackageByID(command[0].pointer);
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getPackagePointerByName(name) {
  checkSQLSetup();

  try {
    const command = await sql_storage`
      SELECT pointer FROM pointers 
      WHERE name=${name};
    `;

    if (command.length === 0) {
      return {
        ok: false,
        content: `${name} was not found within pointer db.`,
        short: "Not Found",
      };
    }
    return { ok: true, content: command[0].pointer };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getPackageCollection(packArray) {
  checkSQLSetup();

  try {
    // Could look at generating a query using UNION, but theres likely a better way.
    // TODO
    // this should use packArray to create the query, pack array will be an array 
    // of package names to retreive.
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function setPackageByID(id, data) {
  checkSQLSetup();
  
  try {
    // TODO 
    // should contain a command that can edit an existing package with this new data.
    // using the id as the uuid of the item.
  } catch(err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function setPackageByName(name, data) {
  checkSQLSetup();
  
  const pointer = await getPackageByName(name);
  
  if (!pointer.ok) {
    return pointer;
  }
  
  const write = await setPackageByID(pointer.content, data);
  
  if (!write.ok) {
    return write;
  }
  return { ok: true, content: data };
}

async function removePackageByName(name) {
  // TODO 
  // Should remove the specified package from the db. 
  // If possible with a flag to indicate that it should be deleted.
  // then if so, a companion function that can restore that deleted package.
} 

async function removePackageByID(id) {
  // TODO 
  // should use removePackageByName to remove a package.
}

module.exports = {
  checkSQLSetup,
  shutdownSQL,
  getPackageByID,
  getPackagePointerByName,
  getPackageByName,
  getPackageCollection,
  setPackageByID,
  setPackageByName,
  removePackageByName,
  removePackageByID,
};
