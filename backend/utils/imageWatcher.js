import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compressImage, isImageFile } from './imageCompressor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track files being processed to avoid duplicate processing
const processingFiles = new Set();

/**
 * Start watching the images directory for new files
 * @param {string} imagesDir - Path to the images directory
 */
export function startImageWatcher(imagesDir) {
  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    console.log(`Images directory does not exist: ${imagesDir}`);
    return;
  }

  console.log(`📸 Image watcher started: Monitoring ${imagesDir}`);

  // Use fs.watch for file system monitoring
  const watcher = fs.watch(imagesDir, { recursive: false }, async (eventType, filename) => {
    if (!filename) return;

    const filePath = path.join(imagesDir, filename);

    // Only process on file add/rename events
    if (eventType !== 'rename') return;

    // Check if it's an image file
    if (!isImageFile(filePath)) return;

    // Skip if already processing this file
    if (processingFiles.has(filePath)) return;

    // Wait 2 seconds to ensure file is fully written
    setTimeout(async () => {
      try {
        // Check if file still exists (might have been deleted)
        if (!fs.existsSync(filePath)) return;

        // Check if it's actually a file (not a directory)
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return;

        processingFiles.add(filePath);

        console.log(`🖼️  New image detected: ${filename}`);
        
        const result = await compressImage(filePath);

        if (result.success) {
          if (result.skipped) {
            console.log(`   ⏭️  Skipped: ${filename} (${result.reason})`);
          } else {
            const originalMB = (result.originalSize / (1024 * 1024)).toFixed(2);
            const newMB = (result.newSize / (1024 * 1024)).toFixed(2);
            const savingsMB = (result.savings / (1024 * 1024)).toFixed(2);
            console.log(`   ✅ Compressed: ${filename}`);
            console.log(`      ${originalMB}MB → ${newMB}MB (saved ${savingsMB}MB, ${result.savingsPercent}%)`);
          }
        } else {
          console.log(`   ❌ Failed: ${filename} - ${result.error}`);
        }

        // Remove from processing set after a delay
        setTimeout(() => {
          processingFiles.delete(filePath);
        }, 5000);

      } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
        processingFiles.delete(filePath);
      }
    }, 2000);
  });

  // Handle watcher errors
  watcher.on('error', (error) => {
    console.error('Image watcher error:', error);
  });

  return watcher;
}
