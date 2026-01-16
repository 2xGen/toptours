/**
 * Simple, fast destination ID to name lookup
 * This is a lightweight alternative to importing the entire 30MB JSON file
 * 
 * Usage: import { getDestinationNameById } from '@/lib/destinationIdLookup';
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy load the JSON file only when needed
let destinationsCache = null;

function loadDestinationsCache() {
  if (!destinationsCache) {
    try {
      const jsonPath = path.join(process.cwd(), 'src', 'data', 'viatorDestinationsClassified.json');
      const fileContent = fs.readFileSync(jsonPath, 'utf8');
      destinationsCache = JSON.parse(fileContent);
    } catch (error) {
      destinationsCache = [];
    }
  }
  return destinationsCache;
}

export async function getDestinationNameById(destinationId) {
  if (!destinationId) {
    return null;
  }
  
  try {
    // Load the JSON file synchronously (server-side only)
    const destinations = loadDestinationsCache();
    
    if (!destinations || destinations.length === 0) {
      return null;
    }
    
    // Normalize the search ID
    const searchId = destinationId.toString().replace(/^d/i, '');
    const searchIdNum = parseInt(searchId, 10);
    
    // Silent lookup - no need to log every search
    
    // Direct search - try multiple formats
    const destination = destinations.find((dest) => {
      const destId = dest.destinationId?.toString() || '';
      const destIdNum = parseInt(destId, 10);
      
      // Exact string match
      if (destId === searchId) return true;
      // Without 'd' prefix
      if (destId === destinationId.toString().replace(/^d/i, '')) return true;
      // Numeric match (most reliable)
      if (!isNaN(destIdNum) && !isNaN(searchIdNum) && destIdNum === searchIdNum) return true;
      
      return false;
    });
    
    if (destination && destination.destinationName) {
      return { destinationName: destination.destinationName };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

