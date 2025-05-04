<?php
use Core\Request;
use Core\Response;
use Core\Router;
use Middlewares\JwtMiddleware;
use Controllers\UserController;
use Controllers\FormController;
use Controllers\RoleController;
use Controllers\PermissionController;
use Controllers\QuestionTypeController;
use Controllers\DraftController;
use Controllers\PeriodController;
use Controllers\MajorController;
use Controllers\PositionController;
use Controllers\FormTypeController;
use Controllers\ResultController;
use Controllers\AnswerController;
use Services\DraftService;

$request = new Request();
$response = new Response();
$router = new Router();

// Khởi tạo các controller
$controller = new UserController();
$formController = new FormController();
$roleController = new RoleController();
$permController = new PermissionController();
$questionTypeController = new QuestionTypeController();
$draftController = new DraftController(new DraftService());
$periodController = new PeriodController();
$majorController = new MajorController();
$positionController = new PositionController();
$formTypeController = new FormTypeController();
$resultController = new ResultController();
$answerController = new AnswerController();

    // User APIs
    $router->post('/api/user', fn() => $controller->create($response, $request));
    $router->put('/api/user', fn() => $controller->update($response, $request), ['email']);
    $router->delete('/api/user', fn() => $controller->delete($response, $request), ['email']);
    $router->get('/api/getListUsers', fn() => $controller->getAll($response, $request));
    $router->get('/api/user', fn() => $controller->getAll($response, $request));
    $router->get('/api/userWithoutWhitelist/{id}', fn($params) => $controller->getAllWithoutWhitelist($response, $request, $params['id']));
    $router->get('/api/user', fn() => $controller->getById($response, $request), ['email']);
    $router->post('/api/login', fn() => $controller->login($response, $request));
    $router->post('/api/me', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $controller->me($res, $req))
    );
    // Excel Import APIs
    $router->post('/api/excel/parse-emails', function() use ($request, $response, $controller) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $controller->parseEmails($res, $req));
    });

    $router->post('/api/users/bulk-create', function() use ($request, $response, $controller) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $controller->bulkCreate($res, $req));
    });


