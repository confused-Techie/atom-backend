const search = require("../search.js");

test("Levenshtein Return Same String", async () => {
  let res = search.levenshtein("hello", "hello");
  expect(res).toBe(1.0);
});

test("Levenshtein Return Similar String", async () => {
  let res = search.levenshtein("kitten", "sitten");
  expect(res).toBe(0.8333333333333334);
});

test("Levenshtein Return Dis-Similar String", async () => {
  let res = search.levenshtein("hello", "mark");
  expect(res).toBe(0.2);
});

test("Levenshtein Return Dis-Similar String - Reversed", async () => {
  let res = search.levenshtein("mark", "hello");
  expect(res).toBe(0.2);
});

test("Levenshtein Return With Empty String", async () => {
  let res = search.levenshtein("", "");
  expect(res).toBe(1.0);
});

test("Levenshtein-WSDM Return Same String", async () => {
  let res = search.levenshteinWSDM("hello-world", "hello-world");
  expect(res).toBe(0.7);
});

test("Levenshtein-WSDM Return Similar String", async () => {
  let res = search.levenshteinWSDM("hello-world", "hello-wrodl");
  expect(res).toBe(0.5);
});

test("Levenshtein-WSDM Return Dis-Similar String", async () => {
  let res = search.levenshteinWSDM("hello-world", "mark");
  expect(res).toBe(0.2);
});

test("LCS Return Same String", async () => {
  let res = search.lcs("hello", "hello");
  expect(res).toBe(1.0);
});

test("LCS Return Similar String", async () => {
  let res = search.lcs("kitten", "sitten");
  expect(res).toBe(0.8333333333333334);
});

test("LCS Return Dis-Similar String", async () => {
  let res = search.lcs("hello", "mark");
  expect(res).toBe(0);
});
