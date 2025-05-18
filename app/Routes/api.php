<?php

use Controllers\MailerController;
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
use Controllers\DocumentController;
use Controllers\FileController;
use Controllers\PositionController;
use Controllers\FormTypeController;
use Controllers\ResultController;
use Controllers\AnswerController;
use Controllers\StatisticsController;
use Controllers\ResultStatisticController;
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
$documentController = new DocumentController();
$fileController = new FileController();
$positionController = new PositionController();
$formTypeController = new FormTypeController();
$resultController = new ResultController();
$answerController = new AnswerController();
$statisticsController = new StatisticsController();
$mailerController = new MailerController();
$resultStatisticController = new ResultStatisticController();

    // User APIs
$router->post('/api/user', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_USERS", fn($req, $res) =>
        $controller->create($res, $req)
    )
);

$router->put('/api/user', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_USERS", fn($req, $res) =>
        $controller->update($res, $req)
    )
);

$router->put('/api/user/password', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_USERS", fn($req, $res) =>
        $controller->resetPassword($res, $req)
    )
);

$router->delete('/api/user', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_USERS", fn($req, $res) =>
        $controller->delete($res, $req)
    )
);

$router->get('/api/getListUsers', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
        $controller->getAll($res, $req)
    )
);

$router->get('/api/user', fn() =>
    JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
        $controller->getAll($res, $req)
    )
);

$router->get('/api/userWithoutWhitelist/{id}', fn($params) =>
    JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
        $controller->getAllWithoutWhitelist($res, $req, $params['id'])
    )
);

$router->get('/api/user/email', function($params) use ($request, $response, $controller) {
    JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
        $controller->getById($res, $req)
    );
});
    $router->post('/api/login', fn() => $controller->login($response, $request));
    $router->post('/api/me', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $controller->me($res, $req))
    );
   $router->post('/api/user/pagination', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_USERS", fn($req, $res) =>
        $controller->getOnPagination($res, $req)
    )
    );

    $router->post('/api/user/id', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
            $controller->getByEmail($res, $req)
        )
    );

    $router->post('/api/user/information', fn() =>
        JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
            $controller->updateInformation($res, $req)
        )
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
    $router->post('/api/user/importAccount', fn() => $controller->bulkCreate($response, $request));



    // Period APIs
    $router->post('/api/period', fn() =>
        JwtMiddleware::authenticate($request, $response, "ADD_PERIOD", fn($req, $res) =>
            $periodController->create($res, $req)
        )
    );

    $router->get('/api/period', function() use ($request, $response, $periodController) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_PERIOD", function($req, $res) use ($periodController) {
            parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $queryParams);
            $periodController->getAll($res, $queryParams);
        });
    });

    $router->get('/api/period/search', function() use ($request, $response, $periodController) {
        JwtMiddleware::authenticate($request, $response, "MANAGE_PERIOD", function($req, $res) use ($periodController) {
            $periodController->search($res, $req);
        });
    });

    $router->get('/api/period/{id}', fn($params) =>
        JwtMiddleware::authenticate($request, $response, "MANAGE_PERIOD", fn($req, $res) =>
            $periodController->getById($res, $params['id'])
        )
    );

    $router->put('/api/period/{id}', function($params) use ($request, $response, $periodController) {
        JwtMiddleware::authenticate($request, $response, "EDIT_PERIOD", function($req, $res) use ($params, $periodController) {
            $_GET['id'] = $params['id'];
            $periodController->update($res, $req);
        });
    });

    $router->delete('/api/period/{id}', function($params) use ($request, $response, $periodController) {
        JwtMiddleware::authenticate($request, $response, "DELETE_PERIOD", function($req, $res) use ($params, $periodController) {
            $_GET['id'] = $params['id'];
            $periodController->delete($res, $req);
        });
    });

// Document APIs
$router->get('/api/document', fn() =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $documentController->getAll($res)
    )
);

$router->get('/api/document/search', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_DOCUMENT", fn($req, $res) =>
        $documentController->search($res, $req)
    )
);

$router->get('/api/document/{id}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $documentController->getById($res, $params['id'])
    )
);

