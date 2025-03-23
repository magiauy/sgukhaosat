<?php
//Load web page with the following code
$uri = trim($_SERVER['REQUEST_URI'], '/');
$requestMethod = $_SERVER['REQUEST_METHOD'];

switch (true) {
    case ($uri === ''):
//        require_once __DIR__ . '/../../public/index.php';
        echo "Hello World";
        break;
    case ($uri === 'login'):
        require_once __DIR__ . '/../../public/views/layouts/header.php';
        require_once __DIR__ . '/../../public/views/pages/login.php';
        break;
    default:
        require_once __DIR__ . '/view/404.php';
        break;

}