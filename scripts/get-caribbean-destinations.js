import { destinations } from '../src/data/destinationsData.js';

const done = ['aruba', 'jamaica', 'curacao', 'nassau', 'punta-cana'];
const caribbean = destinations
  .filter(d => d.category === 'Caribbean' && !done.includes(d.id))
  .map(d => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName,
    country: d.country
  }));

console.log('🌴 Remaining Caribbean Destinations:');
console.log(JSON.stringify(caribbean, null, 2));

