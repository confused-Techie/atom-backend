/**
 * @module cache
 * @desc Provides an interface for helpful caching mechanisms.
 * Originally created after some circular dependency issues arouse during
 * rapid redevelopment of the entire storage system.
 * But this does provide an opportunity to allow multiple caching systems.
 */

const { cache_time } = require("./config.js").getConfig();

/**
 * @class
 * @desc Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.
 * @param {string} [name] - Optional name to assign to the Cached Object.
 * @param {object} contents - The contents of this cached object. Intended to be a JavaScript object. But could be anything.
 */
class CacheObject {
  constructor(contents, name) {
    this.birth = Date.now();
    this.data = contents;
    this.invalidated = false;
    this.last_validate = 0;
    this.cache_time = cache_time;
    this.name = name;
  }
  get Expired() {
    return Date.now() - this.birth > this.cache_time;
  }
  invalidate() {
    this.invalidated = true;
  }
}

module.exports = {
  CacheObject,
};
