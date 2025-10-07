import { getAllDestinations } from '../src/data/destinationsData.js';
import fs from 'fs';

// Convert React data to PHP format
const destinations = getAllDestinations();
const phpData = {};

destinations.forEach(dest => {
    phpData[dest.id] = {
        title: dest.seo.title,
        description: dest.seo.description,
        keywords: dest.seo.keywords,
        image: dest.imageUrl
    };
});

// Generate PHP array
let phpCode = '<?php\nfunction getDestinationData($destination_id) {\n';
phpCode += '    $destinations = [\n';
Object.keys(phpData).forEach(key => {
    const dest = phpData[key];
    phpCode += `        '${key}' => [\n`;
    phpCode += `            'title' => '${dest.title.replace(/'/g, "\\'")}',\n`;
    phpCode += `            'description' => '${dest.description.replace(/'/g, "\\'")}',\n`;
    phpCode += `            'keywords' => '${dest.keywords.replace(/'/g, "\\'")}',\n`;
    phpCode += `            'image' => '${dest.image}'\n`;
    phpCode += `        ],\n`;
});
phpCode += '    ];\n';
phpCode += '    return $destinations[$destination_id] ?? null;\n';
phpCode += '}\n?>';

// Write to PHP file
fs.writeFileSync('./api/destinations-data.php', phpCode);
console.log('✅ Destinations data synced to PHP');
console.log('📝 Available destinations:', Object.keys(phpData).join(', ')); 