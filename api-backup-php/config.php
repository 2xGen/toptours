<?php
// Viator API Configuration
// 
// OPTION 1: Set your API key directly here (replace the placeholder)
define('VIATOR_API_KEY', 'your_viator_api_key_here');

// OPTION 2: Create a .env file in the api folder with: VIATOR_API_KEY=your_actual_key_here
// The API will automatically read from api/.env if it exists

// OPTION 3: Use environment variable if your hosting supports it
// define('VIATOR_API_KEY', $_ENV['VIATOR_API_KEY'] ?? 'your_viator_api_key_here');

// To get your Viator API key:
// 1. Go to https://www.viator.com/partner/
// 2. Sign up for a partner account
// 3. Get your API key from the partner dashboard

// OpenAI API Configuration
// 
// OPTION 1: Set your OpenAI API key directly here (replace the placeholder)
define('OPENAI_API_KEY', 'your_openai_api_key_here');

// OPTION 2: Create a .env file in the api folder with: OPENAI_API_KEY=your_openai_api_key_here
// The API will automatically read from api/.env if it exists

// OPTION 3: Use environment variable if your hosting supports it
// define('OPENAI_API_KEY', $_ENV['OPENAI_API_KEY'] ?? 'your_openai_api_key_here');

// OpenAI Model Configuration
define('OPENAI_MODEL', 'gpt-4o-mini'); // GPT-4.1 nano equivalent (fastest, most cost-effective)

// To get your OpenAI API key:
// 1. Go to https://platform.openai.com/api-keys
// 2. Sign up for an OpenAI account
// 3. Create a new API key
