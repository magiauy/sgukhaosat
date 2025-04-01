<?php

use Core\Request;
use Controllers\UserController;
use Core\Response;

$request = new Request();
$response = new Response();

$controller = new UserController();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

switch (true) {
    case $method === 'POST' && $path === '/api/user':
        $controller->create($response, $request);
        break;
    case $method === 'PUT' && strpos($path, '/api/user') === 0 && isset($_GET['email']):
        $controller->update($response, $request);
        break;
    case $method === 'DELETE' && strpos($path, '/api/user') === 0 && isset($_GET['email']):
        $controller->delete($response, $request);
        break;
    case $method === 'GET' && $path === '/api/user':
        $controller->getAll($response, $request);
        break;
        //email
    case $method === 'GET' && strpos($path, '/api/user') === 0 && isset($_GET['email']):
        $controller->getById($response, $request);
        break;
    case $method === 'POST' && $path === '/api/login':
        $controller->login($response, $request);
        break;
    case $method === 'POST' && $path === '/api/me':
        $controller->me($response, $request);
            break;
    // case $method === 'GET' && $path === '/api/getListUsers':
    //     $controller->getListUsers($response, $request);
    //     break;        
    default:
        $response->sendMessage('Not found', 404);
        break;
}