/**
  * @module DEPRECATED-searchWithinPackages
  * @desc A previously used function that would preform a search against an array of packages.
  * using the search method defined in the config.
  * This has been superseded by using native PostgreSQL Fuzzy Matching.
  * But the plan is to eventually return to using a custom search engine, in which case this may become userful again.
  */

  // ================================================================================= \\

  const search_func = require("./search.js");
  const { search_algorithm } = require("./config.js").getConfig();

  /**
   * @function searchWithinPackages
   * @desc Previously used to preform searches against the built in search algorithm. But since the switch
   * to native fuzzy matching this may be depreciated.
   */
  async function searchWithinPackages(
    search,
    packages,
    searchAlgorithm = search_algorithm
  ) {
    // This will be the method which data is searched, where once searched through will apply a relevance score to each object.
    // This score can then be used to sort the results.

    // Due to the high potential of this being reworked later on, we will rely on a config option of searchAlgorithm
    // to define what method we are wanting to use.

    switch (searchAlgorithm) {
      case "levenshtein_distance":
        // The Levenshtein Distance will be the most basic form of search.
        // Simple, not accounting for any word seperators
        // and simply returning the edit distance between strings.

        for (let i = 0; i < packages.length; i++) {
          packages[i].relevance = search_func.levenshtein(
            search,
            packages[i].name
          );
        }
        break;

      case "levenshtein_distance_wsdm":
        for (let i = 0; i < packages.length; i++) {
          packages[i].relevance = search_func.levenshteinWSDM(
            search,
            packages[i].name
          );
        }
        break;

      case "lcs":
        for (let i = 0; i < packages.length; i++) {
          packages[i].relevance = search_func.lcs(search, packages[i].name);
        }
        break;

      default:
        throw new Error(
          `Unrecognized Search Algorithm in Config: ${searchAlgorithm}`
        );
    }

    return packages;
  }

  module.exports = {
    searchWithinPackages
  };
