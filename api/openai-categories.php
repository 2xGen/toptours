<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include configuration
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the OpenAI API key from .env file
$env_file = __DIR__ . '/.env';
$openai_api_key = '';

if (file_exists($env_file)) {
    $env_content = file_get_contents($env_file);
    $lines = explode("\n", $env_content);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, 'OPENAI_API_KEY=') === 0) {
            $openai_api_key = substr($line, strlen('OPENAI_API_KEY='));
            break;
        }
    }
}

// Fallback to config if .env doesn't exist or key not found
if (empty($openai_api_key)) {
    $openai_api_key = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : '';
}

if (empty($openai_api_key)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'OpenAI API key not configured',
        'message' => 'Please configure your OpenAI API key using one of these methods:',
        'options' => [
            '1. Edit api/config.php and add: define("OPENAI_API_KEY", "your_openai_api_key_here");',
            '2. Create api/.env file with: OPENAI_API_KEY=your_openai_api_key_here',
            '3. Get your OpenAI API key from: https://platform.openai.com/api-keys'
        ]
    ]);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['destination'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Destination is required']);
    exit();
}

$destination = $input['destination'];

// Create a prompt for OpenAI to generate popular tour categories
$prompt = "Generate 6 popular tour categories for {$destination}. These should be specific search terms that travelers would use to find tours.

Requirements:
- Create exactly 6 categories
- Each category should be 2-4 words max
- Focus on the most popular and unique experiences for this destination
- Use terms that people actually search for
- Include a mix of activities, cultural experiences, and adventures
- Make them specific to {$destination}
- IMPORTANT: Do NOT include the destination name in the category - it will be added automatically
- Categories should be generic activity types that work well with the destination

Format: Return only the 6 categories, one per line, no numbering or bullets.

Examples for different destinations:
For Rome: food tours, colosseum tours, vatican tours, walking tours, cooking classes, day trips
For Aruba: snorkeling tours, sunset cruises, jeep tours, horseback riding, water sports, island tours

Note: The destination name will be automatically added to each category, so return only the activity type.";

// Prepare the request to OpenAI API
$url = 'https://api.openai.com/v1/chat/completions';
$data = [
    'model' => defined('OPENAI_MODEL') ? OPENAI_MODEL : 'gpt-4o-mini',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'You are a travel expert. Generate popular tour categories for specific destinations that travelers actually search for.'
        ],
        [
            'role' => 'user',
            'content' => $prompt
        ]
    ],
    'max_tokens' => 150,
    'temperature' => 0.7
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openai_api_key
        ],
        'content' => json_encode($data),
        'timeout' => 30
    ]
];

$context = stream_context_create($options);

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data from OpenAI API');
    }
    
    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from OpenAI API: ' . json_last_error_msg());
    }
    
    // Extract the generated categories
    if (isset($result['choices'][0]['message']['content'])) {
        $categories = trim($result['choices'][0]['message']['content']);
        // Split by lines and clean up
        $categoryList = array_filter(array_map('trim', explode("\n", $categories)));
        
        // Ensure we have exactly 6 categories
        $categoryList = array_slice($categoryList, 0, 6);
        
        echo json_encode([
            'success' => true,
            'categories' => $categoryList,
            'usage' => $result['usage'] ?? null
        ]);
    } else {
        throw new Exception('No categories generated in OpenAI response');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'OpenAI API request failed',
        'message' => $e->getMessage(),
        'debug' => [
            'api_key_length' => strlen($openai_api_key),
            'destination' => $destination,
            'url' => $url
        ]
    ]);
}
?> 