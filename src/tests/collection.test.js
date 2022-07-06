const collection = require("../collection.js");

const data = [
  {
    name: "one",
    downloads: 50
  },
  {
    name: "two",
    downloads: 100
  },
  {
    name: "three",
    downloads: 1
  }
];

// ================= Sort Testing
test("Sort returns array with downloads.", async () => {
  let res = await collection.Sort(data, "downloads");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Sort By downloads, gives downloads desc", async () => {
  let res = await collection.Sort(data, "downloads");
  expect(res[0].downloads).toBe(100);
});

// ================= Direction Testing
test("Direction returns Array, when given one and 'desc'", async () => {
  let res = await collection.Direction(data, "desc");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction returns Array, when given one and 'asc'", async () => {
  let res = await collection.Direction(data, "asc");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction returns Array, when given one and an invalid method", async () => {
  let res = await collection.Direction(data, "invalid_method");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction by 'desc' when 'desc'", async () => {
  let res = await collection.Direction(data, "desc");
  expect(res[0].name).toBe("one");
});

test("Direction by 'asc' when 'asc'", async () => {
  let res = await collection.Direction(data, "asc");
  expect(res[0].name).toBe("three");
});
