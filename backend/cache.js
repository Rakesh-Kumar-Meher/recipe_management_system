const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: 0,
  checkperiod: 120,
  useClones: false
});

const CACHE_TTL = {
  recipeSearch: 60 * 30,
  recipeDetail: 60 * 60 * 6
};

const normalizeValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().replace(/\s+/g, " ").toLowerCase();
};

const normalizeParams = (params) => {
  const filteredEntries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && normalizeValue(value) !== "")
    .map(([key, value]) => [key, normalizeValue(value)])
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

  return JSON.stringify(Object.fromEntries(filteredEntries));
};

const buildRecipeSearchKey = (params) => `recipes:${normalizeParams(params)}`;
const buildRecipeDetailKey = (id) => `recipe:${id}`;

const getCacheEntry = (key) => cache.get(key);
const setCacheEntry = (key, value, ttl) => cache.set(key, value, ttl);

module.exports = {
  CACHE_TTL,
  buildRecipeSearchKey,
  buildRecipeDetailKey,
  getCacheEntry,
  setCacheEntry
};
