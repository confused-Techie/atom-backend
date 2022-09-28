// Dev server runner.
// Should setup an in memory Database using pg-test, handling the setup and teardown,
// while additionally starting up the api server itself, letting it run as per normal.

const dbSetup = require("../node_modules/@databases/pg-test/jest/globalSetup");
const dbTeardown = require("../node_modules/@databases/pg-test/jest/globalTeardown");

async function test() {
  await dbSetup();

  // lets take the value made by the test runner database, and put it where the api server expects.
  let db_url = process.env.DATABASE_URL;
  // this gives us something like postgres://test-user@localhost:5432/test-db
  // We then need to map these values to where the API server expects,
  let db_url_reg = /(\S*:\/\/)(\S*)@(\S*):(\S*)\/(\S*)/;
  let db_url_parsed = db_url_reg.exec(db_url);

  // set the parsed URL as proper env
  process.env.DB_HOST = db_url_parsed[3];
  process.env.DB_USER = db_url_parsed[2];
  process.env.DB_DB = db_url_parsed[5];
  process.env.DB_PORT = db_url_parsed[4];

  // Then since we want to make sure we don't initialize the config module, before we have set our values,
  // we will define our own port to use here.
  process.env.PORT = 8080;

  console.log("hello world");
  console.log(process.env.DB_HOST);

  const app = require("./main.js");
  const logger = require("./logger.js");
  const database = require("./database.js");
  // We can only require these items after we have set our env variables

  // Currently this causes database.js to error out.
  // Error: Client network socket disconnected before secure TLS connection was established.
  // i need to not try and setup ssl, and disable pw
  logger.warningLog(
    "Pulsar Server is in Development Mode with a Local Database!"
  );

  const serve = app.listen(process.env.PORT, () => {
    logger.infoLog(`Pulsar Server Listening on port ${process.env.PORT}`);
  });

  process.on("SIGTERM", async () => {
    await localExterminate("SIGTERM", serve);
  });

  process.on("SIGINT", async () => {
    await localExterminate("SIGINT", serve);
  });
}

async function localExterminate(callee, serve) {
  console.log(`${callee} signal received: closing HTTP server.`);
  await dbTeardown();
  console.log("Exiting...");
  serve.close(() => {
    console.log("HTTP Server Closed.");
  });
}
test();
