import { destinations } from '../src/data/destinationsData.js';

const asiaPacific = destinations
  .filter(d => d.category === 'Asia-Pacific')
  .map(d => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName,
    country: d.country
  }));

console.log(`🌏 Asia-Pacific Destinations (${asiaPacific.length} total):\n`);
console.log(JSON.stringify(asiaPacific, null, 2));

