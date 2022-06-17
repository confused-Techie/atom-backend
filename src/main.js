const express = require("express");
const app = express();

var query = require("./query.js");
var error = require("./error.js");
var users = require("./users.js");

// this will in time use a YAML config file to retreive details, since if the Hosting ends up in Google Cloud, thats were it stores variables.
// This method will allow us to detect local testing environments vs production environments by seeing if Google Cloud Run has entered our YAML variables into ENV variables.
// Otherwise we can read the yaml file manually and know its a local enviroment.
const port = 8080;

app.use((req, res, next) => {
  // Middleware that can be used for logging the requests.
  console.log(`Time: ${Date.now()}`);
  next();
});

app.get('/', (req, res) => {
  // this is to display the ability to use this as the normal web page handler as well.
  res.send("Hello World");
});

// Package Slug Endpoints
app.get("/api/packages", (req, res) => {
  var params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
  };

});

app.post("/api/packages", (req, res) => {
  var params = {
    repository: query.repo(req),
    auth: req.get('Authorization'),
  };

  error.UnsupportedJSON(res);
});

// Searching Endpoints
app.get("/api/packages/search", (req, res) => {
  var params = {
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

});

// Package Name Slug Endpoints
app.get("/api/packages/:packageName", (req, res) => {
  var params = {
    engine: query.engine(req),
  };

});

app.delete("/api/packages/:packageName", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Package Star Slug Endpoints
app.post("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

app.delete("/api/packages/:packageName/star", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Package Stargazers Slug Endpoints
app.get("/api/packages/:packageName/stargazers", (req, res) => {

});

// Package New Version Endpoint
app.post("/api/packages/:packageName/versions", (req, res) => {
  var params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: req.get('Authorization'),
  };

});

// Package Versions Endpoint
app.get("/api/packages/:packageName/versions/:versionName", (req, res) => {

});

app.delete("/api/packages/:packageName/versions/:versionName", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

});

// Get Any User's Starred Packages
app.get("/api/users/:login/stars", (req, res) => {

});

// List Authenticated User's Starred Packages
app.get("/api/stars", (req, res) => {
  var params = {
    auth: req.get('Authorization'),
  };

  users.VerifyAuth(params.auth, (user) => {
    console.log(user);
  });

});

// Listing Atom-Community Updates
app.get("/api/updates", (req, res) => {

});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  error.SiteWide404(res);
});

app.listen(port, () => {
  console.log(`Atom Server Listening on port ${port}`);
});
