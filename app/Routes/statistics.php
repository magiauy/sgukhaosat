<?php
//use Core\Request;
//use Core\Response;
//use Core\Router;
//use Middlewares\JwtMiddleware;
//use Controllers\StatisticsControllerV2;
//use Services\StatisticsServiceV2;
//
//$request = new Request();
//$response = new Response();
//$router = new Router();
//
//// Initialize Statistics controller with enhanced service
//$statisticsController = new StatisticsControllerV2();
//
//// Statistics API V2 - Enhanced endpoints
//$router->get('/api/v2/statistics/dashboard', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getDashboardStats($res, $req))
//);
//
//$router->get('/api/v2/statistics/forms/count', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormCountStats($res, $req))
//);
//
//$router->get('/api/v2/statistics/forms/responses', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormResponseCounts($res, $req))
//);
//
//$router->get('/api/v2/statistics/forms/{id}', fn($params) =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getSingleFormStats($res, $req, $params['id']))
//);
//
//$router->get('/api/v2/statistics/forms/{id}/questions', fn($params) =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormQuestionStats($res, $req, $params['id']))
//);
//
//$router->get('/api/v2/statistics/forms/{id}/responses/trend', fn($params) =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getFormResponseTrend($res, $req, $params['id']))
//);
//
//$router->get('/api/v2/statistics/time-analysis', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->getTimeAnalysis($res, $req))
//);
//
//$router->post('/api/v2/statistics/custom-report', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->generateCustomReport($res, $req))
//);
//
//$router->get('/api/v2/statistics/export/csv', fn() =>
//    JwtMiddleware::authenticate($request, $response, "MANAGE_RESULTS", fn($req, $res) => $statisticsController->exportStatisticsCsv($res, $req))
//);
//