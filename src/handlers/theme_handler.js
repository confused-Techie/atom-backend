const common = require("./common_handler.js");

async function GETThemeFeatured(req, res) {
  // GET /api/themes/featured

  // TODO: Undocumented Endpoint discovered, as the endpoint in use by APM to get featured themes.
  // https://github.com/atom/apm/blob/master/src/featured.coffee
  // Returns featured packages, filtered by themes. Unknown how these are determined.
  // At least currently returns an 2 of items.
  // Package Object Short Array.
  // Supports engine query parameter.
  // Assumption: this utilizes a mystery rating system to return only themes. Allowing specificity
  // into versions that are currently compatible.
  // Returns a 200 response if everything goes well.
  // Sort by package name, in alphabetical order is implemented client side. Wether this means we want to implement it
  // or leave it to the client is hard to say.
  await common.NotSupported(req, res);
}

module.exports = {
  GETThemeFeatured,
};
