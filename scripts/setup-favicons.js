/**
 * Setup Favicons Script
 * 
 * This script helps set up favicon files for TopTours.ai
 * 
 * Requirements:
 * - Node.js
 * - sharp package (npm install sharp)
 * 
 * Usage:
 * node scripts/setup-favicons.js
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// File mappings: source file -> target file
const fileMappings = [
  {
    source: 'Logo ico.ico',
    target: 'favicon.ico'
  },
  {
    source: 'logo 512 x 512 png.png',
    target: 'apple-touch-icon.png' // Will use 512x512 as apple-touch-icon (browsers will scale)
  }
];

console.log('📦 Setting up favicon files...\n');

// Copy/rename files
fileMappings.forEach(({ source, target }) => {
  const sourcePath = path.join(publicDir, source);
  const targetPath = path.join(publicDir, target);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${source} → ${target}`);
    } catch (error) {
      console.error(`❌ Error copying ${source}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Source file not found: ${source}`);
  }
});

console.log('\n📝 Next steps:');
console.log('1. Generate favicon-16x16.png and favicon-32x32.png from your 512x512 PNG');
console.log('2. You can use an online tool like:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://favicon.io/favicon-converter/');
console.log('3. Or use ImageMagick:');
console.log('   magick "logo 512 x 512 png.png" -resize 16x16 favicon-16x16.png');
console.log('   magick "logo 512 x 512 png.png" -resize 32x32 favicon-32x32.png');
console.log('\n✨ Done!');

