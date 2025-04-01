<?php

use Controllers\FormController;
use Core\Request;
use Controllers\UserController;
use Core\Response;

$request = new Request();
$response = new Response();

$controller = new UserController();
$formController = new FormController();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

//Auth API

switch (true) {
    case $method === 'POST' && $path === '/api/user':
        $controller->create($response, $request);
        break;
    case $method === 'PUT' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->update($response, $request);
        break;
    case $method === 'DELETE' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->delete($response, $request);
        break;
    case $method === 'GET' && $path === '/api/user':
        $controller->getAll($response, $request);
        break;
        //email
    case $method === 'GET' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->getById($response, $request);
        break;
    case $method === 'POST' && $path === '/api/login':
        $controller->login($response, $request);
        break;
    case $method === 'POST' && $path === '/api/me':
        $controller->me($response, $request);
            break;
    case $method === 'GET' && $path === '/api/getListUsers':
        $controller->getListUsers($response, $request);
        break;
    case $method === 'POST' && $path === '/api/admin/form':
        $formController->create($response, $request);
        break;
    case $method === 'GET' && str_starts_with($path, '/api/admin/form'):
        $parts = explode('/', trim($path, '/'));

        if (count($parts) === 4 && is_numeric($parts[3])) {
            $_GET['id'] = (int) $parts[3]; // Gán ID vào $_GET
            $formController->getById($response, $request);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
        }
        break;


    default:
        $response->json('Not found', 404);
        break;
}