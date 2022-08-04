const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("./config.js").getConfig();

let sql_storage;

function setupSQL() {
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

async function getAllPackagesSQL() {
  if (sql_storage === undefined) {
    setupSQL();
  }

  try {
    const command = await sql_storage`
      SELECT data FROM packages
    `;

    let packArray = [];
    for (let i = 0; i < command.length; i++) {
      packArray.push(command[i].data);
    }
    return { ok: true, content: packArray };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

module.exports = {
  getAllPackagesSQL,
};
