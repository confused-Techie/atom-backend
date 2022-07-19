/**
 * @module git
 * @desc Assists in interactions between the backend and GitHub.
 */

const superagent = require("superagent");
const { GH_TOKEN, GH_USERNAME } = require("./config.js").GetConfig();
const logger = require("./logger.js");

const encodedToken = Buffer.from(`${GH_USERNAME}:${GH_TOKEN}`).toString(
  "base64"
);

/**
 * @async
 * @function VerifyAuth
 * @desc This <b>Unfinished</b> function is intended to return true or false,
 * if the provided token owns the provided repo. The rest of the documentation will
 * wait until this function is completed. Apon further inspection it seems this function
 * is not actually implemented, or intended to be implemented anywhere, and possibly should be removed.
 */
async function VerifyAuth(token, repo) {
  // until this is properly implemented, lets return true;
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

/**
 * @async
 * @function Ownership
 * @desc This <b>Unfinished</b> function is intended to return a Server Status Object.
 * Proving ownership over a GitHub repo. Which is used to determine if the user
 * is allowed to make changes to its corresponding package. Should return true
 * in the Server Status Object if ownership is valid. But until it is written, will
 * not be fully documented.
 */
async function Ownership(user, repo) {
  // user here is a full fledged user object. And repo is a text representation of the repository.
  // Since git auth is not setup, this will return positive.
  // TODO: All of it; Stopper: Github Auth
  return { ok: true, content: "Fake Function" };
}

/**
 * @async
 * @function CreatePackage
 * @desc This <b>Unfinished</b> function is intended to create a compatible package object
 * to be used directly as a `Server Package Object`. Meaning it will need to create
 * all properties, and fill all keys. Until this is completed, the documentation will
 * also be uncompleted.
 */
async function CreatePackage(repo) {
  let newPack = {};
  // this ^^^ will be what we append all data to.
  let exists = await getRepoExistance(repo);

  if (!exists) {
    // this could be because of an error, or it truly doesn't exist.
    return {
      ok: false,
      content: `Failed to get repo: ${repo}`,
      short: "Bad Repo",
    };
  } else {
    let pack = await getPackageJSON(repo);

    if (pack === undefined) {
      return {
        ok: false,
        content: `Failed to get gh package.`,
        short: "Bad Package",
      };
    } else {
      let repoTag = await getRepoTags(repo);

      if (repoTag === undefined) {
        return {
          ok: false,
          content: "Failed to get gh tags.",
          short: "Server Error",
        };
      } else {
        // now to get our readme
        let readme = await getRepoReadMe(repo);

        if (readme === undefined) {
          return {
            ok: false,
            content: "Failed to get gh readme.",
            short: "Bad Repo",
          };
        } else {
          // Now we should be ready to create the package.
          // readme = The Text data of the current repo readme.
          // repoTag = the API JSON response for repo tags, including the tags, and their sha hash, and tarball_url
          // pack = the package.json file within the repo, as JSON.
          // And we want to funnel all of this data into newPack and return it.

          const time = Date.now();

          // One note about the difference in atom created package.json files, is the 'repository'
          // is an object rather than a string like NPM.
          newPack.name = pack.name;
          //newPack.repository = pack.repository; // the auto gen package.json does not include the repo in a valid format.
          newPack.created = time;
          newPack.updated = time;
          newPack.creation_method = "User Made Package";
          newPack.downloads = 0;
          newPack.stargazers_count = 0;
          newPack.star_gazers = [];
          newPack.readme = readme;
          newPack.metadata = pack; // The metadata tag is the most recent package.json file, in full.

          // currently there is no purpose to store the type of repo. But for the time being,
          // we will assume this could be used in the future as a way to determine how to interact with a repo.
          // The functionality will only be declarative for now, and may change later on.
          if (pack.repository.includes("github")) {
            newPack.repository = {
              type: "git",
              url: pack.repository
            };
          } else if (pack.repository.includes("bitbucket")) {
            newPack.repository = {
              type: "bit",
              url: pack.repository
            };
          } else if (pack.repository.includes("sourceforge")) {
            newPack.repository = {
              type: "sfr",
              url: pack.repository
            };
          } else if (pack.repository.includes("gitlab")) {
            newPack.repository = {
              type: "lab",
              url: pack.repository
            };
          } else {
            newPack.repository = {
              type: "na",
              url: pack.repository
            };
          }
          // todo releases + version
        }
      }
    }
  }
  // TODO: ALL OF IT
  // This is expected to generate the internal package metadata, to be directly used as the Server Package Object.
}

async function getRepoExistance(repo) {
  try {
    const res = await superagent
      .get(`https://github.com/${repo}`)
      .set({ Authorization: "Basic " + encodedToken });

    if (res.status === 200) {
      return true;
    } else if (res.status === 400) {
      return false;
    }
  } catch (err) {
    logger.WarningLog(
      null,
      null,
      `Unable to check if repo exists. ${repo} - ${err}`
    );
    return false;
  }
}

async function getPackageJSON(repo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${repo}/contents/package.json`)
      .set({ Authorization: "Basic " + encodedToken });

    if (res.status === 200) {
      return JSON.parse(
        Buffer.from(res.body.content, res.body.encoding).toString()
      );
    } else {
      logger.WarningLog(
        null,
        null,
        `Unable to Get ${repo} from GH for package.json. HTTP Status ${res.status}`
      );
      return undefined;
    }
  } catch (err) {
    logger.WarningLog(
      null,
      null,
      `Failed to Get ${repo} from GH for package.json. Err: ${err}`
    );
    return undefined;
  }
}

async function getRepoReadMe(repo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${repo}/README.md`)
      .set({ Authorization: "Basic " + encodedToken });

    if (res.status === 200) {
      return Buffer.from(res.body.content, res.body.encoding).toString();
    } else {
      logger.WarningLog(
        null,
        null,
        `Unexpected Status Code during README.md retrevial: ${res}`
      );
      return undefined;
    }
  } catch (err) {
    // since this can fail, on a 404, lets check for a lowercase readme
    if (err.status === 404) {
      // then this is not found, and we should try again for the lowercase readme.md
      try {
        const resLower = await superagent
          .get(`https://api.github.com/repos/${repo}/readme.md`)
          .set({ Authorization: "Basic " + encodedToken });

        if (resLower.status === 200) {
          return Buffer.from(res.body.content, res.body.encoding).toString();
        } else {
          // it returned, but not the error code we expect.
          logger.WarningLog(
            null,
            null,
            `Unexpected Status code during readme.md retrevial: ${resLower}`
          );
          return undefined;
        }
      } catch (err) {
        logger.WarningLog(
          null,
          null,
          `Unable to get ${repo} from GH for readme.md. Err: ${err}`
        );
        return undefined;
      }
    } else {
      // any other generic error code. Lets again respond, with undefined
      logger.WarningLog(
        null,
        null,
        `Unable to Get ${repo} from GH for README.md. Err: ${err}`
      );
      return undefined;
    }
  }
}

async function getRepoTags(repo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${repo}/tags`)
      .set({ Authorization: "Basic " + encodedToken });

    if (res.status === 200) {
      return JSON.parse(res.body);
    } else {
      logger.WarningLog(
        null,
        null,
        `Unable to Get ${repo} from GH for Tags. HTTP Status ${res.status}`
      );
      return undefined;
    }
  } catch (err) {
    logger.WarningLog(
      null,
      null,
      `Failed to Get ${repo} from GH for Tags. Err: ${err}`
    );
    return undefined;
  }
}

module.exports = {
  VerifyAuth,
  Ownership,
  CreatePackage,
};
