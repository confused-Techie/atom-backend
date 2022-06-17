const express = require("express");
const app = express();

var query = require("./query.js");

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
  console.log(query.page(req));
  console.log(req.query.test);
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
  };

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

});

// Package Star Slug Endpoints
app.post("/api/packages/:packageName/star", (req, res) => {

});

app.delete("/api/packages/:packageName/star", (req, res) => {

});

// Package Stargazers Slug Endpoints
app.get("/api/packages/:packageName/stargazers", (req, res) => {

});

// Package New Version Endpoint
app.post("/api/packages/:packageName/versions", (req, res) => {
  var params = {
    tag: query.tag(req),
    rename: query.rename(req),
  };
  
});

// Package Versions Endpoint
app.get("/api/packages/:packageName/versions/:versionName", (req, res) => {

});

app.delete("/api/packages/:packageName/versions/:versionName", (req, res) => {

});

// Get User's Starred Packages
app.get("/api/users/:login/stars", (req, res) => {

});

// List Authenticated User's Starred Packages
app.get("/api/stars", (req, res) => {

});

// Listing Atom-Community Updates
app.get("/api/updates", (req, res) => {

});

app.listen(port, () => {
  console.log(`Atom Server Listening on port ${port}`);
});