// Period APIs
    $router->post('/api/period', fn() => $periodController->create($response, $request));
    $router->get('/api/period', function() use ($response, $periodController) {
        parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $queryParams);
        $periodController->getAll($response, $queryParams);
    });
    $router->get('/api/period/search', function() use ($response, $request, $periodController) {
        $periodController->search($response, $request);
    });
    $router->get('/api/period/{id}', fn($params) => $periodController->getById($response, $params['id']));
    $router->put('/api/period/{id}', function($params) use ($response, $request, $periodController) {
        $_GET['id'] = $params['id'];
        $periodController->update($response, $request);
    });
    $router->delete('/api/period/{id}', function($params) use ($response, $request, $periodController) {
        $_GET['id'] = $params['id'];
        $periodController->delete($response, $request);
    });

    // Major APIs
    $router->post('/api/major', fn() => $majorController->create($response, $request));
    $router->get('/api/major', fn() => $majorController->getAll($response));
    $router->get('/api/major/search', function() use ($response,$request, $majorController) {
        $majorController->search($response, $request);
    });
    $router->get('/api/major/{id}', fn($params) => $majorController->getById($response, $params['id']));
    $router->put('/api/major/{id}', function($params) use ($response, $request, $majorController) {
        $_GET['id'] = $params['id'];
        $majorController->update($response, $request);
    });
    $router->delete('/api/major/{id}', function($params) use ($response, $request, $majorController) {
        $_GET['id'] = $params['id'];
        $majorController->delete($response, $request);
    });

    // Position APIs
    $router->post('/api/position', fn() => $positionController->create($response, $request));
    $router->get('/api/position', fn() => $positionController->getAll($response));
    $router->get('/api/position/search', function() use ($response,$request, $positionController) {
        $positionController->search($response, $request);
    });
    $router->get('/api/position/{id}', fn($params) => $positionController->getById($response, $params['id']));
    $router->put('/api/position/{id}', function($params) use ($response, $request, $positionController) {
        $_GET['id'] = $params['id'];
        $positionController->update($response, $request);
    });
    $router->delete('/api/position/{id}', function($params) use ($response, $request, $positionController) {
        $_GET['id'] = $params['id'];
        $positionController->delete($response, $request);
    });

    // Form Type APIs
    $router->post('/api/form-type', fn() => $formTypeController->create($response, $request));
    $router->get('/api/form-type', fn() => $formTypeController->getAll($response));
    $router->get('/api/form-type/search', function() use ($response, $request, $formTypeController) {
        $formTypeController->search($response, $request);
    });
    $router->get('/api/form-type/{id}', fn($params) => $formTypeController->getById($response, $params['id']));
    $router->put('/api/form-type/{id}', function($params) use ($response, $request, $formTypeController) {
        $_GET['id'] = $params['id'];
        $formTypeController->update($response, $request);
    });
    $router->delete('/api/form-type/{id}', function($params) use ($response, $request, $formTypeController) {
        $_GET['id'] = $params['id'];
        $formTypeController->delete($response, $request);
    });

    // Form Whitelist Management
    $router->get('/api/forms/{id}/whitelist', function($params) use ($request, $response, $formController) {
        $_GET['id'] = (int) $params['id'];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $formController->getFormWhitelist($res, $params['id']));
    });

    $router->post('/api/forms/{id}/whitelist', function($params) use ($request, $response, $formController) {
        $_GET['id'] = (int) $params['id'];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $formController->addToWhitelist($res, $req, $params['id']));
    });

    $router->put('/api/forms/{id}/whitelist', function($params) use ($request, $response, $formController) {
        $_GET['id'] = (int) $params['id'];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $formController->editFromWhitelist($res, $req, $params['id']));
    });
    $router->delete('/api/forms/{id}/whitelist', function($params) use ($request, $response, $formController) {
        $_GET['id'] = (int) $params['id'];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $formController->deleteFromWhitelist($res, $req, $params['id']));
    });



    // Role APIs
    $router->post('/api/role', fn() => $roleController->create($response, $request));
    $router->put('/api/role/id', fn() => $roleController->update($response, $request));
    $router->delete('/api/role/id', fn() => $roleController->delete($response, $request));
    $router->get('/api/role/id', fn() => $roleController->getById($response, $request));
    $router->get('/api/role', fn() => $roleController->getAll($response, $request));

    // Permission APIs
    $router->post('/api/permission/id', fn() => $permController->getById($response, $request));

    // Draft APIs
    $router->post('/api/draft', fn() =>
        JwtMiddleware::authenticate($request, $response, "ADD_FORM", function ($request, $response) use ($formController) {
            $formController->createDraft($response, $request);
        })
    );
    $router->put('/api/draft', fn() =>
        JwtMiddleware::authenticate($request, $response, "EDIT_FORM", function ($request, $response) use ($draftController) {
            $draftController->update($response, $request);
        })
    , ['id']);
    $router->delete('/api/draft', fn() => $draftController->delete($response, $request));
    $router->get('/api/draft', fn() => $draftController->getAll($response, $request));
    $router->get('/api/draft', fn() => $draftController->getById($response, $request), ['id']);
    $router->get('/api/draft/user', fn() => $draftController->getByUserID($response, $request), ['uid']);
    $router->get('/api/draft/id/generate', fn() => $draftController->idGenerate($response, $request));

    // Admin Form Page
    $router->get('/api/pages/survey', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", function ($request, $response) use ($formController) {
            ob_start();
            require __DIR__ . "/../../public/views/admin/Manage_Form.php";
            $html = ob_get_clean();
            $response->json([
                'status' => true,
                'html' => $html
            ]);
        })
    );

    // Admin Form APIs
    $router->get('/api/admin/form', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getAll($res, $req))
    );
    $router->get('/api/form', fn() =>
        JwtMiddleware::authenticate($request, $response, "", fn($req, $res) => $formController->getByIdForUser($res, $req))
    , ['id']);
    $router->post('/api/admin/form', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->create($res, $req))
    );
    $router->put('/api/admin/form', fn() =>
        JwtMiddleware::authenticate($request, $response, "EDIT_FORM", fn($req, $res) => $formController->update($res, $req))
    , ['id']);
    $router->get('/api/admin/form/{id}', function($params) use ($request, $response, $formController) {
        $_GET['id'] = (int) $params['id'];
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getById($res, $req));
    });

    // Form Pagination
    $router->get('/api/admin/forms/pagination', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getFormWithPagination($req, $res))
    );

    // Question Type
    case $method === 'GET' && $path === '/api/question_type':
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $questionTypeController->getAll($res, $req));
        break;
        
    // Result APIs
    case $method === 'POST' && $path === '/api/result':
        $resultController->create($response, $request);
        break;
    case $method === 'PUT' && str_starts_with($path, '/api/result') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->update($res, $req));
        break;
    case $method === 'DELETE' && str_starts_with($path, '/api/result') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "DELETE_RESULT", fn($req, $res) => $resultController->delete($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/result') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getById($res, $req));
        break;
    case $method === 'GET' && $path === '/api/result':
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getAll($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/result/form') && isset($_GET['formId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getByForm($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/result/user') && isset($_GET['userId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getByUser($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/result/count') && isset($_GET['formId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->countByForm($res, $req));
        break;
    case $method === 'POST' && $path === '/api/submit-survey':
        $resultController->submitSurvey($response, $request);
        break;
        
    // Answer APIs
    case $method === 'POST' && $path === '/api/answer':
        $answerController->create($response, $request);
        break;
    case $method === 'PUT' && str_starts_with($path, '/api/answer') && isset($_GET['id']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->update($res, $req));
        break;
    case $method === 'DELETE' && $path === '/api/answer':
        JwtMiddleware::authenticate($request, $response, "DELETE_RESULT", fn($req, $res) => $answerController->delete($res, $req));
        break;
    case $method === 'POST' && $path === '/api/answer/get':
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getById($res, $req));
        break;
    case $method === 'GET' && $path === '/api/answer':
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getAll($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/answer/result') && isset($_GET['resultId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getByResult($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/answer/question') && isset($_GET['questionId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getByQuestion($res, $req));
        break;
    case $method === 'GET' && str_starts_with($path, '/api/answer/statistics') && isset($_GET['formId']) && isset($_GET['questionId']):
        JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getAnswerStatistics($res, $req));
        break;

    // Xử lý routing
    $router->resolve($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);