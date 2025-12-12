#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting TopTours.ai build process...');

// Helper function to run commands safely
function runCommand(command, description) {
  try {
    console.log(`📝 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    // Don't exit on individual script failures, continue with build
  }
}

// Helper function to copy files safely
function copyFiles(srcDir, destDir, filePattern) {
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);
    const matchingFiles = filePattern ? files.filter(file => filePattern(file)) : files;
    
    matchingFiles.forEach(file => {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied ${file}`);
    });
  } catch (error) {
    console.error(`❌ File copy failed:`, error.message);
  }
}

try {
  // Step 1: Sync destinations (optional)
  runCommand('node scripts/sync-destinations.js', 'Syncing destinations');

  // Step 2: Build Vite app (required)
  runCommand('vite build', 'Building Vite app');

  // Step 3: Generate sitemap (for SEO)
  runCommand('node scripts/generate-sitemap.js', 'Generating sitemap');
  
  // Step 3.5: Generate guides sitemap from database
  runCommand('node scripts/generate-guides-sitemap.js', 'Generating guides sitemap from database');

  // Step 4: Generate favicon
  runCommand('node scripts/generate-favicon.js', 'Generating favicon');

  // Step 5: Copy API files (cross-platform)
  console.log('📁 Copying API files...');
  const distApiDir = path.join(__dirname, '..', 'dist', 'api');
  const apiDir = path.join(__dirname, '..', 'api');
  copyFiles(apiDir, distApiDir, file => file.endsWith('.js'));

  console.log('🎉 Build completed successfully!');
  console.log('📦 Ready for deployment to Vercel');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
