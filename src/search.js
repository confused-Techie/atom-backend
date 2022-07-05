/**
* @module search
* @desc This module is focused on implementing different search algorithms.
* Elsewhere in the code the choice is made of which functions to call, to actual
* execute a search function.
*/

/**
* @function levenshtein
* @desc The top level exported function to call, to preform a search based on
* the Levenshtein Distance. Sibling functions denotated as vlFUNC, for its creator
* Vladimir Levenshtein.
* @param {string} s1 - The first string, generally inteded to be the actual typed search string.
* @param {string} s2 - The second string, generally intended to be the string compared against the search.
* @returns {function} vlSimilarity
* @implements {vlSimilarity}
*/
function levenshtein(s1, s2) {
  return vlSimilarity(s1, s2);
}

/**
* @function vlSimilarity
* @desc The un-exported function called by `levenshtein`. Used to preform the actual search.
* @param {string} s1 - Intended to be the search string.
* @param {string} s2 - Intended to be the string compared against the search string.
* @returns {float} The numerical Edit Distance. 1.0 being the highest, and closest match, down to 0.0
* @implements {vlEditDistance}
*/
function vlSimilarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (
    (longerLength - vlEditDistance(longer, shorter)) / parseFloat(longerLength)
  );
}

/**
* @function vlEditDistance
* @desc The un-exported function called by `vlSimilarity` to actually compute the Edit Distance
* between two strings.
* @param {string} s1 - The longest string provided to vlSimilarity.
* @param {string} s2 - The shortest string provided to vlSimilarity.
* @returns {float} A numerical Edit Distance, 1.0 being the highest and closest match, down to 0.0
*/
function vlEditDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let costs = new Array();
  for (let p = 0; p < s1.length; p++) {
    let lastValue = p;
    for (let q = 0; q < s2.length; q++) {
      if (p === 0) {
        costs[q] = q;
      } else {
        if (q > 0) {
          let newValue = costs[q - 1];
          if (s1.charAt(p - 1) != s2.charAt(q - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[q]) + 1;
          }
          costs[q - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (p > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

/**
* @function levenshteinWSDM
* @desc A custom implementation of Levenshtein's Edit Distance, intended to be
* better suited for sentences. Named: 'Levenshtein Distance w/ Word Seperators - Double Mean'.
* Still relies on base levenshtein functions to reduce duplication.
* @param {string} s1 - Intended as the string being searched with.
* @param {string} s2 - Intended as the string being search against.
* @returns {float} A numerical Edit Distance, 1.0 being the highest and closest match, down to 0.0
* @implements {vlSimilarity}
*/
function levenshteinWSDM(s1, s2) {
  // But based on the data, it still seems that the standard levenshtein distance is best, even with word characters.

  // Since I still want to have the max score be 1.0, this will normalize results,
  // by dividing the added results by the amount of results, otherwise getting the arithmetic mean.

  // One thing to note that is done purposefully, The base levenshteinWS doesn't support modifications to
  // the words themselves, and checks the values of the words in the order they appear both in the search,
  // and searched strings.

  // Additionally some levenshtein functions will self rely on each other to reduce duplication.

  // First create an array of the characters, after substituting all word seperators for a single word sep.
  s1 = s1.replace(" ", "-").replace("_", "-");
  s2 = s2.replace(" ", "-").replace("_", "-");
  let s1A = s1.split("-");
  let s2A = s2.split("-");

  let means = new Array();
  for (let i = 0; i < s1A.length; i++) {
    let costs = new Array();
    for (let u = 0; u < s2A.length; u++) {
      costs[u] = vlSimilarity(s1A[i], s2A[u]);
    }
    means[i] =
      costs.reduce((a, b) => (isNaN(a) ? (isNaN(b) ? 0 : b) : a + b), 0) /
      costs.length;
  }
  // then to calculate the mean of all means.
  return means.reduce((a, b) => a + b, 0) / means.length;
}

/**
* @function lcs
* @desc An exported translation of Longest Common Subsequence Algorithm in JavaScript.
* With a custom twist, where instead of reporting the string of the LCS, reports
* a numerical float value of the similarity two its search string.
* With sibling functions denotated by lcsFUNC.
* @param {string} s1 - Intended as the string being searched with.
* @param {string} s2 - Intended as the string being searched against.
* @returns {float} A numerical float similarity index. For example if the string is
* 5 characters long, and the LCS is 4 characters, it will return 0.8 for it's similarity score.
* @implements {lcsTraceBack}
*/
function lcs(s1, s2) {
  // This has been implemented directly from the algorithm function.
  // https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
  let height = s1.length + 1;
  let width = s2.length + 1;
  let matrix = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));

  for (let row = 1; row < height; row++) {
    for (let col = 1; col < width; col++) {
      if (s1[row - 1] == s2[col - 1]) {
        matrix[row][col] = matrix[row - 1][col - 1] + 1;
      } else {
        matrix[row][col] = Math.max(matrix[row][col - 1], matrix[row - 1][col]);
      }
    }
  }

  let longest = lcsTraceBack(matrix, s1, s2, height, width);
  // Now longest is a literal string of the longest common subsequence.
  // This is now where the implementation differs from the alrogithm,
  // We will make a float of how close the longest sequence is to the searched sequence
  return longest.length / s1.length;
  // For Example: if the string is 5 chars, and the longest is 4, it'll be 0.8 similarity score.
}

/**
* @function lcsTraceBack
* @desc The non-exported recursive traceback function determining the actual Longest Common
* Subsequence.
* @param {array[]} matrix - A table storing the matrix of the LCS calculation.
* @param {string} s1 - Intended as the string being searched with, or row's of the matrix.
* @param {string} s2 - Intended as the string being searched against, or col's of the matrix.
* @param {int} height - The numerical height of the matrix, as derived from s1.
* @param {int} width - The numerical width of the matrix, as derived from s2.
*/
function lcsTraceBack(matrix, s1, s2, height, width) {
  if (height === 0 || width === 0) {
    return "";
  }
  if (s1[height - 1] == s2[width - 1]) {
    return (
      lcsTraceBack(matrix, s1, s2, height - 1, width - 1) +
      (s1[height - 1] ? s1[height - 1] : "")
    );
  }
  if (matrix[height][width - 1] > matrix[height - 1][width]) {
    return lcsTraceBack(matrix, s1, s2, height, width - 1);
  }
  return lcsTraceBack(matrix, s1, s2, height - 1, width);
}

module.exports = {
  levenshtein,
  levenshteinWSDM,
  lcs,
};
