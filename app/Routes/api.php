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
    $router->put('/api/user', fn() => $controller->update($response, $request));
    $router->put('/api/user/password', fn() => $controller->resetPassword($response, $request));
    $router->delete('/api/user', fn() => $controller->delete($response, $request));
    $router->get('/api/getListUsers', fn() => $controller->getAll($response, $request));
    $router->get('/api/user', fn() => $controller->getAll($response, $request));
    $router->get('/api/userWithoutWhitelist/{id}', fn($params) => $controller->getAllWithoutWhitelist($response, $request, $params['id']));
    $router->get('/api/user/email', function($params) use ($request, $response, $controller) {
        $controller->getById($response, $request);
    });
    $router->post('/api/login', fn() => $controller->login($response, $request));
    $router->post('/api/me', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $controller->me($res, $req))
    );
    $router->post('/api/user/pagination', fn() => $controller->getOnPagination($response, $request));
    $router->post('/api/user/id', fn() => $controller->getByEmail($response, $request));
    $router->post('/api/user/information', fn() => $controller->updateInformation($response, $request));

    // Excel Import APIs
    $router->post('/api/excel/parse-emails', function() use ($request, $response, $controller) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $controller->parseEmails($res, $req));
    });

    $router->post('/api/users/bulk-create', function() use ($request, $response, $controller) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
            fn($req, $res) => $controller->bulkCreate($res, $req));
    });
    $router->post('/api/user/importAccount', fn() => $controller->bulkCreate($response, $request));



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
    $router->post('/api/role', function() use ($request, $response, $roleController) {
        JwtMiddleware::authenticate($request, $response, "EDIT_ROLE_ADMIN", 
        fn($request, $response) => $roleController->create($response, $request));
    });
    $router->put('/api/role/id', function() use ($request, $response, $roleController) {
        JwtMiddleware::authenticate($request, $response, "EDIT_ROLE_ADMIN", 
        fn($request, $response) => $roleController->update($response, $request));
    });
    $router->delete('/api/role/id', function() use ($request, $response, $roleController){
        JwtMiddleware::authenticate($request, $response, "EDIT_ROLE_ADMIN", 
        fn($request, $response) => $roleController->delete($response, $request));
    });
    $router->get('/api/role/{id}', function($params) use ($request, $response, $roleController) {
        $_GET['id'] = $params['id'];
        $roleController->getById($response, $request);
    });
    $router->get('/api/role', fn() => $roleController->getAll($response, $request));
    $router->post('/api/role/pagination', fn() => $roleController->getOnPagination($response, $request));
 

    // Permission APIs
    $router->get('/api/permission', fn() => $permController->getAll($response, $request));
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

    $router->get('/api/pages/{page}', function($args) use ($request, $response) {
        $page = $args['page'] ?? 'dashboard';
        JwtMiddleware::authenticate($request, $response, "ACCESS_ADMIN", function ($request, $response) use ($page) {
            // Trả về phần HTML partial
            ob_start();
            error_log("Page: $page");
            require __DIR__ . "/../../public/views/admin/{$page}.php";
            $html = ob_get_clean();

            return $response->json([
                'status' => true,
                'html' => $html
            ]);
        });
    });

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
        $router->delete('/api/admin/form/{id}', function($params) use ($request, $response, $formController) {
            $_GET['id'] = (int) $params['id'];
            JwtMiddleware::authenticate($request, $response, "DELETE_FORM",
                fn($req, $res) => $formController->delete($res, $req));
        });
        $router->post('/api/admin/form/{id}/duplicate', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->duplicate($res, $req)));
        // Form Pagination
        $router->get('/api/admin/forms/pagination', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getFormWithPagination($req, $res))
        );
        $router->post('/api/admin/forms/pagination', fn() =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $formController->getFormWithSearchPagination($req, $res))
        );


// Question Type
        $router->get('/api/question_type', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) => $questionTypeController->getAll($res, $req))
        );

        // Result APIs
        $router->post('/api/result', fn() => $resultController->create($response, $request));
        $router->put('/api/result', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->update($res, $req))
        , ['id']);
        $router->delete('/api/result', fn() =>
            JwtMiddleware::authenticate($request, $response, "DELETE_RESULT", fn($req, $res) => $resultController->delete($res, $req))
        , ['id']);
        $router->get('/api/result', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getById($res, $req))
        , ['id']);
        $router->get('/api/result', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getAll($res, $req))
        );
        $router->get('/api/result/form', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getByForm($res, $req))
        , ['formId']);
        $router->get('/api/result/user', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->getByUser($res, $req))
        , ['userId']);
        $router->get('/api/result/count', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $resultController->countByForm($res, $req))
        , ['formId']);
        $router->post('/api/submit-survey', fn() => $resultController->submitSurvey($response, $request));

        // Answer APIs
        $router->post('/api/answer', fn() => $answerController->create($response, $request));
        $router->put('/api/answer', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->update($res, $req))
        , ['id']);
        $router->delete('/api/answer', fn() =>
            JwtMiddleware::authenticate($request, $response, "DELETE_RESULT", fn($req, $res) => $answerController->delete($res, $req))
        );
        $router->post('/api/answer/get', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getById($res, $req))
        );
        $router->get('/api/answer', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getAll($res, $req))
        );
        $router->get('/api/answer/result', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getByResult($res, $req))
        , ['resultId']);
        $router->get('/api/answer/question', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getByQuestion($res, $req))
        , ['questionId']);
        $router->get('/api/answer/statistics', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $answerController->getAnswerStatistics($res, $req))
        , ['formId', 'questionId']);

        // Auth APIs
        $router->post('/api/auth/refresh', function() use ($response, $request) {
            JwtMiddleware::refresh($request, $response);
        });
        $router->post('/api/auth/logout', function() use ($response, $request) {
            JwtMiddleware::logout($request, $response);
        });


    // Xử lý routing
    $router->resolve($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);