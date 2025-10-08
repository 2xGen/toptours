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

if (!$input || !isset($input['tourData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Tour data is required']);
    exit();
}

$tour_data = $input['tourData'];

// Create a prompt for OpenAI to generate reasons to book this tour
$prompt = "Generate exactly 3 short, exciting reasons to book this tour. Focus ONLY on the adventure and experience.

Tour: {$tour_data['title']} in {$tour_data['location']} ({$tour_data['duration']})

IMPORTANT: Do NOT mention ratings, reviews, prices, or use phrases like 'you'll love' or 'unique experience'.

Write exactly 3 reasons like this:
🔥 Feel the adrenaline rush of adventure
🌟 Create memories that last a lifetime  
🌊 Discover hidden beaches and secret spots

Focus on the adventure, excitement, and what makes this tour special!";

// Prepare the request to OpenAI API
$url = 'https://api.openai.com/v1/chat/completions';
$data = [
    'model' => defined('OPENAI_MODEL') ? OPENAI_MODEL : 'gpt-4o-mini',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'You are a travel expert. Generate exactly 3 short, exciting reasons to book tours. NEVER mention ratings, reviews, or prices. NEVER use phrases like "you\'ll love" or "unique experience". Focus only on the adventure and excitement. Format: emoji + short reason (max 60 chars).'
        ],
        [
            'role' => 'user',
            'content' => $prompt
        ]
    ],
    'max_tokens' => 200,
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
    
    // Extract the generated reasons
    if (isset($result['choices'][0]['message']['content'])) {
        $reasons = trim($result['choices'][0]['message']['content']);
        // Remove quotes if present
        $reasons = trim($reasons, '"\'');
        
        echo json_encode([
            'success' => true,
            'reasons' => $reasons,
            'usage' => $result['usage'] ?? null
        ]);
    } else {
        throw new Exception('No reasons generated in OpenAI response');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'OpenAI API request failed',
        'message' => $e->getMessage(),
        'debug' => [
            'api_key_length' => strlen($openai_api_key),
            'tour_title' => $tour_data['title'],
            'url' => $url
        ]
    ]);
}
?> 