/**
 * @module logger
 * @desc Allows easy logging of the server. Allowing it to become simple to add additional
 * logging methods if a log server is ever implemented.
 */

const { debug } = require("./config.js").getConfig();

/**
 * @function httpLog
 * @desc The standard logger for HTTP calls. Logging in a modified 'Apache Combined Log Format'.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @example <caption>Logging Output Format</caption>
 * HTTP:: IP [DATE (as ISO String)] "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms
 */
function httpLog(req, res) {
  let date = new Date();
  let duration = Date.now() - (req.start ?? Date.now());
  console.log(
    `HTTP:: ${req.ip ?? "NO_IP"} [${date.toISOString() ?? "NO_DATE"}] "${
      req.method ?? "NO_METHOD"
    } ${sanitizeLogs(req.url) ?? "NO_URL"} ${req.protocol ?? "NO_PROT"}" ${
      res.statusCode ?? "NO_STATUS"
    } ${duration}ms`
  );
}

/**
 * @function errorLog
 * @desc An endpoint to log errors, as well as exactly where they occured. Allowing some insight into what caused
 * them, as well as how the server reacted to the end user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object|string} err - The error of what happened. Will take a raw error value, or a string created one.
 * @example <caption>Logging Output Format</caption>
 * ERROR:: IP "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms ! ERROR
 */
function errorLog(req, res, err, num = 9999) {
  // this will be a generic error logger to grab some stats about what happened, how the server handled it. And of course the error.
  let duration = Date.now() - (req.start ?? Date.now());
  console.log(
    `ERROR-${num}:: ${req.ip ?? "NO_IP"} "${req.method ?? "NO_METHOD"} ${
      sanitizeLogs(req.url) ?? "NO_URL"
    } ${req.protocol ?? "NO_PROT"}" ${
      res.statusCode ?? "NO_STATUS"
    } ${duration}ms ! ${sanitizeLogs(err?.toString()) ?? "NO_ERR"}`
  );
}

/**
 * @function warningLog
 * @desc An endpoint to log warnings. This should be used for when an error recovered, but the server
 * did its best to recover from it. Providing no error to the end user.
 * @param {object} [req] - The Optional `Request` object inherited from the Express endpoint.
 * @param {object} [res] - The Optional `Response` object inherited from the Express endpoint.
 * @param {object|string} err - The error of what happened. And like `ErrorLog` takes the raw error, or a string created one.
 * @example <caption>Logging Output Format w/ Req and Res.</caption>
 * WARNING:: IP "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms ! ERROR
 * @example <caption>Logging Output Format w/o Req and Res.</caption>
 * WARNING:: ERROR
 */
function warningLog(req, res, err, num = 9999) {
  // We must remember that in many instances warningLog is used to log generic warnings,
  // without ever being passed req or res. So these values cannot be relied on.
  let duration = Date.now() - (req?.start ?? Date.now());
  console.log(
    `WARNING-${num}:: ${req?.ip ?? "NO_IP"} "${req?.method ?? "NO_METHOD"} ${
      sanitizeLogs(req?.url) ?? "NO_URL"
    } ${req?.protocol ?? "NO_PROT"}" ${
      res?.statusCode ?? "NO_STATUS"
    } ${duration}ms ! ${sanitizeLogs(err?.toString()) ?? "NO_ERR"}`
  );
}

/**
 * @function infoLog
 * @desc An endpoint to log information only. Used sparingly, but may be helpful.
 * @param {string} value - The value of whatever is being logged.
 * @example <caption>Logging Output Format</caption>
 * INFO:: VALUE
 */
function infoLog(value) {
  console.log(`INFO:: ${sanitizeLogs(value) ?? "NO_LOG_VALUE"}`);
}

/**
 * @function debugLog
 * @desc An endpoint to log debug information only. This log will only show if enabled in the Config file.
 * That is if the `app.yaml` file has DEBUG as true.
 * @param {string} value - The value of whatever is being logged.
 * @example <caption>Logging Output Format</caption>
 * DEBUG:: VALUE
 */
function debugLog(value) {
  if (debug) {
    console.log(`DEBUG:: ${sanitizeLogs(value) ?? "NO_LOG_VALUE"}`);
  }
}

/**
 * @function sanitizeLogs
 * @desc This function intends to assist in sanitizing values from users that
 * are input into the logs. Ensuring log forgery does not occur.
 * And to help ensure that other malicious actions are unable to take place to
 * admins reviewing the logs.
 * @param {string} val - The user provided value to sanitize.
 * @returns {string} A sanitized log from the provided value.
 * @see {@link https://cwe.mitre.org/data/definitions/117.html}
 */
function sanitizeLogs(val) {
  // Removes New Line, Carriage Return, Tabs,
  // TODO: Should probably also defend against links within this.
  return val?.replace(/\n|\r/g, "")?.replace(/\t/g, "");
}

module.exports = {
  httpLog,
  errorLog,
  warningLog,
  infoLog,
  debugLog,
};
