import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// List of old regional sitemap files to remove
const oldSitemapFiles = [
  'sitemap-guides-middle-east.xml',
  'sitemap-guides-asia-pacific.xml',
  'sitemap-guides-south-america.xml',
  'sitemap-guides-africa.xml',
  'sitemap-guides-north-america.xml',
  'sitemap-guides-caribbean.xml',
  'sitemap-guides-europe.xml',
];

console.log('🧹 Cleaning up old regional guide sitemaps...\n');

let deletedCount = 0;
let notFoundCount = 0;

oldSitemapFiles.forEach((filename) => {
  const filePath = path.join(publicDir, filename);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${filename}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Error deleting ${filename}:`, error.message);
    }
  } else {
    console.log(`⚠️  Not found: ${filename} (already deleted or never existed)`);
    notFoundCount++;
  }
});

console.log(`\n✨ Cleanup complete!`);
console.log(`   ✅ Deleted: ${deletedCount} files`);
console.log(`   ⚠️  Not found: ${notFoundCount} files`);

