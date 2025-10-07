<?php
// Debug file to see what's happening with the routing
$user_agent = $_GET['ua'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$path = $_GET['path'] ?? 'Unknown';

echo "<h1>Debug Information</h1>";
echo "<p><strong>User Agent:</strong> " . htmlspecialchars($user_agent) . "</p>";
echo "<p><strong>Path:</strong> " . htmlspecialchars($path) . "</p>";
echo "<p><strong>Time:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Check if it's a social media crawler
$social_crawlers = ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'TelegramBot', 'Pinterest', 'Slackbot'];
$is_social_crawler = false;

foreach ($social_crawlers as $crawler) {
    if (stripos($user_agent, $crawler) !== false) {
        $is_social_crawler = true;
        break;
    }
}

echo "<p><strong>Is Social Crawler:</strong> " . ($is_social_crawler ? 'YES' : 'NO') . "</p>";

if ($is_social_crawler) {
    echo "<p><strong>Action:</strong> Should serve Open Graph HTML</p>";
    // Include the destination-og.php logic
    require_once 'destinations-data.php';
    $destination = getDestinationData($path);
    
    if ($destination) {
        echo "<h2>Destination Data Found:</h2>";
        echo "<pre>" . print_r($destination, true) . "</pre>";
    } else {
        echo "<h2>No Destination Data Found for: " . htmlspecialchars($path) . "</h2>";
    }
} else {
    echo "<p><strong>Action:</strong> Should serve React app</p>";
}

echo "<hr>";
echo "<p><a href='/aruba'>Test /aruba again</a></p>";
echo "<p><a href='/api/destination-og.php?destination_id=aruba'>Test PHP directly</a></p>";
?> 