// This will contain the different error messages that can be returned, to allow one place to edit them,
// and allow for easily routing a request to them.

function NotFoundJSON(res) {
  res.status(404).json({ message: "Not Found" });
}

function SiteWide404(res) {
  res
    .status(404)
    .json({ message: "This is a standin for the proper site wide 404 page." });
}

function MissingAuthJSON(res) {
  res
    .status(401)
    .json({
      message:
        "Requires authentication. Please update your token if you haven't done so recently.",
    });
}

function ServerErrorJSON(res) {
  res.status(500).json({ message: "Application Error" });
}

function UnsupportedJSON(res) {
  // this is only an interm response while the server is under development.
  res
    .status(501)
    .json({
      message: "While under development this feature is not supported.",
    });
}

module.exports = {
  NotFoundJSON,
  SiteWide404,
  MissingAuthJSON,
  ServerErrorJSON,
  UnsupportedJSON,
};
