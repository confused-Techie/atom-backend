const database = require("./database.js");
const superagent = require("superagent");
const { GH_USERAGENT } = require("./config.js").getConfig();

/**
  * @async
  * @function verifyAuth
  * @desc This will be the major function to determine, confirm, and provide user
  * details of an authenticated user. This will take a users provided token,
  * and use it to check GitHub for the details of whoever owns this token.
  * Once that is done, we can go ahead and search for said user within the database.
  * If the user exists, then we can confirm that they are both locally and globally
  * authenticated, and execute whatever action it is they wanted to.
  * @params {object} token - The token the user provided.
  */
async function verifyAuth(token) {
  if (token === null || token === undefined) {
    return { ok: false, short: "Bad Auth", content: "User Token not valid" };
  }

  try {
    let user_data;

    if (process.env.PULSAR_STATUS == "dev") {
      // Server is in developer mode.
      console.log("auth.js is returning Dev Only Permissions");

      switch(token) {
        case "valid-token":
          user_data = { status: 200, body: {node_id: "dever-nodeid"}};
          break;
        case "no-valid-token":
          user_data = { status: 200, body: {node_id: "no-perm-user-nodeid"}};
          break;
        case "admin-token":
          user_data = { status: 200, body: {node_id: "admin-user-nodeid"}};
          break;
        case "no-star-token":
          user_data = { status: 200, body: {node_id: "has-no-stars-nodeid"}};
          break;
        case "all-star-token":
          user_data = { status: 200, body: {node_id: "has-all-stars-nodeid"}};
          break;
        default:
          console.log("No valid dev user found!");
          user_data = { status: 401, body: {message: "No Valid dev user found!"}};
          break;
      }
    } else {
      user_data = await superagent
        .get("https://api.github.com/user")
        .set({ Authorization: `Bearer ${token}`})
        .set({ "User-Agent": GH_USERAGENT });
    }

    if (user_data.status !== 200) {
      switch(user_data.status) {
        case 403:
        case 401:
          // When the user provides bad authentication, lets tell them it's bad auth.
          return { ok: false, short: "Bad Auth", content: user_data };
          break;
        default:
          return { ok: false, short: "Server Error", content: user_data };
      }
    }

    let prov_node_id = user_data.body.node_id;

    // Now we want to see if we are able to locate this user's node_id in our db.
    let db_user = await database.getUserByNodeID(prov_node_id);

    if (!db_user.ok) {
      return db_user;
    }

    // Now we have a valid user from the database, that we can confirm is fully authenticated.
    // We will go ahead and return an "Auth User Object" to let the rest of the system use

    let auth_user_object = {
      token: token,
      id: db_user.content.id,
      node_id: prov_node_id,
      created_at: db_user.content.created_at,
      username: db_user.content.username,
      avatar: db_user.content.avatar,
      data: db_user.content.data
    };

    console.log(auth_user_object);
    return {
      ok: true,
      content: auth_user_object
    };

  } catch(err) {
    return { ok: false, short: "Server Error", content: err };
  }
}

module.exports = {
  verifyAuth,
};
