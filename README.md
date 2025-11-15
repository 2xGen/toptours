# TopTours AI - Smart Travel Platform

A modern React-based travel platform that helps users discover and book tours worldwide using the Viator API.

## Features

- 🎯 AI-powered tour recommendations
- 🌍 Worldwide tour search
- 💫 Modern, responsive design
- ⚡ Fast search results
- 📱 Mobile-friendly interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Viator API

1. Get your Viator API key from [Viator Partner Portal](https://partners.viator.com/)
2. Open `api/config.php` and replace `your_viator_api_key_here` with your actual API key

### 3. Start Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## Deployment to Hostinger

### 1. Build the React App

```bash
npm run build
```

This creates a `dist` folder with your production-ready files.

### 2. Upload to Hostinger

1. **Upload React files**: Upload the contents of the `dist` folder to your Hostinger public_html directory
2. **Upload PHP files**: Upload the `api` folder to your Hostinger public_html directory
3. **Configure API key**: Edit `api/config.php` on your server and add your Viator API key

### 3. File Structure on Hostinger

```
public_html/
├── index.html          # React app entry point
├── assets/             # React build assets
├── api/
│   ├── config.php      # API configuration
│   └── viator-search.php # API endpoint
└── ...                 # Other React files
```

### 4. Test Your Site

Your site should now be live at your Hostinger domain with working tour search functionality!

## How It Works

1. **Search**: Enter a destination in the hero search bar
2. **API Call**: React app calls your PHP endpoint (`/api/internal/viator-search.php`)
3. **PHP Proxy**: PHP file calls Viator API with your API key
4. **Results**: Tour data is returned and displayed in your React app
5. **Book**: Click "View Details" to go to Viator's booking page

## API Integration

The platform uses a PHP proxy to call Viator's Free Text Search API. This approach:

- ✅ Avoids CORS issues
- ✅ Keeps your API key secure on the server
- ✅ Works with traditional hosting like Hostinger
- ✅ No additional services or subscriptions needed

### Architecture

```
React App (Frontend) → PHP API (Backend) → Viator API
```

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Backend**: PHP (API proxy)
- **API**: Viator Partner API

## Project Structure

```
src/
├── components/
│   ├── home/          # Home page components
│   ├── ui/            # Reusable UI components
│   ├── Navigation.jsx # Site navigation
│   └── Footer.jsx     # Site footer
├── pages/
│   ├── Home.jsx       # Home page
│   ├── Results.jsx    # Search results page
│   └── ...           # Other pages
├── data/
│   └── homeData.js    # Static content data
api/
├── config.php         # API configuration
└── viator-search.php  # API endpoint
```

## Configuration

### API Key Setup

1. Edit `api/config.php`
2. Replace `your_viator_api_key_here` with your actual Viator API key
3. Save the file

### Environment Variables

- No environment variables needed for Hostinger deployment
- API key is stored directly in `api/config.php`

## Troubleshooting

### API Key Issues
- Verify your API key is valid and active
- Check that the key is correctly set in `api/config.php`
- Ensure the key has the correct permissions

### CORS Issues
- The PHP proxy should handle CORS automatically
- If you encounter issues, check that `api/viator-search.php` is accessible

### File Permissions
- Ensure PHP files have proper permissions (usually 644)
- Check that your hosting supports PHP

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 