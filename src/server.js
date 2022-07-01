const app = require("./main.js");
const { port } = require("./config.js").GetConfig();
const logger = require("./logger.js");
const data = require("./data.js");

const serve = app.listen(port, () => {
  logger.InfoLog(`Atom Server Listening on port ${port}`);
});

process.on("SIGTERM", async() => {
  await Exterminate("SIGTERM");
});

process.on("SIGINT", async() => {
  await Exterminate("SIGINT");
});

async function Exterminate(callee) {
  console.log(`${callee} signal received: closing HTTP server.`);
  await data.Shutdown();
  console.log("Exiting...");
  serve.close(() => {
    console.log("HTTP Server Closed.");
  });
}
