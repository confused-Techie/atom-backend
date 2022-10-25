const cache = require("../cache.js");

test("Cache Creates Object As Expected", async () => {
  let newCache = new cache.CacheObject("test-contents");
  expect(typeof newCache === "object").toBeTruthy();
});

describe("Cache Objects Have the Functions and Variables Expected", () => {
  let newCache = new cache.CacheObject("test-contents", "test-name");

  test("Cache Object Contains Birth", async () => {
    expect(newCache.birth).toBeDefined();
  });

  test("Cache Object Contains Contents as Instantiated", async () => {
    expect(newCache.data).toEqual("test-contents");
  });

  test("Cache Object Data is not Invalidated Via Variable", async () => {
    expect(newCache.invalidated).toEqual(false);
  });

  test("Cache Object last_validate Exists", async () => {
    expect(newCache.last_validate).toBeDefined();
  });

  test("Cache Object cache_time Exists", async () => {
    expect(newCache.cache_time).toBeDefined();
  });

  test("Cache Object contains Name as Instantiated", async () => {
    expect(newCache.name).toEqual("test-name");
  });
});
