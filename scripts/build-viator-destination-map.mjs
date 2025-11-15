import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { destinations } from '../src/data/destinationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.viator.com/partner/destinations';
const DEFAULT_API_KEY = '282a363f-5d60-456a-a6a0-774ec4832b07';

const normalize = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');

const fetchDestinations = async () => {
  const apiKey = process.env.VIATOR_API_KEY || DEFAULT_API_KEY;

  const response = await fetch(API_URL, {
    headers: {
      'exp-api-key': apiKey,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Viator destinations: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.destinations || [];
};

const findBestMatch = (siteDestination, viatorDestinations) => {
  const siteNames = [
    siteDestination.fullName,
    siteDestination.name,
    siteDestination.country,
    siteDestination.category,
  ]
    .filter(Boolean)
    .map(normalize)
    .filter(Boolean);

  for (const candidate of viatorDestinations) {
    const candidateName = normalize(candidate.name);
    if (!candidateName) continue;

    if (siteNames.some((name) => candidateName === name)) {
      return candidate;
    }
  }

  // Fallback to partial matches
  for (const candidate of viatorDestinations) {
    const candidateName = normalize(candidate.name);
    if (!candidateName) continue;

    if (siteNames.some((name) => candidateName.includes(name) || name.includes(candidateName))) {
      return candidate;
    }
  }

  return null;
};

const buildMaps = async () => {
  const viatorDestinations = await fetchDestinations();

  const slugToId = {};
  const refToSlug = {};
  const unmatched = [];

  destinations.forEach((dest) => {
    const match = findBestMatch(dest, viatorDestinations);
    if (match?.destinationId !== undefined) {
      const destinationId = String(match.destinationId);
      slugToId[dest.id] = destinationId;
      refToSlug[destinationId] = dest.id;
    } else {
      unmatched.push(dest.id);
    }
  });

  const filePath = path.resolve(__dirname, '../src/data/viatorDestinationMap.js');
  const fileContents = `export const slugToViatorId = ${JSON.stringify(slugToId, null, 2)};

export const viatorRefToSlug = Object.entries(slugToViatorId).reduce((acc, [slug, viatorId]) => {
  if (viatorId) {
    acc[viatorId] = slug;
    acc[\`d\${viatorId}\`] = slug;
  }
  return acc;
}, {});

`;

  fs.writeFileSync(filePath, fileContents, 'utf8');

  if (unmatched.length > 0) {
    console.warn('Unmatched destinations:', unmatched);
  } else {
    console.log('All destinations matched successfully.');
  }
};

buildMaps().catch((error) => {
  console.error(error);
  process.exit(1);
});

