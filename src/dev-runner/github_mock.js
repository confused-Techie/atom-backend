/**
 * @module github_mock
 * @desc This module is only used during testing. It exists to attempt to fully test
 * the ./src/git.js module by allowing it to carry out API requests and respond accordingly,
 * but without having to hammer GitHub Servers or have to worry about credential managment
 * in CI environments.
 */

const express = require("express");
const app = express();

app.get("/user/repos", (req, res) => {
  let param = {
    page: req.params.page,
    auth: req.get("Authorization"),
  };

  // Then we choose what to do depending on which user is requesting access.

  switch (param.auth) {
    case "Bearer admin-token":
      // user: admin_user token: admin-token
      res
        .status(200)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: '<localhost:9999/user/repos?page=1>; rel="first", <localhost:9999/user/repos?page=1>; rel="last"',
        })
        .json([
          {
            id: 123456,
            full_name: "admin_user/atom-backend",
          },
        ]);
      break;
    case "Bearer no-valid-token":
      // user: no_perm_user token: no-valid-token
      res
        .status(401)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: '<localhost:9999/user/repos?page=1>; rel="first", <localhost:9999/user/repos?page=1>; rel="last"',
        })
        .json({
          message: "Requires authentication",
          documentation_url:
            "https://docs.github.com/rest/reference/repo#list-repositories-for-the-authenticated-user",
        });
      break;
    default:
      res.status(500).json({ message: "huh??" });
      break;
  }
});

module.exports = app;