$router->get('/api/document/type/{type}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $documentController->getDocumentsByType($res, $req, $params['type'])
    )
);

$router->get('/api/document/{id}/files', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $documentController->getFilesByDocumentId($res, $params['id'])
    )
);

$router->post('/api/document', fn() =>
    JwtMiddleware::authenticate($request, $response, "ADD_DOCUMENT", fn($req, $res) =>
        $documentController->create($res, $req)
    )
);

$router->put('/api/document/{id}', function($params) use ($request, $response, $documentController) {
    JwtMiddleware::authenticate($request, $response, "EDIT_DOCUMENT", function($req, $res) use ($params, $documentController) {
        $_GET['id'] = $params['id'];
        $documentController->update($res, $req);
    });
});

$router->delete('/api/document/{id}', function($params) use ($request, $response, $documentController) {
    JwtMiddleware::authenticate($request, $response, "DELETE_DOCUMENT", function($req, $res) use ($params, $documentController) {
        $_GET['id'] = $params['id'];
        $documentController->delete($res, $req);
    });
});

// File APIs
$router->get('/api/file', fn() =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $fileController->getAllByDocumentId($res, $req)
    )
);

$router->post('/api/file', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_DOCUMENTS", fn($req, $res) =>
        $fileController->createMultiple($res, $req)
    )
);

$router->delete('/api/file/{id}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_DOCUMENTS", fn($req, $res) =>
        $fileController->delete($res, $req, $params['id'])
    )
);
// Major APIs
$router->post('/api/major', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_MAJOR", fn($req, $res) =>
        $majorController->create($res, $req)
    )
);
$router->get('/api/major', fn() =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $majorController->getAll($res)
    )
);
$router->get('/api/major/search', function() use ($request, $response, $majorController) {
    JwtMiddleware::authenticate($request, $response, null, function($req, $res) use ($majorController) {
        $majorController->search($res, $req);
    });
});
$router->get('/api/major/{id}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $majorController->getById($res, $params['id'])
    )
);
$router->put('/api/major/{id}', function($params) use ($request, $response, $majorController) {
    JwtMiddleware::authenticate($request, $response, "MANAGE_MAJOR", function($req, $res) use ($params, $majorController) {
        $_GET['id'] = $params['id'];
        $majorController->update($res, $req);
    });
});
$router->delete('/api/major/{id}', function($params) use ($request, $response, $majorController) {
    JwtMiddleware::authenticate($request, $response, "DELETE_MAJOR", function($req, $res) use ($params, $majorController) {
        $_GET['id'] = $params['id'];
        $majorController->delete($res, $req);
    });
});

// Position APIs
$router->post('/api/position', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_POSITION", fn($req, $res) =>
        $positionController->create($res, $req)
    )
);
$router->get('/api/position', fn() =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $positionController->getAll($res)
    )
);
$router->get('/api/position/search', function() use ($request, $response, $positionController) {
    JwtMiddleware::authenticate($request, $response, null, function($req, $res) use ($positionController) {
        $positionController->search($res, $req);
    });
});
$router->get('/api/position/{id}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $positionController->getById($res, $params['id'])
    )
);
$router->put('/api/position/{id}', function($params) use ($request, $response, $positionController) {
    JwtMiddleware::authenticate($request, $response, "MANAGE_POSITION", function($req, $res) use ($params, $positionController) {
        $_GET['id'] = $params['id'];
        $positionController->update($res, $req);
    });
});
$router->delete('/api/position/{id}', function($params) use ($request, $response, $positionController) {
    JwtMiddleware::authenticate($request, $response, "MANAGE_POSITION", function($req, $res) use ($params, $positionController) {
        $_GET['id'] = $params['id'];
        $positionController->delete($res, $req);
    });
});

