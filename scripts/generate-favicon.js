import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateFavicon = () => {
  // Create a simple SVG favicon that can be converted to ICO
  const svgFavicon = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 2C23.732 2 30 8.268 30 16C30 23.732 23.732 30 16 30C8.268 30 2 23.732 2 16C2 8.268 8.268 2 16 2Z" fill="url(#gradient0)"/>
<path d="M16 6C18.2091 6 20 8.2091 20 10C20 11.7909 18.2091 14 16 14C13.7909 14 12 11.7909 12 10C12 8.2091 13.7909 6 16 6Z" fill="white"/>
<path d="M16 8C17.1046 8 18 9.10457 18 10C18 10.8954 17.1046 12 16 12C14.8954 12 14 10.8954 14 10C14 9.10457 14.8954 8 16 8Z" fill="#FF6B00"/>
<path d="M16 4L18 10L16 16L14 10L16 4Z" fill="white"/>
<defs>
<linearGradient id="gradient0" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
<stop stop-color="#FF6B00"/>
<stop offset="1" stop-color="#FF8000"/>
</linearGradient>
</defs>
</svg>`;

  // Write SVG favicon
  const distPath = path.join(__dirname, '../dist');
  const svgPath = path.join(distPath, 'favicon.svg');
  fs.writeFileSync(svgPath, svgFavicon);
  
  // Create a simple ICO file placeholder (you'll need to convert SVG to ICO manually)
  const icoPlaceholder = `# This is a placeholder for favicon.ico
# To create a proper ICO file:
# 1. Convert the SVG to PNG (16x16, 32x32, 48x48)
# 2. Convert PNG to ICO format
# 3. Replace this file with the actual ICO file
# 
# For now, the SVG favicon and meta tags will work for most browsers`;
  
  const icoPath = path.join(distPath, 'favicon.ico');
  fs.writeFileSync(icoPath, icoPlaceholder);
  
  console.log(`✅ Favicon files generated!`);
  console.log(`📁 SVG: /dist/favicon.svg`);
  console.log(`📁 ICO: /dist/favicon.ico (placeholder)`);
  console.log(`💡 To create proper ICO: Convert SVG to PNG then to ICO format`);
};

// Run the generation
generateFavicon(); 