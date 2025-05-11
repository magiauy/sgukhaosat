<?php
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$secret = $_ENV['JWT_SECRET'];
$refreshSecret = $_ENV['JWT_REFRESH_SECRET'];

return [
    'access_secret' => $secret,
    'refresh_secret' => $refreshSecret,
];