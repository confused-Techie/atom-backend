const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } = require("./config.js").GetConfig();

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
      return { ok: false, content: `${id} was not found within packages db.`, short: "Not Found" };
    }
    return { ok: true, content: command[0].data };
    
  } catch(err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getPackageByName(name) {
  checkSQLSetup();
  
  try {
    const command = await sql_storage`
      SELECT pointer FROM pointers
      WHERE name=${name};
    `;
    
    // the above should give us the UUID of the package name,
    // now we can rely on getPackageByID 
    if (command.length === 0) {
      return { ok: false, content: `${name} was not found within pointer db.`, short: "Not Found" };
    }
    return await getPackageByID(command[0].pointer);
  } catch(err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

module.exports = {
  checkSQLSetup,
  shutdownSQL,
  getPackageByID,
  getPackageByName
}
