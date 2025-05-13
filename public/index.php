<?php
define('APP_STARTED', true);

require_once __DIR__ . '/../vendor/autoload.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Parse URL to determine if it's an API request
$path = $_SERVER['REQUEST_URI'];

// Route the request
if (str_starts_with($path, '/api/v2/statistics/')) {
    // Handle Statistics V2 API routes
    require_once __DIR__ . '/../app/Routes/statistics.php';
} else if (str_starts_with($path, '/api/')) {
    // Handle regular API routes
    require_once __DIR__ . '/../app/Routes/api.php';
} else {
    // Handle web routes
    require_once __DIR__ . '/../app/Routes/web.php';
}