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

// Get the API key from .env file
$env_file = __DIR__ . '/.env';
$api_key = '';

if (file_exists($env_file)) {
    $env_content = file_get_contents($env_file);
    $lines = explode("\n", $env_content);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, 'VIATOR_API_KEY=') === 0) {
            $api_key = substr($line, strlen('VIATOR_API_KEY='));
            break;
        }
    }
}

// Fallback to config if .env doesn't exist or key not found
if (empty($api_key)) {
    $api_key = VIATOR_API_KEY;
}

if (empty($api_key) || $api_key === 'your_viator_api_key_here') {
    http_response_code(500);
    echo json_encode([
        'error' => 'API key not configured',
        'message' => 'Please configure your Viator API key using one of these methods:',
        'options' => [
            '1. Edit api/config.php and replace "your_viator_api_key_here" with your actual API key',
            '2. Create api/.env file with: VIATOR_API_KEY=your_actual_key_here',
            '3. Get your API key from: https://www.viator.com/partner/'
        ]
    ]);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['productId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit();
}

$product_id = $input['productId'];

// Prepare the request to Viator API for product details
$url = "https://api.viator.com/partner/products/{$product_id}";
$data = [
    'currency' => 'USD'
];

$options = [
    'http' => [
        'method' => 'GET',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json;version=2.0',
            'Accept-Language: en-US',
            'exp-api-key: ' . $api_key
        ],
        'timeout' => 30
    ]
];

$context = stream_context_create($options);

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data from Viator API');
    }
    
    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from Viator API: ' . json_last_error_msg());
    }
    
    // Return the response as JSON
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'API request failed',
        'message' => $e->getMessage(),
        'debug' => [
            'api_key_length' => strlen($api_key),
            'product_id' => $product_id,
            'url' => $url
        ]
    ]);
}
?> 