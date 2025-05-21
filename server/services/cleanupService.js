// server/services/cleanupService.js
const fs = require("fs");
const path = require("path");

// Upload directory path
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Get file age in hours
const getFileAgeHours = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileAgeMs = Date.now() - stats.mtimeMs;
  return fileAgeMs / (1000 * 60 * 60); // Convert ms to hours
};

// Clean up files older than specified hours
const cleanupOldFiles = (maxAgeHours = 24) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log("⚠️ Uploads directory does not exist");
      return { deleted: 0, error: false };
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_DIR, file);

      try {
        // Skip directories and non-files
        if (!fs.statSync(filePath).isFile()) {
          return;
        }

        const fileAgeHours = getFileAgeHours(filePath);

        if (fileAgeHours > maxAgeHours) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(
            `✅ Deleted old file: ${file} (Age: ${fileAgeHours.toFixed(
              2
            )} hours)`
          );
        }
      } catch (fileError) {
        console.error(`❌ Error processing file: ${file}`, fileError);
      }
    });

    console.log(`✅ Cleanup complete: ${deletedCount} files deleted`);
    return { deleted: deletedCount, error: false };
  } catch (error) {
    console.error("❌ Error during file cleanup:", error);
    return { deleted: 0, error: true, message: error.message };
  }
};

// Schedule cleanup to run at regular intervals
const scheduleCleanup = (intervalHours = 1, maxAgeHours = 24) => {
  console.log(
    `🕒 Scheduling file cleanup every ${intervalHours} hours for files older than ${maxAgeHours} hours`
  );

  // Run cleanup immediately on startup
  cleanupOldFiles(maxAgeHours);

  // Schedule regular cleanup
  setInterval(() => {
    console.log("🕒 Running scheduled file cleanup");
    cleanupOldFiles(maxAgeHours);
  }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
};

// Get storage statistics
const getStorageStats = () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestFile: null,
        newestFile: null,
      };
    }

    const files = fs.readdirSync(UPLOADS_DIR).filter((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      return fs.statSync(filePath).isFile();
    });

    let totalSize = 0;
    let oldestTime = Date.now();
    let newestTime = 0;
    let oldestFile = null;
    let newestFile = null;

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);

      totalSize += stats.size;

      if (stats.mtimeMs < oldestTime) {
        oldestTime = stats.mtimeMs;
        oldestFile = file;
      }

      if (stats.mtimeMs > newestTime) {
        newestTime = stats.mtimeMs;
        newestFile = file;
      }
    });

    return {
      totalFiles: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      oldestFile: oldestFile
        ? {
            name: oldestFile,
            age: (Date.now() - oldestTime) / (1000 * 60 * 60), // Hours
          }
        : null,
      newestFile: newestFile
        ? {
            name: newestFile,
            age: (Date.now() - newestTime) / (1000 * 60), // Minutes
          }
        : null,
    };
  } catch (error) {
    console.error("❌ Error getting storage stats:", error);
    return { error: error.message };
  }
};

module.exports = {
  cleanupOldFiles,
  scheduleCleanup,
  getStorageStats,
};
