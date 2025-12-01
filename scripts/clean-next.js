import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextDir = path.join(__dirname, '../.next');

// Helper to wait a bit and retry (for OneDrive file locking issues)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function cleanNextDir() {
  if (!fs.existsSync(nextDir)) {
    console.log('ℹ️  .next directory does not exist, skipping cleanup');
    return;
  }

  console.log('🧹 Cleaning .next directory...');
  
  // Try multiple times with delays (OneDrive can lock files)
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      // On Windows, sometimes need to retry due to file locks
      if (attempts > 0) {
        console.log(`   Retry attempt ${attempts + 1}/${maxAttempts}...`);
        await wait(1000 * attempts); // Wait longer on each retry
      }
      
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ .next directory cleaned');
      return;
    } catch (error) {
      attempts++;
      if (error.code === 'EBUSY' || error.code === 'EACCES' || error.code === 'EPERM') {
        if (attempts < maxAttempts) {
          console.log(`   ⚠️  File locked (OneDrive sync?), retrying...`);
          continue;
        } else {
          console.error('⚠️  Could not clean .next directory - files are locked (likely OneDrive sync)');
          console.error('   💡 Tip: Exclude .next folder from OneDrive sync or pause OneDrive while developing');
          // Don't throw - allow dev server to start anyway
          return;
        }
      } else {
        console.error('⚠️  Error cleaning .next directory:', error.message);
        // Don't throw - allow dev server to start anyway
        return;
      }
    }
  }
}

try {
  await cleanNextDir();
} catch (error) {
  console.error('⚠️  Unexpected error:', error.message);
  // Don't exit with error - allow dev server to start anyway
}

