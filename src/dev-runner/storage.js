/**
 * @module storage (DevRunner)
 * @desc This DevRunner instance of Storage is what is exported when the server 
 * detects that it is running in development mode, and requires ./src/storage.js
 * Intended to safely mock all features of ./src/storage.js without the risk 
 * of modifying remote data, or having to rely on external services.
 */

const featuredPackages = [
  "hydrogen",
  "atom-clock",
  "hey-pane",
  "scroll-through-time",
  "teletype",
  "zentabs",
  "atom-material-syntax",
  "atom-material-ui",
];

const featuredThemes = ["atom-material-ui", "atom-material-syntax"];

const banList = [
  "atom-pythoncompiler",
  "situs-slot-gacor",
  "slot-online-gacor",
  "slot88",
  "slot-gacor-hari-ini",
  "demo-slot-joker-gacor",
  "hoki-slot",
  "slot-bonus-new-member",
  "slot-dana",
  "slot-deposit-dana-100000",
  "slot-deposit-pulsa",
  "slot-hoki",
  "slot-paling-gacor-setiap-hari",
  "slot-pulsa",
  "slothoki",
  "slotonline",
];

async function getBanList() {
  return banList;
}

async function getFeaturedPackages() {
  return featuredPackages;
}

async function getFeaturedThemes() {
  return featuredThemes;
}

module.exports = {
  getBanList,
  getFeaturedPackages,
  getFeaturedThemes,
};
