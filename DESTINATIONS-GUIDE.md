# Adding New Destinations Guide

This guide explains how to add new destinations to TopTours.ai using the Aruba page as a template.

## Quick Start

To add a new destination, use the automated script:

```bash
node scripts/add-destination.js "Destination Name" "Image URL" "Category"
```

### Examples:

```bash
# Add Paris
node scripts/add-destination.js "Paris" "https://example.com/paris.jpg" "Europe"

# Add Tokyo
node scripts/add-destination.js "Tokyo" "https://example.com/tokyo.jpg" "Asia-Pacific"

# Add New York
node scripts/add-destination.js "New York" "https://example.com/newyork.jpg" "North America"
```

## Available Categories

- Europe
- North America
- Caribbean
- Asia-Pacific
- Africa
- South America
- Other

## What the Script Does

1. **Generates destination data** based on the Aruba template
2. **Updates destinationsData.js** with the new destination
3. **Updates .htaccess files** to add routing for the new destination
4. **Provides next steps** for building and testing

## After Adding a Destination

1. **Build the project** to generate static HTML files:
   ```bash
   npm run build
   ```

2. **Test the new page** at:
   ```
   http://localhost:5173/[destination-id]
   ```

3. **Customize the content** in `src/data/destinationsData.js` if needed

## Generated Files

The system creates:

- **React component data** in `src/data/destinationsData.js`
- **Static HTML file** in `dist/destinations/[destination-id].html` (for Open Graph)
- **Routing rules** in `.htaccess` and `dist/.htaccess`

## Manual Customization

After running the script, you can customize the destination data in `src/data/destinationsData.js`:

- Update descriptions and content
- Add specific tour categories
- Modify SEO keywords
- Add destination-specific highlights
- Update weather and travel information

## File Structure

```
src/
├── data/
│   └── destinationsData.js    # All destination data
├── pages/
│   └── DestinationDetail.jsx  # Template component
dist/
├── destinations/
│   ├── aruba.html            # Static HTML for Open Graph
│   ├── paris.html            # (generated)
│   └── tokyo.html            # (generated)
scripts/
├── add-destination.js        # Script to add destinations
└── generate-static.js        # Script to generate HTML files
```

## Open Graph Support

Each destination gets a static HTML file with proper Open Graph meta tags for social media sharing. The files are automatically generated when you run `npm run build`.

## Troubleshooting

- **Script fails**: Make sure you're in the project root directory
- **Page not found**: Run `npm run build` after adding a destination
- **Image not loading**: Check that the image URL is accessible
- **Routing issues**: Verify that the .htaccess files were updated correctly 