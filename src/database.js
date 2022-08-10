const fs = require("fs");
const postgres = require("postgres");
const storage = require("./storage.js");
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_DB,
  DB_PORT,
  DB_SSL_CERT,
  paginated_amount,
} = require("./config.js").getConfig();

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

  let pointer = await getPackagePointerByName(name);
  
  if (!pointer.ok) {
    return pointer;
  }
  
  return await getPackageByID(pointer.content);
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

async function getPackageCollectionByName(packArray) {

  try {
    // Until a proper method is found to query all items natively, 
    // for now we will find each packages individually
    
    let pack_gen;
    
    for (let i = 0; i < packArray.length; i++) {
      let pack = await getPackageByName(packArray[i]);
      if (!pack.ok) {
        logger.warningLog(null, null, 
          `Missing Package During getPackageCollectionByName: ${packArray[i]}`);
      }
      pack_gen.push(pack.content);
    }
    
    return { ok: true, content: pack_gen };
    
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getPointerTable() {
  checkSQLSetup();
  
  try {
    
    const command = await sql_storage`
      SELECT ARRAY (SELECT * FROM pointers);
    `;

    if (command.length === 0) {
      return {
        ok: false,
        content: 'Unable to get all Package Pointers.',
        short: "Server Error",
      };
    }

    return { ok: true, content: command[0].array };
    
  } catch(err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function setPackageByID(id, data) {
  checkSQLSetup();

  try {
    // TODO
    // should contain a command that can edit an existing package with this new data.
    // using the id as the uuid of the item.
  } catch (err) {
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

async function getFeaturedPackages() {
  checkSQLSetup();

  let featuredArray = await storage.getFeaturedPackages();

  if (!featuredArray.ok) {
    return featuredArray;
  }

  let allFeatured = await getPackageCollectionByName(featuredArray.content);

  if (!allFeatured.ok) {
    return allFeatured;
  }

  return { ok: true, content: allFeatured.content };
}

async function getTotalPackageEstimate() {
  checkSQLSetup();

  try {
    const command = await sql_storage`
      SELECT reltuples AS estimate FROM pg_class WHERE relname='packages';
    `;

    if (command.length === 0) {
      return {
        ok: false,
        content: `Unable to query total row count estimate.`,
        short: "Server Error",
      };
    }

    return { ok: true, content: command[0].estimate };
  } catch (err) {
    return { ok: false, content: err, short: "Server Error" };
  }
}

async function getSortedPackages(page, dir, method) {
  // Here will be a monolithic function for returning sortable packages arrays.
  // We must keep in mind that all the endpoint handler knows is the
  // page, sort method, and direction. We must figure out the rest here.
  // only knowing we have a valid sort method provided.

  checkSQLSetup();

  let total = await getTotalPackageEstimate();
  if (!total.ok) {
    return total;
  }

  let offset = 0;
  let limit = paginated_amount;
  let total_pages = Math.ceil(total.content / paginated_amount);

  if (page !== 1) {
    offset = page * paginated_amount;
  }

  try {
    let command;

    switch (method) {
      case "downloads":
        //console.log(`SELECT data FROM packages ORDER BY data->'downloads' ${dir.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`);
        command = await sql_storage`
          SELECT ARRAY
            (SELECT data FROM packages ORDER BY data->'downloads' ${
              dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`
            }
              LIMIT ${limit}
              OFFSET ${offset});
        `;
        break;
      case "created_at":
        command = await sql_storage`
          SELECT ARRAY 
            (SELECT data FROM packages ORDER BY data->'created' ${
              dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`
            }
              LIMIT ${limit}
              OFFSET ${offset});
        `;
        break;
      case "updated_at":
        command = await sql_storage`
          SELECT ARRAY 
            (SELECT data FROM packages ORDER BY data->'updated' ${
              dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`
            }
              LIMIT ${limit}
              OFFSET ${offset});
        `;
        break;
      case "stars":
        command = await sql_storage`
          SELECT ARRAY 
            (SELECT data FROM packages ORDER BY data->'stargazers_count' ${
              dir === "desc" ? sql_storage`DESC` : sql_storage`ASC`
            }
              LIMIT ${limit}
              OFFSET ${offset});
        `;
        break;
      default:
        logger.warningLog(
          null,
          null,
          `Unrecognized Sorting Method Provided: ${method}`
        );
        return {
          ok: false,
          content: `Unrecognized Sorting Method Provided: ${method}`,
          short: "Server Error",
        };
        break;
    }

    return { ok: true, content: command[0].array };
  } catch (err) {
    console.log(err);
    return { ok: false, content: err, short: "Server Error" };
  }
}

module.exports = {
  checkSQLSetup,
  shutdownSQL,
  getPackageByID,
  getPackagePointerByName,
  getPackageByName,
  getPackageCollectionByName,
  setPackageByID,
  setPackageByName,
  removePackageByName,
  removePackageByID,
  getFeaturedPackages,
  getTotalPackageEstimate,
  getSortedPackages,
};
