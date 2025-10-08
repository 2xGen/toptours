<?php
header('Content-Type: text/html; charset=utf-8');

// Debug logging
error_log("destination-og.php called with: " . print_r($_GET, true));
error_log("User agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'));

// Get destination ID from URL
$destination_id = $_GET['destination_id'] ?? 'unknown';

// Load destination data
require_once 'destinations-data.php';
$destination = getDestinationData($destination_id);

if ($destination) {
    // Generate HTML with Open Graph
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title><?php echo htmlspecialchars($destination['title']); ?></title>
        <meta name="description" content="<?php echo htmlspecialchars($destination['description']); ?>" />
        <meta name="keywords" content="<?php echo htmlspecialchars($destination['keywords']); ?>" />
        
        <!-- Open Graph -->
        <meta property="og:title" content="<?php echo htmlspecialchars($destination['title']); ?>" />
        <meta property="og:description" content="<?php echo htmlspecialchars($destination['description']); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/<?php echo $destination_id; ?>" />
        <meta property="og:image" content="<?php echo htmlspecialchars($destination['image']); ?>" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="<?php echo htmlspecialchars($destination['title']); ?>" />
        <meta name="twitter:description" content="<?php echo htmlspecialchars($destination['description']); ?>" />
        <meta name="twitter:image" content="<?php echo htmlspecialchars($destination['image']); ?>" />
        
        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmOTczMWIiLz4KPHBhdGggZD0iTTEyIDZMMTMuMDkgMTAuMjZMMTggMTFMMTMuMDkgMTEuNzRMMTIgMTZMMTAuOTEgMTEuNzRMMTYgMTFMMTAuOTEgMTAuMjZMMTIgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" />
        
        <!-- CSS and JS -->
        <link rel="stylesheet" href="/assets/index-d18924d5.css">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" crossorigin src="/assets/index-7388dc93.js"></script>
    </body>
    </html>
    <?php
} else {
    // Fallback to React app for non-existent destinations
    include '../index.html';
}
?> 