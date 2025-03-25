<?php
//Load web page with the following code
$uri = trim($_SERVER['REQUEST_URI'], '/');
$requestMethod = $_SERVER['REQUEST_METHOD'];

switch (true) {
    case ($uri === ''):
        require_once __DIR__ . '/../../public/views/pages/home.php';
        break;
    case ($uri === 'login'):
        require_once __DIR__ . '/../../public/views/pages/login.php';
        break;
    default:
        require_once __DIR__ . '/../../public/views/404.php';
        break;

}