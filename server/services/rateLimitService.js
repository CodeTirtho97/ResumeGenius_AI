// server/services/rateLimitService.js
const fs = require("fs");
const path = require("path");

// Store rate limit data in a file
const RATE_LIMIT_FILE = path.join(__dirname, "../data/rate_limits.json");
const RATE_LIMIT_DIR = path.dirname(RATE_LIMIT_FILE);

// Ensure directory exists
if (!fs.existsSync(RATE_LIMIT_DIR)) {
  fs.mkdirSync(RATE_LIMIT_DIR, { recursive: true });
}

// Initialize rate limit file if it doesn't exist
if (!fs.existsSync(RATE_LIMIT_FILE)) {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify({}));
}

// Load rate limits data
const loadRateLimits = () => {
  try {
    const data = fs.readFileSync(RATE_LIMIT_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error loading rate limits:", error);
    return {};
  }
};

// Save rate limits data
const saveRateLimits = (data) => {
  try {
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Error saving rate limits:", error);
    return false;
  }
};

// Check if user is rate limited
const isRateLimited = (identifier) => {
  const rateLimits = loadRateLimits();

  // If user doesn't exist in rate limits, they're not limited
  if (!rateLimits[identifier]) {
    return false;
  }

  const lastUsage = new Date(rateLimits[identifier].lastUsage);
  const now = new Date();
  const hoursSinceLastUsage = (now - lastUsage) / (1000 * 60 * 60);

  // Rate limited if less than 1 hour has passed
  return hoursSinceLastUsage < 1;
};

// Get time remaining in cooldown (in minutes)
const getCooldownTimeRemaining = (identifier) => {
  const rateLimits = loadRateLimits();

  if (!rateLimits[identifier]) {
    return 0;
  }

  const lastUsage = new Date(rateLimits[identifier].lastUsage);
  const now = new Date();
  const minutesSinceLastUsage = (now - lastUsage) / (1000 * 60);

  // 60 minutes cooldown
  const remainingMinutes = 60 - minutesSinceLastUsage;
  return remainingMinutes > 0 ? Math.ceil(remainingMinutes) : 0;
};

// Record usage for rate limiting
const recordUsage = (identifier) => {
  const rateLimits = loadRateLimits();

  rateLimits[identifier] = {
    lastUsage: new Date().toISOString(),
    count: (rateLimits[identifier]?.count || 0) + 1,
  };

  return saveRateLimits(rateLimits);
};

// Clean up expired rate limits
const cleanupExpiredRateLimits = () => {
  const rateLimits = loadRateLimits();
  let cleaned = 0;

  const now = new Date();

  Object.keys(rateLimits).forEach((identifier) => {
    const lastUsage = new Date(rateLimits[identifier].lastUsage);
    const hoursSinceLastUsage = (now - lastUsage) / (1000 * 60 * 60);

    // Remove entries older than 24 hours
    if (hoursSinceLastUsage > 24) {
      delete rateLimits[identifier];
      cleaned++;
    }
  });

  if (cleaned > 0) {
    saveRateLimits(rateLimits);
    console.log(`✅ Cleaned up ${cleaned} expired rate limit entries`);
  }

  return cleaned;
};

// Get rate limit stats
const getRateLimitStats = () => {
  try {
    const rateLimits = loadRateLimits();
    const now = new Date();

    const activeUsers = Object.keys(rateLimits).filter((id) => {
      const lastUsage = new Date(rateLimits[id].lastUsage);
      return (now - lastUsage) / (1000 * 60 * 60) < 1; // Active in last hour
    }).length;

    const totalUsers = Object.keys(rateLimits).length;
    const totalRequests = Object.values(rateLimits).reduce(
      (sum, user) => sum + user.count,
      0
    );

    return {
      activeUsers,
      totalUsers,
      totalRequests,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error("❌ Error getting rate limit stats:", error);
    return { error: error.message };
  }
};

module.exports = {
  isRateLimited,
  recordUsage,
  getCooldownTimeRemaining,
  cleanupExpiredRateLimits,
  getRateLimitStats,
};
