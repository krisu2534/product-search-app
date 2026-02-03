import express from 'express';
import cors from 'cors';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import { startImageWatcher } from './utils/imageWatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Read Excel file and parse products
function readProducts() {
  try {
    const excelPath = path.join(__dirname, '..', 'products.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Helper function to automatically append .jpg extension to image names
    // Removes any existing extension first, then adds .jpg
    const ensurePhotoExtension = (filename) => {
      if (!filename || filename.length === 0) return filename;
      const trimmed = filename.trim();
      
      // Remove any existing extension (everything after the last dot)
      const nameWithoutExtension = trimmed.replace(/\.[a-zA-Z0-9]+$/, '');
      
      // Always append .jpg
      return nameWithoutExtension + '.jpg';
    };

    // Process products: split Photo column if it contains commas
    const products = data.map(product => {
      if (product.Photo && typeof product.Photo === 'string') {
        // Split by comma (and semicolon as alternative separator)
        // Trim whitespace, remove empty strings, and ensure extensions
        const photos = product.Photo
          .split(/[,;]/)
          .map(photo => ensurePhotoExtension(photo))
          .filter(photo => photo && photo.length > 0);
        product.Photo = photos;
      } else if (product.Photo) {
        // If it's not a string, convert to array and clean
        const photoStr = ensurePhotoExtension(String(product.Photo));
        product.Photo = photoStr.length > 0 ? [photoStr] : [];
      } else {
        // If no photo, set to empty array
        product.Photo = [];
      }
      return product;
    });
    
    return products;
  } catch (error) {
    console.error('Error reading products.xlsx:', error);
    return [];
  }
}

// API endpoint to get all products
app.get('/api/products', (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Optional: Manual trigger for image compression
app.post('/api/compress-images', async (req, res) => {
  try {
    const { compressImage } = await import('./utils/imageCompressor.js');
    const imagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      return res.status(404).json({ error: 'Images directory not found' });
    }

    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => {
      const filePath = path.join(imagesDir, file);
      return fs.statSync(filePath).isFile() && 
             ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase());
    });

    res.json({ 
      message: 'Compression started',
      filesFound: imageFiles.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from frontend/dist (production build)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

// Serve images - try dist/images first (Vite copies public to dist), then fallback to public/images
const distImagesPath = path.join(frontendDistPath, 'images');
const publicImagesPath = path.join(frontendPublicPath, 'images');

if (fs.existsSync(distImagesPath)) {
  // Images are in dist/images (after Vite build)
  app.use('/images', express.static(distImagesPath));
} else if (fs.existsSync(publicImagesPath)) {
  // Fallback to public/images if dist doesn't exist
  app.use('/images', express.static(publicImagesPath));
}

// Serve built frontend files
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // Catch all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Try to load HTTPS certificates
const certPath = path.join(__dirname, '..', 'certs', 'cert.pem');
const keyPath = path.join(__dirname, '..', 'certs', 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  // HTTPS mode
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on HTTPS://0.0.0.0:${PORT}`);
    console.log(`Accessible on your network at https://192.168.1.145:${PORT}`);
    console.log(`Local access: https://localhost:${PORT}`);
    
    // Start image watcher (only if enabled or in production)
    const enableWatcher = process.env.ENABLE_IMAGE_WATCHER === 'true' || 
                         process.env.NODE_ENV === 'production' ||
                         !process.env.NODE_ENV; // Default to enabled
    
    if (enableWatcher) {
      const imagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images');
      startImageWatcher(imagesDir);
    }
  });
} else {
  // HTTP mode (fallback)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible on your network at http://192.168.1.145:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`\n⚠️  HTTPS certificates not found. Clipboard copy may not work over network.`);
    console.log(`   To enable HTTPS, run: npm run setup-https`);
    
    // Start image watcher (only if enabled or in production)
    const enableWatcher = process.env.ENABLE_IMAGE_WATCHER === 'true' || 
                         process.env.NODE_ENV === 'production' ||
                         !process.env.NODE_ENV; // Default to enabled
    
    if (enableWatcher) {
      const imagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images');
      startImageWatcher(imagesDir);
    }
  });
}
