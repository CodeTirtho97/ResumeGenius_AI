const path = require("path");
const fs = require("fs");

class RateLimitService {
  constructor() {
    this.dataDir = path.join(__dirname, "..", "data");
    this.rateLimitFile = path.join(this.dataDir, "rateLimit.json");
    this.ensureDataDir();
    this.loadRateLimitData();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  loadRateLimitData() {
    try {
      if (fs.existsSync(this.rateLimitFile)) {
        const data = fs.readFileSync(this.rateLimitFile, "utf8");
        this.rateLimitData = JSON.parse(data);
      } else {
        this.rateLimitData = {};
      }
    } catch (error) {
      console.error("Error loading rate limit data:", error);
      this.rateLimitData = {};
    }
  }

  saveRateLimitData() {
    try {
      fs.writeFileSync(
        this.rateLimitFile,
        JSON.stringify(this.rateLimitData, null, 2)
      );
    } catch (error) {
      console.error("Error saving rate limit data:", error);
    }
  }

  // UPDATED: Flexible rate limits - analyze resumes vs AI API calls
  isRateLimited(identifier, operation = "analyze") {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (operation === "analyze") {
      // For resume analysis: Check last 5 uploads in the past hour
      return this.getUsageCount(identifier, operation, oneHour) >= 5;
    } else {
      // For AI operations (tailor/suggestions): Check last 2 calls in the past hour
      return this.getUsageCount(identifier, operation, oneHour) >= 2;
    }
  }

  // NEW: Count usage in a given time window
  getUsageCount(identifier, operation, timeWindow) {
    const now = Date.now();
    const key = `${identifier}_${operation}`;

    if (!this.rateLimitData[key] || !this.rateLimitData[key].usageHistory) {
      return 0;
    }

    // Count usages within the time window
    const recentUsages = this.rateLimitData[key].usageHistory.filter(
      (timestamp) => now - timestamp < timeWindow
    );

    return recentUsages.length;
  }

  // UPDATED: Different limits for different operations
  getOperationLimits(operation) {
    const limits = {
      analyze: {
        count: 5,
        window: 60,
        description: "5 resume analyses per hour",
      },
      tailor: {
        count: 2,
        window: 60,
        description: "2 resume tailoring requests per hour",
      },
      suggestions: {
        count: 2,
        window: 60,
        description: "2 AI suggestion requests per hour",
      },
    };

    return limits[operation] || limits["analyze"];
  }

  // UPDATED: Record usage with history tracking
  recordUsage(identifier, operation = "analyze") {
    const now = Date.now();
    const key = `${identifier}_${operation}`;

    if (!this.rateLimitData[key]) {
      this.rateLimitData[key] = {
        usageHistory: [],
        totalCount: 0,
      };
    }

    // Add current usage to history
    this.rateLimitData[key].usageHistory.push(now);
    this.rateLimitData[key].totalCount =
      (this.rateLimitData[key].totalCount || 0) + 1;
    this.rateLimitData[key].lastUsage = now;

    // Clean old entries (keep only last 24 hours for efficiency)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    this.rateLimitData[key].usageHistory = this.rateLimitData[
      key
    ].usageHistory.filter((timestamp) => timestamp > oneDayAgo);

    this.saveRateLimitData();
  }

  // UPDATED: Get time until next usage is allowed
  getCooldownTimeRemaining(identifier, operation = "analyze") {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const key = `${identifier}_${operation}`;

    if (!this.rateLimitData[key] || !this.rateLimitData[key].usageHistory) {
      return 0;
    }

    const limits = this.getOperationLimits(operation);
    const recentUsages = this.rateLimitData[key].usageHistory.filter(
      (timestamp) => now - timestamp < oneHour
    );

    if (recentUsages.length < limits.count) {
      return 0; // No cooldown needed
    }

    // Find the oldest usage in the current hour window
    const oldestUsage = Math.min(...recentUsages);
    const timeWhenOldestExpires = oldestUsage + oneHour;
    const remainingTime = Math.max(0, timeWhenOldestExpires - now);

    return Math.ceil(remainingTime / (1000 * 60)); // Return minutes
  }

  // UPDATED: Clean up expired rate limit data
  cleanupExpiredRateLimits() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    Object.keys(this.rateLimitData).forEach((key) => {
      const data = this.rateLimitData[key];

      if (data.usageHistory) {
        // Clean old usage history entries
        const originalLength = data.usageHistory.length;
        data.usageHistory = data.usageHistory.filter(
          (timestamp) => now - timestamp < twentyFourHours
        );

        // If no recent usage, remove the entire entry
        if (data.usageHistory.length === 0) {
          delete this.rateLimitData[key];
          cleanedCount++;
        } else if (data.usageHistory.length < originalLength) {
          cleanedCount++;
        }
      } else if (data.lastUsage && now - data.lastUsage > twentyFourHours) {
        // Legacy cleanup for old format
        delete this.rateLimitData[key];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      this.saveRateLimitData();
      console.log(`🧹 Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  // UPDATED: Get usage statistics with current hour focus
  getUsageStats(identifier) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const stats = {
      analyze: {
        currentHour: this.getUsageCount(identifier, "analyze", oneHour),
        limit: this.getOperationLimits("analyze").count,
        remaining: Math.max(
          0,
          this.getOperationLimits("analyze").count -
            this.getUsageCount(identifier, "analyze", oneHour)
        ),
      },
      tailor: {
        currentHour: this.getUsageCount(identifier, "tailor", oneHour),
        limit: this.getOperationLimits("tailor").count,
        remaining: Math.max(
          0,
          this.getOperationLimits("tailor").count -
            this.getUsageCount(identifier, "tailor", oneHour)
        ),
      },
      suggestions: {
        currentHour: this.getUsageCount(identifier, "suggestions", oneHour),
        limit: this.getOperationLimits("suggestions").count,
        remaining: Math.max(
          0,
          this.getOperationLimits("suggestions").count -
            this.getUsageCount(identifier, "suggestions", oneHour)
        ),
      },
    };

    return stats;
  }
}

module.exports = new RateLimitService();
