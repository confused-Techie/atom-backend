const collection = require("../collection.js");

const data = [
  {
    name: "one",
    downloads: 50,
  },
  {
    name: "two",
    downloads: 100,
  },
  {
    name: "three",
    downloads: 1,
  },
];

// ================= Sort Testing
test("Sort returns array with downloads.", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Sort(new_data, "downloads");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Sort By downloads, gives downloads desc", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Sort(new_data, "downloads");
  expect(res[0].downloads).toBe(100);
});

// ================= Direction Testing
test("Direction returns Array, when given one and 'desc'", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Direction(new_data, "desc");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction returns Array, when given one and 'asc'", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Direction(new_data, "asc");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction returns Array, when given one and an invalid method", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Direction(new_data, "invalid_method");
  expect(Array.isArray(res)).toBeTruthy();
});

test("Direction by 'desc' when 'desc'", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Direction(new_data, "desc");
  expect(res[0].name).toBe("one");
});

test("Direction by 'asc' when 'asc'", async () => {
  let new_data = await collection.DeepCopy(data);
  let res = await collection.Direction(new_data, "asc");
  expect(res[0].name).toBe("three");
});

test("POFPrune Removes created", async () => {
  let data = {
    name: "test",
    created: "date",
    updated: "date",
    star_gazers: "gazing",
  };
  let res = await collection.POFPrune(data);
  expect(res.created).toBeUndefined();
});

test("POFPrune Removed updated", async () => {
  let data = {
    name: "test",
    created: "date",
    updated: "date",
    star_gazers: "gazing",
  };
  let res = await collection.POFPrune(data);
  expect(res.updated).toBeUndefined();
});

test("POFPrune Removes star_gazers", async () => {
  let data = {
    name: "test",
    created: "date",
    updated: "date",
    star_gazers: "gazing",
  };
  let res = await collection.POFPrune(data);
  expect(res.star_gazers).toBeUndefined();
});
