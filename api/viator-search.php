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

// Debug: Log the input
error_log("API Input: " . json_encode($input));

if (!$input || !isset($input['searchTerm'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Search term is required']);
    exit();
}

$search_term = $input['searchTerm'];
$page = isset($input['page']) ? max(1, intval($input['page'])) : 1;
$per_page = 20;
$start = ($page - 1) * $per_page + 1;

// Get filter parameters from request body
$price_filter_min = isset($input['minPrice']) ? intval($input['minPrice']) : 0;
$price_filter_max = isset($input['maxPrice']) ? intval($input['maxPrice']) : 1000;
$special_features = [];

// Add private tour flag if specified
if (isset($input['privateTour']) && $input['privateTour'] === true) {
    $special_features[] = 'PRIVATE_TOUR';
}

// Also check for flags array
if (isset($input['flags']) && is_array($input['flags'])) {
    $special_features = array_merge($special_features, $input['flags']);
}

// Debug: Log the filter parameters
error_log("Filters - minPrice: $price_filter_min, maxPrice: $price_filter_max, flags: " . json_encode($special_features));

// Clean up the search term (remove any extra spaces)
$search_term = trim(preg_replace('/\s+/', ' ', $search_term));

// Prepare the request to Viator API
$url = 'https://api.viator.com/partner/search/freetext';
$data = [
    'searchTerm' => $search_term,
    'searchTypes' => [[
        'searchType' => 'PRODUCTS',
        'pagination' => [
            'start' => $start,
            'count' => $per_page
        ]
    ]],
    'currency' => 'USD'
];

// Add product filtering if filters exist
if ($price_filter_min > 0 || $price_filter_max < 1000 || !empty($special_features)) {
    $data['productFiltering'] = [
        'price' => [
            'from' => $price_filter_min,
            'to' => $price_filter_max
        ],
        'flags' => $special_features
    ];
}

// Debug: Log the data being sent to Viator
error_log("Viator API Request: " . json_encode($data));

$options = [
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json;version=2.0',
            'Accept-Language: en-US',
            'exp-api-key: ' . $api_key
        ],
        'content' => json_encode($data),
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
    
    // Debug: Log the Viator response
    error_log("Viator API Response: " . json_encode($result));
    
    // Return the response as JSON
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'API request failed',
        'message' => $e->getMessage(),
        'debug' => [
            'api_key_length' => strlen($api_key),
            'search_term' => $search_term,
            'url' => $url
        ]
    ]);
}
?> 