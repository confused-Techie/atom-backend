/**
 * @module config
 * @desc Module that access' and returns the server wide configuration.
 */

const fs = require("fs");
const yaml = require("js-yaml");

/**
 * @desc Used to get Server Config data from the `app.yaml` file at the root of the project.
 * Or from environment variables. Prioritizing environment variables.
 * @function GetConfig
 * @return {object} The different available configuration values.
 * @example <caption>Using `GetConfig()` during an import for a single value.</caption>
 * const { search_algorithm } = require("./config.js").GetConfig();
 */
function GetConfig() {
  try {
    let data;
    try {
      let fileContent = fs.readFileSync("./app.yaml", "utf8");
      data = yaml.load(fileContent);
    } catch (err) {
      // We failed to get the config file. But if we have env vars in production its okay.
      if (
        process.env.NODE_ENV != "production" &&
        process.env.NODE_ENV != "test"
      ) {
        console.log(`Failed to load app.yaml in non-production env! ${err}`);
        process.exit(1);
      } else {
        // while we want to continue, to grab variables from just the environment,
        // We will assign the base object to data, to help prevent tests from failing.
        data = {
          env_variables: {},
        };
      }
    }

    // now we should have the data as a JSON object.

    // But we will create a custom object here to return, with all values, and choosing between the env vars and config
    // Since if this is moved to Google App Engine, these variables will all be environment variables. So we will look for both.
    return {
      port: process.env.PORT ? process.env.PORT : data.env_variables.PORT,
      server_url: process.env.SERVERURL
        ? process.env.SERVERURL
        : data.env_variables.SERVERURL,
      paginated_amount: process.env.PAGINATE
        ? process.env.PAGINATE
        : data.env_variables.PAGINATE,
      search_algorithm: process.env.SEARCHALGORITHM
        ? process.env.SEARCHALGORITHM
        : data.env_variables.SEARCHALGORITHM,
      prod: process.env.NODE_ENV == "production" ? true : false,
      cache_time: process.env.CACHETIME
        ? process.env.CACHETIME
        : data.env_variables.CACHETIME,
      debug: process.env.DEBUGLOG
        ? process.env.DEBUGLOG
        : data.env_variables.DEBUGLOG,
      file_store: process.env.FILESTORE
        ? process.env.FILESTORE
        : data.env_variables.FILESTORE,
      GCS_BUCKET: process.env.GCS_BUCKET
        ? process.env.GCS_BUCKET
        : data.env_variables.GCS_BUCKET,
      GCS_SERVICE_ACCOUNT_FILE: process.env.GCS_SERVICE_ACCOUNT_FILE
        ? process.env.GCS_SERVICE_ACCOUNT_FILE
        : data.env_variables.GCS_SERVICE_ACCOUNT_FILE,
    };
  } catch (err) {
    // since this is necessary for the server to startup, we can throw an error here and exit the process.
    console.error(err);
    process.exit(1);
  }
}

module.exports = {
  GetConfig,
};
