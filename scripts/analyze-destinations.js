import { destinations } from '../src/data/destinationsData.js';

const categories = {};
destinations.forEach(d => {
  categories[d.category] = (categories[d.category] || 0) + 1;
});

console.log('📊 Destination Categories:');
Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} destinations`);
  });

console.log(`\n📈 Total Destinations: ${destinations.length}`);

const done = ['aruba', 'jamaica', 'curacao', 'nassau', 'punta-cana'];
const doneDests = destinations.filter(d => done.includes(d.id));
const remaining = destinations.filter(d => !done.includes(d.id));

console.log(`\n✅ Done: ${doneDests.length} destinations`);
console.log(`⏳ Remaining: ${remaining.length} destinations`);

console.log(`\n🌴 Caribbean Destinations:`);
const caribbean = destinations.filter(d => d.category === 'Caribbean' && !done.includes(d.id));
console.log(`  Remaining Caribbean: ${caribbean.length}`);
caribbean.slice(0, 10).forEach(d => console.log(`    - ${d.name} (${d.id})`));
if (caribbean.length > 10) console.log(`    ... and ${caribbean.length - 10} more`);

console.log(`\n🌍 Top Categories (excluding Caribbean):`);
const otherCategories = Object.entries(categories)
  .filter(([cat]) => cat !== 'Caribbean')
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
otherCategories.forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} destinations`);
});

