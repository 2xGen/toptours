/**
 * Add image URLs to destinations in NEW_DESTINATIONS_TO_ADD.md
 * These destinations have images and should be prioritized
 */

const destinationImages = {
  'Anchorage': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Anchorage.png',
  'Aspen': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Aspen.png',
  'Austin': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Austin.png',
  'Boston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Boston.png',
  'Breckenridge': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Breckenridge.png',
  'Buffalo': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Buffalo.png',
  'Charleston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Charleston.png',
  'Cincinnati': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Cincinnati.png',
  'Columbus': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Columbus.png',
  'Dallas': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Dallas.png',
  'Houston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Houston.png',
  'Indianapolis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Indianapolis.png',
  'Juneau': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Juneau.png',
  'Kansas City': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Kansas%20City.png',
  'Key West': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Key%20West.png',
  'Milwaukee': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Milwaukee.png',
  'Minneapolis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Minneapolis.png',
  'Park City': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Park%20City.png',
  'Philadelphia': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Philadelphia.png',
  'Portland': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Portland.png',
  'Providence': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Providence.png',
  'San Antonio': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/San%20Antonio.png',
  'San Diego': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/san%20diego.png',
  'Savannah': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Savannah.png',
  'Scottsdale': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Scottsdale.png',
  'Phoenix': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Scottsdale.png', // Same image as Scottsdale
  'Seattle': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/seattle.png',
  'St. Louis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/St.%20Louis.png',
  'Vail': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Vail.png',
};

console.log('\n📸 Destinations with Images (28 total):\n');
console.log('━'.repeat(60));

Object.entries(destinationImages).forEach(([name, url]) => {
  console.log(`${name.padEnd(20)} ${url}`);
});

console.log('\n━'.repeat(60));
console.log('\n✅ These destinations should be prioritized for addition');
console.log('   - Images available for OG tags');
console.log('   - Images available for category guide hero images');
console.log('   - Images available for destination page hero sections');
console.log('\n');

