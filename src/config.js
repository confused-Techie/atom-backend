const fs = require("fs");
const yaml = require("js-yaml");

function GetConfig() {
  try {
    let fileContent = fs.readFileSync("./app.yaml", "utf8");
    let data = yaml.load(fileContent);

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
