// server/services/cacheService.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Cache directory setup
const CACHE_DIR = path.join(__dirname, "../cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Generate a cache key based on input data
const generateCacheKey = (data) => {
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(data))
    .digest("hex");
  return hash;
};

// Save data to cache
const saveToCache = (key, data, expirationHours = 24) => {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    const cacheData = {
      data,
      expiresAt: new Date(
        Date.now() + expirationHours * 60 * 60 * 1000
      ).toISOString(),
    };
    fs.writeFileSync(cachePath, JSON.stringify(cacheData));
    console.log(`✅ Cache saved: ${key}`);
    return true;
  } catch (error) {
    console.error("❌ Error saving to cache:", error);
    return false;
  }
};

// Get data from cache
const getFromCache = (key) => {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    const cacheRaw = fs.readFileSync(cachePath, "utf8");
    const cache = JSON.parse(cacheRaw);

    // Check if cache is expired
    if (new Date(cache.expiresAt) < new Date()) {
      // Delete expired cache
      fs.unlinkSync(cachePath);
      return null;
    }

    console.log(`✅ Cache hit: ${key}`);
    return cache.data;
  } catch (error) {
    console.error("❌ Error reading from cache:", error);
    return null;
  }
};

// Clear expired cache entries
const clearExpiredCache = () => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let cleared = 0;

    files.forEach((file) => {
      const cachePath = path.join(CACHE_DIR, file);
      try {
        const cacheRaw = fs.readFileSync(cachePath, "utf8");
        const cache = JSON.parse(cacheRaw);

        if (new Date(cache.expiresAt) < new Date()) {
          fs.unlinkSync(cachePath);
          cleared++;
        }
      } catch (error) {
        // If the file can't be parsed, it might be corrupted, so delete it
        try {
          fs.unlinkSync(cachePath);
          cleared++;
        } catch (delError) {
          console.error(
            `❌ Error deleting corrupted cache file: ${file}`,
            delError
          );
        }
      }
    });

    console.log(`✅ Cleared ${cleared} expired cache entries`);
    return cleared;
  } catch (error) {
    console.error("❌ Error clearing expired cache:", error);
    return 0;
  }
};

module.exports = {
  generateCacheKey,
  saveToCache,
  getFromCache,
  clearExpiredCache,
};
