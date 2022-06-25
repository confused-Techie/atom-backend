const collection = require("../collection.js");

// This will be something allowing us to test the basic functionality of searching, and nothing else.

const example_data = [
  {
    "name": "github"
  },
  {
    "name": "foxtrot"
  },
  {
    "name": "mars"
  },
  {
    "name": "pluto"
  },
  {
    "name": "pluto-is-a-planet"
  },
  {
    "name": "hello-world"
  }
];

const searches = [
  "mithub",
  "fishbowl",
  "mars",
  "a planet",
  "world_hello"
];

const methods = [
  "levenshtein_distance",
  "levenshtein_distance_wsdm"
];

const search = async() => {
  let output = [];

  for (let i = 0; i < methods.length; i++) {

    for (let u = 0; u < searches.length; u++) {
      let start = process.hrtime.bigint();
      let res = await collection.SearchWithinPackages(searches[u], example_data, methods[i]);
      let duration = process.hrtime.bigint() - start;
      // Since duration is a Bigint value, we have to do math with another BigInt Integer, or else lose accuracy.
      for (let e = 0; e < res.length; e++) {
        output.push({
          method: methods[i], search: searches[u], against: res[e].name, score: res[e].relevance, nanoseconds: duration, microseconds: duration/1000n
        });
      }
    }
  }
  console.table(output);
};

search();

// Notes:
/**
* A notable outlier while testing that needs further investigation
* Searching 'a planet' against 'pluto-is-a-planet' when using lvenshtein_distance_wsdm
* When done by hand results in .55 edit distance, as you might expect having just over the string
* But in reality the results here show NaN.
* Seems this happens when comparing a against a, while assuming this would return 1.0 seems it get caught on
* checking the > 0, since the array index is zero. Rather than rework, we could capture all edge cases by checking
* for NaN while reducing the array, then additionally rework.
*/
