const resources = require("./resources.js");
const logger = require("./logger.js");

async function IsPackageNameBanned(name) {
  let names = await resources.Read("name_ban_list");

  if (!names.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.WarningLog(null, null, "Unable to locate Name Ban List");
    return { ok: true };
  }

  for (let i = 0; i < names.content.length; i++) {
    if (name === names.content[i]) {
      // it was found on a ban list.
      return { ok: false };
    }
  }

  // name wasn't found on any ban lists.
  return { ok: true };
}

module.export = {
  IsPackageNameBanned,
};
