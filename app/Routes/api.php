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
use Controllers\FormTypeController;
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
$formTypeController = new FormTypeController();

    // User APIs
    $router->post('/api/user', fn() => $controller->create($response, $request));
    $router->put('/api/user', fn() => $controller->update($response, $request), ['email']);
    $router->delete('/api/user', fn() => $controller->delete($response, $request), ['email']);
    $router->get('/api/getListUsers', fn() => $controller->getAll($response, $request));
    $router->get('/api/user', fn() => $controller->getAll($response, $request));
    $router->get('/api/user', fn() => $controller->getById($response, $request), ['email']);
    $router->post('/api/login', fn() => $controller->login($response, $request));
    $router->post('/api/me', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $controller->me($res, $req))
    );

    // Period APIs
    $router->post('/api/period', fn() => $periodController->create($response, $request));
    $router->get('/api/period', function() use ($response, $periodController) {
        parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $queryParams);
        $periodController->getAll($response, $queryParams);
    });
    $router->get('/api/period/search', function() use ($response, $periodController) {
        parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $queryParams);
        $periodController->search($response, $queryParams);
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

    // Form Type APIs
    $router->post('/api/form-type', fn() => $formTypeController->create($response, $request));
    $router->get('/api/form-type', fn() => $formTypeController->getAll($response));
    $router->get('/api/form-type/search', function() use ($response, $formTypeController) {
        parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $queryParams);
        $formTypeController->search($response, $queryParams);
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
    $router->get('/api/question_type', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $questionTypeController->getAll($res, $req))
    );

    // Xử lý routing
    $router->resolve($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);