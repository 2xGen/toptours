#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting TopTours.ai build process...');

try {
  // Step 1: Sync destinations
  console.log('📊 Syncing destinations...');
  execSync('node scripts/sync-destinations.js', { stdio: 'inherit' });

  // Step 2: Build Vite app
  console.log('⚡ Building Vite app...');
  execSync('vite build', { stdio: 'inherit' });

  // Step 3: Generate static HTML files
  console.log('📄 Generating static HTML files...');
  execSync('node scripts/generate-static.js', { stdio: 'inherit' });

  // Step 4: Generate sitemap
  console.log('🗺️ Generating sitemap...');
  execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });

  // Step 5: Generate favicon
  console.log('🎨 Generating favicon...');
  execSync('node scripts/generate-favicon.js', { stdio: 'inherit' });

  // Step 6: Copy API files (cross-platform)
  console.log('📁 Copying API files...');
  const distApiDir = path.join(__dirname, '..', 'dist', 'api');
  const apiDir = path.join(__dirname, '..', 'api');
  
  // Create api directory in dist if it doesn't exist
  if (!fs.existsSync(distApiDir)) {
    fs.mkdirSync(distApiDir, { recursive: true });
  }

  // Copy all PHP files from api to dist/api
  const apiFiles = fs.readdirSync(apiDir).filter(file => file.endsWith('.php'));
  apiFiles.forEach(file => {
    const srcPath = path.join(apiDir, file);
    const destPath = path.join(distApiDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✅ Copied ${file}`);
  });

  // Step 7: Copy .htaccess (cross-platform)
  console.log('⚙️ Copying .htaccess...');
  const htaccessSrc = path.join(__dirname, '..', '.htaccess');
  const htaccessDest = path.join(__dirname, '..', 'dist', '.htaccess');
  
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, htaccessDest);
    console.log('  ✅ Copied .htaccess');
  }

  console.log('🎉 Build completed successfully!');
  console.log('📦 Ready for deployment to Vercel');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
