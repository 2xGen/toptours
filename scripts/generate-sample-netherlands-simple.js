// Simple script to generate sample Netherlands destinations
// This modifies the main script to only process Netherlands cities

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// First, let's create a filtered version of the destinations
// We'll modify the main script temporarily

console.log('📝 This will generate sample Netherlands destinations...');
console.log('   Run: node scripts/generate-destination-full-content.js');
console.log('   Then manually filter for Netherlands in the output file.\n');
console.log('   OR we can create a modified version...\n');

// Actually, let's just tell the user to run the main script with a filter
// Or create a wrapper that filters Netherlands destinations

