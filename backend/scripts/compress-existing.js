import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compressImage, isImageFile } from '../utils/imageCompressor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compress all existing images in the images directory
 */
async function compressExistingImages() {
  const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');

  // Check if directory exists
  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Images directory does not exist: ${imagesDir}`);
    process.exit(1);
  }

  console.log(`📁 Scanning images directory: ${imagesDir}\n`);

  // Get all files in directory
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => {
    const filePath = path.join(imagesDir, file);
    return fs.statSync(filePath).isFile() && isImageFile(filePath);
  });

  if (imageFiles.length === 0) {
    console.log('No image files found in the directory.');
    return;
  }

  console.log(`Found ${imageFiles.length} image file(s) to process.\n`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  // Process each image
  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(imagesDir, filename);
    
    console.log(`[${i + 1}/${imageFiles.length}] Processing: ${filename}`);

    const result = await compressImage(filePath);

    if (result.success) {
      if (result.skipped) {
        skipped++;
        console.log(`   ⏭️  Skipped: ${result.reason}`);
        totalOriginalSize += result.originalSize;
        totalNewSize += result.originalSize;
      } else {
        processed++;
        const originalMB = (result.originalSize / (1024 * 1024)).toFixed(2);
        const newMB = (result.newSize / (1024 * 1024)).toFixed(2);
        const savingsMB = (result.savings / (1024 * 1024)).toFixed(2);
        console.log(`   ✅ Compressed: ${originalMB}MB → ${newMB}MB (saved ${savingsMB}MB, ${result.savingsPercent}%)`);
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
      }
    } else {
      failed++;
      console.log(`   ❌ Failed: ${result.error}`);
    }
    console.log('');
  }

  // Print summary
  console.log('='.repeat(50));
  console.log('📊 Compression Summary');
  console.log('='.repeat(50));
  console.log(`Total images: ${imageFiles.length}`);
  console.log(`✅ Compressed: ${processed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');
  
  const totalOriginalMB = (totalOriginalSize / (1024 * 1024)).toFixed(2);
  const totalNewMB = (totalNewSize / (1024 * 1024)).toFixed(2);
  const totalSavingsMB = ((totalOriginalSize - totalNewSize) / (1024 * 1024)).toFixed(2);
  const totalSavingsPercent = totalOriginalSize > 0 
    ? (((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100).toFixed(2)
    : '0.00';

  console.log(`Total size: ${totalOriginalMB}MB → ${totalNewMB}MB`);
  console.log(`Total savings: ${totalSavingsMB}MB (${totalSavingsPercent}%)`);
  console.log('='.repeat(50));
}

// Run the script
compressExistingImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
