import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compresses an image file using Sharp with high-quality settings
 * @param {string} imagePath - Full path to the image file
 * @returns {Promise<{success: boolean, originalSize?: number, newSize?: number, savings?: number, error?: string}>}
 */
export async function compressImage(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return { success: false, error: 'File does not exist' };
    }

    // Get file stats
    const stats = fs.statSync(imagePath);
    const originalSize = stats.size;
    const fileExtension = path.extname(imagePath).toLowerCase();

    // Skip if file is already small (< 500KB)
    if (originalSize < 500 * 1024) {
      return {
        success: true,
        skipped: true,
        reason: 'File already small',
        originalSize,
        newSize: originalSize,
        savings: 0
      };
    }

    // Check if file was recently modified (within last 5 minutes) - likely already processed
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (stats.mtimeMs > fiveMinutesAgo && originalSize < 2 * 1024 * 1024) {
      return {
        success: true,
        skipped: true,
        reason: 'Recently modified and small',
        originalSize,
        newSize: originalSize,
        savings: 0
      };
    }

    // Read the image
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create Sharp instance
    let sharpInstance = sharp(imageBuffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Determine compression settings based on format
    let compressedBuffer;
    
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        // JPEG: Quality 85 with mozjpeg optimization
        compressedBuffer = await sharpInstance
          .jpeg({
            quality: 85,
            mozjpeg: true,
            trellisQuantisation: true,
            overshootDeringing: true
          })
          .toBuffer();
        break;
        
      case '.png':
        // PNG: Compression level 9 with adaptive filtering
        compressedBuffer = await sharpInstance
          .png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: metadata.hasAlpha ? false : true
          })
          .toBuffer();
        break;
        
      case '.webp':
        // WebP: Quality 85
        compressedBuffer = await sharpInstance
          .webp({
            quality: 85
          })
          .toBuffer();
        break;
        
      default:
        // For other formats, try to convert to JPEG
        compressedBuffer = await sharpInstance
          .jpeg({
            quality: 85,
            mozjpeg: true
          })
          .toBuffer();
    }
    
    const newSize = compressedBuffer.length;
    
    // Only replace if we actually saved space (at least 5% reduction)
    const savings = originalSize - newSize;
    const savingsPercent = (savings / originalSize) * 100;
    
    if (savingsPercent < 5) {
      return {
        success: true,
        skipped: true,
        reason: 'Compression savings too small',
        originalSize,
        newSize: originalSize,
        savings: 0
      };
    }
    
    // Write compressed image back to original location
    fs.writeFileSync(imagePath, compressedBuffer);
    
    return {
      success: true,
      originalSize,
      newSize,
      savings,
      savingsPercent: savingsPercent.toFixed(2)
    };
    
  } catch (error) {
    console.error(`Error compressing image ${imagePath}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if a file is an image based on extension
 * @param {string} filePath - Path to the file
 * @returns {boolean}
 */
export function isImageFile(filePath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
}
