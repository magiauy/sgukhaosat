<?php

use Core\Request;
use Core\Response;
use Middlewares\JwtMiddleware;
use Controllers\UserController;
use Controllers\FormController;
use Controllers\RoleController;
use Controllers\PermissionController;
use Controllers\QuestionTypeController;
use Controllers\DraftController;
use Controllers\PeriodController;
use Controllers\MajorController;
use Controllers\FormTypeController;
use Services\DraftService;

$request = new Request();
$response = new Response();

$controller = new UserController();
$formController = new FormController();
$roleController = new RoleController();
$permController = new PermissionController();
$questionTypeController = new QuestionTypeController();
$draftController = new DraftController(new DraftService());
$periodController = new PeriodController();
$majorController = new MajorController();
$formTypeController = new FormTypeController();


$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

switch (true) {
    // User APIs
    case $method === 'POST' && $path === '/api/user':
        $controller->create($response, $request);
        break;
    case $method === 'PUT' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->update($response, $request);
        break;
    case $method === 'DELETE' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->delete($response, $request);
        break;
    case $method === 'GET' && $path === '/api/getListUsers':
    case $method === 'GET' && $path === '/api/user':
        $controller->getAll($response, $request);
        break;
    case $method === 'GET' && str_starts_with($path, '/api/user') && isset($_GET['email']):
        $controller->getById($response, $request);
        break;
    case $method === 'POST' && $path === '/api/login':
        $controller->login($response, $request);
        break;
    case $method === 'POST' && $path === '/api/me':
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $controller->me($res, $req));
        break;
    case $method === 'POST' && $path === '/api/period':
        $periodController->create($response, $request);
        break;
    case $method === 'GET' && preg_match('#^/api/period(\?.*)?$#', $path):
        $periodController->getAll($response);
        break;
    case $method === 'GET' && $path === '/api/period/totalCount':
        $periodController->getTotalCount($response);
        break;  

    case $method === 'POST' && $path === '/api/major':
        $majorController->create($response, $request);
        break;
    case $method === 'GET' && preg_match('#^/api/major(\?.*)?$#', $path):
        $majorController->getAll($response);
        break;
    case $method === 'GET' && $path === '/api/major/totalCount':
        $majorController->getTotalCount($response);
        break;   

    case $method === 'POST' && $path === '/api/form-type':
        $formTypeController->create($response, $request);
        break;
    case $method === 'GET' && preg_match('#^/api/form-type(\?.*)?$#', $path):
        $formTypeController->getAll($response);
        break;
    case $method === 'GET' && $path === '/api/form-type/totalCount':
        $formTypeController->getTotalCount($response);
        break;      
            

    // Role APIs
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

    // Permission APIs
//    case $method === 'GET' && $path === '/api/permission':
//        $roleController->getAll($response, $request);
//        break;
    case $method === 'POST' && $path === '/api/permission/id':
        $permController->getById($response, $request);
        break;

    // Draft APIs
    case $method === 'POST' && $path === '/api/draft':
        JwtMiddleware::authenticate($request, $response, "ADD_FORM", function ($request, $response) use ($formController) {
            $formController->createDraft($response, $request);
        });
        break;
//    case $method === 'PUT' && $path === '/api/draft':
        case $method === 'PUT' && str_starts_with($path, '/api/draft') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "EDIT_FORM", function ($request, $response) use ($draftController) {
            $draftController->update($response, $request);
        });
        break;
    case $method === 'DELETE' && $path === '/api/draft':
        $draftController->delete($response, $request);
        break;
    case $method === 'GET' && $path === '/api/draft':
        $draftController->getAll($response, $request);
        break;
    case $method === 'GET' && isset($_GET['id']) && str_starts_with($path, '/api/draft'):
        $draftController->getById($response, $request);
        break;
    case $method === 'GET' && isset($_GET['uid']) && str_starts_with($path, '/api/draft/user'):
        $draftController->getByUserID($response, $request);
        break;
    case $method === 'GET' && $path === '/api/draft/id/generate':
        $draftController->idGenerate($response, $request);
        break;

    // Admin Form Page
    case $method === 'GET' && $path === '/api/pages/survey':
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", function ($request, $response) use ($formController) {
            ob_start();
            require __DIR__ . "/../../public/views/admin/Manage_Form.php";
            $html = ob_get_clean();
//            $formController->getAllDataPage($request, $response, $html);
            $response->json([
                'status' => true,
                'html' => $html
            ]);
        });
        break;
    case $method === 'POST' && $path === '/api/admin/form':
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->create($res, $req));
        break;
    case $method === 'PUT' && str_starts_with($path, '/api/admin/form') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "EDIT_FORM", fn($req, $res) => $formController->update($res, $req));
        break;
    case $method === 'GET' && preg_match('#^/api/admin/form/(\d+)$#', $path, $matches):
        $_GET['id'] = (int) $matches[1];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getById($res, $req));
        break;

    case $method === 'GET' && preg_match('#^/api/admin/forms/pagination#', $path):
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getFormWithPagination($req, $res));
        break;
    // Question Type
    case $method === 'GET' && $path === '/api/question_type':
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $questionTypeController->getAll($res, $req));
        break;

    default:
        $response->json('Not found', 404);
        break;
}