// Form Type APIs
$router->post('/api/form-type', fn() =>
    JwtMiddleware::authenticate($request, $response, "MANAGE_FORM_TYPE", fn($req, $res) =>
        $formTypeController->create($res, $req)
    )
);
$router->get('/api/form-type', fn() =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $formTypeController->getAll($res)
    )
);
$router->get('/api/form-type/search', function() use ($request, $response, $formTypeController) {
    JwtMiddleware::authenticate($request, $response, null, function($req, $res) use ($formTypeController) {
        $formTypeController->search($res, $req);
    });
});
$router->get('/api/form-type/{id}', fn($params) =>
    JwtMiddleware::authenticate($request, $response, null, fn($req, $res) =>
        $formTypeController->getById($res, $params['id'])
    )
);
$router->put('/api/form-type/{id}', function($params) use ($request, $response, $formTypeController) {
    JwtMiddleware::authenticate($request, $response, "MANAGE_FORM_TYPE", function($req, $res) use ($params, $formTypeController) {
        $_GET['id'] = $params['id'];
        $formTypeController->update($res, $req);
    });
});
$router->delete('/api/form-type/{id}', function($params) use ($request, $response, $formTypeController) {
    JwtMiddleware::authenticate($request, $response, "DELETE_FORM_TYPE", function($req, $res) use ($params, $formTypeController) {
        $_GET['id'] = $params['id'];
        $formTypeController->delete($res, $req);
    });
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
    $router->post('/api/role', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_ROLES", fn($req, $res) =>
            $roleController->create($res, $req)
        )
    );

    $router->put('/api/role/id', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_ROLES", fn($req, $res) =>
            $roleController->update($res, $req)
        )
    );

    $router->delete('/api/role/id', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_ROLES", fn($req, $res) =>
            $roleController->delete($res, $req)
        )
    );

    $router->get('/api/role/{id}', function($params) use ($request, $response, $roleController) {
        JwtMiddleware::authenticateNoAddUser($request, $response, null, function($req, $res) use ($params, $roleController) {
            $_GET['id'] = $params['id'];
            $roleController->getById($res, $req);
        });
    });

    $router->get('/api/role', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $roleController->getAll($res, $req)
        )
    );

    $router->post('/api/role/pagination', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, "MANAGE_ROLES", fn($req, $res) =>
            $roleController->getOnPagination($res, $req)
        )
    );

    // Permission APIs
    $router->get('/api/permission', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $permController->getAll($res, $req)
        )
    );

    $router->post('/api/permission/id', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $permController->getById($res, $req)
        )
    );
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
    $router->delete('/api/draft', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $draftController->delete($res, $req)
        )
    );

    $router->get('/api/draft', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $draftController->getAll($res, $req)
        )
    );

    $router->get('/api/draft/{id}', function($params) use ($request, $response, $draftController) {
        JwtMiddleware::authenticateNoAddUser($request, $response, null, function($req, $res) use ($params, $draftController) {
            $_GET['id'] = $params['id'];
            $draftController->getById($res, $req);
        });
    });

    $router->get('/api/draft/user/{uid}', function($params) use ($request, $response, $draftController) {
        JwtMiddleware::authenticateNoAddUser($request, $response, null, function($req, $res) use ($params, $draftController) {
            $_GET['uid'] = $params['uid'];
            $draftController->getByUserID($res, $req);
        });
    });

    $router->get('/api/draft/id/generate', fn() =>
        JwtMiddleware::authenticateNoAddUser($request, $response, null, fn($req, $res) =>
            $draftController->idGenerate($res, $req)
        )
    );

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
        $router->get('/api/form', function() use ($request, $response, $formController) {
            JwtMiddleware::authenticate($request, $response, null, function($req, $res) use ($formController) {
                $formController->getByIdForUser($res, $req);
            });
        }, ['id']);
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
        // Form Status Update endpoint
        $router->put('/api/admin/form/status/{id}', function($params) use ($request, $response, $formController) {
            $_GET['id'] = (int) $params['id'];
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS",
                fn($req, $res) => $formController->updateStatus($res, $req));
        });



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

        $router->get('/api/form/{formId}/responses/{responseId}', function($params) use ($request, $response, $resultController) {
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", function($req, $res) use ($params, $resultController) {
                $formId = (int) $params['formId'];
                $responseId = (int) $params['responseId'];
                $resultController->getFormResponse($res, $formId, $responseId);
            });
        });
        $router->get('/api/admin/form/{formId}/responses/user', function($params) use ($request, $response, $resultController) {
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", function($req, $res) use ($params, $resultController) {
                $formId = (int) $params['formId'];
                $resultController->getUserResponses($res, $req, $formId);
            });
        });
        $router->delete('/api/admin/form/{formId}/responses/{responseId}', function($params) use ($request, $response, $resultController) {
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", function($req, $res) use ($params, $resultController) {
                $formId = (int) $params['formId'];
                $responseId = (int) $params['responseId'];
                $resultController->deleteResult($res,$req,$responseId);
            });
        });
        $router->post('/api/statistic/form/{formId}/questions-ratings', function($params) use ($request, $response, $resultStatisticController) {
            $formId = (int) $params['formId'];

            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", function($req, $res) use ($formId, $resultStatisticController) {
                // Get the question IDs from the request body
                $requestData = $req->getBody();
                $questionIds = $requestData['questionId'] ?? [];
                error_log("Question IDs: " . json_encode($questionIds));
                // Call the controller method to get ratings for the questions
                $resultStatisticController->getQuestionsRatings($res, $formId, $questionIds);
            });
        });

        // Statistics APIs
        $statisticsController = new \Controllers\StatisticsController();
        // $router->get('/api/statistics/overview', fn() =>
        //     JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getOverviewStatistics($res, $req))
        // );
        // $router->get('/api/statistics/form', fn() =>
        //     JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormResponseStatistics($res, $req))
        // , ['formId']);
        // $router->get('/api/statistics/timeperiod', fn() =>
        //     JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getResponsesByTimePeriod($res, $req))
        // );
        // $router->get('/api/statistics/questions', fn() =>
        //     JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getQuestionResponseStatistics($res, $req))
        // , ['formId']);

        // Statistics API V2 - Enhanced with more specific endpoints and features
        $router->get('/api/v2/statistics/dashboard', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getDashboardStats($res, $req))
        );
        
        $router->get('/api/v2/statistics/forms/count', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormCountStats($res, $req))
        );
        
        $router->get('/api/v2/statistics/forms/responses', fn() =>
            JwtMiddleware::authenticate($request, $response, null, fn($req, $res) => $statisticsController->getFormResponseCounts($res, $req))
        );
        
        $router->get('/api/v2/statistics/forms/{id}', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getSingleFormStats($res, $req, $params['id']))
        );
        
        $router->get('/api/v2/statistics/forms/{id}/questions', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormQuestionStats($res, $req, $params['id']))
        );
        
        $router->get('/api/v2/statistics/forms/{id}/responses/trend', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormResponseTrend($res, $req, $params['id']))
        );
        
        $router->get('/api/v2/statistics/time-analysis', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getTimeAnalysis($res, $req))
        );
        
        $router->post('/api/v2/statistics/custom-report', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->generateCustomReport($res, $req))
        );
        
        $router->get('/api/v2/statistics/export/csv', fn() =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->exportStatisticsCsv($res, $req))
        );

        $router->get('/api/statistic/form/{id}', function($params) use ($request, $response, $resultStatisticController) {
            $_GET['id'] = (int) $params['id'];
            JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS",
                fn($req, $res) => $resultStatisticController->getStatisticByForm($req, $res, $params['id'])
            );
        });

        // Mailer API Routes
        $router->post('/api/forms/{id}/send-emails', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) =>
                $mailerController->sendEmail($req, $res)
            )
        );

        $router->post('/api/forms/{id}/add-to-queue', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) =>
                $mailerController->queueEmails($req, $res, $params['id'])
            )
        );
        $router->get('/api/forms/{id}/email-queue', fn($params) =>
            JwtMiddleware::authenticate($request, $response, "MANAGE_FORMS", fn($req, $res) =>
                $mailerController->getQueueEmails($req, $res, $params['id'])
            )
        );
        // Auth APIs
        $router->post('/api/auth/refresh', function() use ($response, $request) {
            JwtMiddleware::refresh($request, $response);
        });
        $router->post('/api/auth/logout', function() use ($response, $request) {
            JwtMiddleware::logout($request, $response);
        });





    // Xử lý routing
    $router->resolve($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);