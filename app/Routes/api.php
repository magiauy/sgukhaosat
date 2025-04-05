<?php

use Controllers\FormController;
use Core\Request;
use Controllers\UserController;
use Core\Response;
use Middlewares\JwtMiddleware;
use Controllers\RoleController;
use Controllers\PermissionController;

$request = new Request();
$response = new Response();

$controller = new UserController();
$formController = new FormController();
$roleController = new RoleController();
$permController = new PermissionController();
// $rolePermController = new Role_PermController();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

//Auth API

switch (true) {
    case $method === 'POST' &&$path === '/api/verify-access':
        JwtMiddleware::verifyAccess($request, $response);
        break;
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
        JwtMiddleware::authenticate($request, $response, null, function ($request, $response) use ($controller) {
            $controller->me($response, $request);
        });
        break;
    case $method === 'GET' && $path === '/api/getListUsers':
        $controller->getListUsers($response, $request);
        break; 

    //role
    case $method === 'POST' && $path === '/api/role':
        $roleController->create($response, $request);
        break;
    case $method === 'PUT' && $path === '/api/role/id':
        $roleController->update($response, $request);
        break;
    case $method === 'DELETE' && $path === '/api/role/id':
        $roleController->delete($response, $request);
        break;      
    case $method === 'GET' && $path === '/api/role/id':
        $roleController->getById($response, $request);
        break;
    case $method === 'GET' && $path === '/api/role':
        $roleController->getAll($response, $request);
        break;
    
    //permission
    case $method === 'GET' && $path === '/api/permission':
        $roleController->getAll($response, $request);
        break;
    case $method === 'POST' && $path === '/api/permission/id':
        $permController->getById($response, $request);
        break;

    //role_perm
    // case $method === 'POST' && $path === '/api/role_permission':
    //     $rolePermController->create($response, $request);
    //     break;
    // case $method === 'PUT' && $path === '/api/role_permission':
    //     $rolePermController->update($response, $request);
    //     break;
    // case $method === 'DELETE' && $path === '/api/role_permission':
    //     $rolePermController->delete($response, $request);
    //     break;
    // case $method === 'GET' && str_starts_with($path, '/api/role_perm') && isset($_GET['id']):
    //     $rolePermController->getById($response, $request);
    //     break;    
    // case $method === 'GET' && $path === '/api/role_permission':
    //     $rolePermController->getAll($response, $request);
    //     break; 

    //admin
    case $method === 'POST' && $path === '/api/admin/form':
        $formController->create($response, $request);
        break;
    case $method === 'GET' && str_starts_with($path, '/api/admin/form'):
        $parts = explode('/', trim($path, '/'));
        if (count($parts) === 4 && is_numeric($parts[3])) {
            $_GET['id'] = (int)$parts[3]; // Gán ID vào $_GET
            JwtMiddleware::authenticate($request, $response, "FORM_VIEW", function ($request, $response) use ($formController) {
                $formController->getById($response, $request);
            });
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
        }
        break;
    default:
        $response->json('Not found', 404);
        break;
}
