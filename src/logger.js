function HTTPLog(req, res) {
  // this will log a modified Apache Combined Log Format
  // IP - [time] "METHOD url PROTOCOL" STATUS_CODE TIME_TAKEN
  var date = new Date();
  var duration = Date.now() - req.start;
  console.log(
    `${req.ip} [${date.toISOString()}] "${req.method} ${req.url} ${
      req.protocol
    }" ${res.statusCode} ${duration}ms`
  );
}

function ErrorLog(req, res, err) {
  // this will be a generic error logger to grab some stats about what happened, how the server handled it. And of course the error.
  var duration = Date.now() - req.start;
  console.log(
    `ERROR:: ${req.ip} "${req.method} ${req.url} ${req.protocol}" ${res.statusCode} ${duration}ms ! ${err}`
  );
}

function WarningLog(req, res, err) {
  if (req === undefined || res === undefined) {
    console.log(`WARNING:: ${err}`);
  } else {
    var duration = Date.now() - req.start;
    console.log(
      `WARNING:: ${req.ip} "${req.method} ${req.url} ${req.protocol}" ${res.statusCode} ${duration}ms ! ${err}`
    );
  }
}

function InfoLog(value) {
  console.log(`INFO:: ${value}`);
}

module.exports = {
  HTTPLog,
  ErrorLog,
  WarningLog,
  InfoLog,
};
