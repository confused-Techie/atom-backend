function HTTPLog(req, res) {
  // this will log a modified Apache Combined Log Format
  // IP - [time] "METHOD url PROTOCOL" STATUS_CODE TIME_TAKEN
  var date = new Date();
  var duration = Date.now() - req.start;
  console.log(`${req.ip} [${date.toISOString()}] "${req.method} ${req.url} ${req.protocol}" ${res.statusCode} ${duration}ms`);
}

module.exports = {
  HTTPLog,
};
