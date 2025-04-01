<?php
//Load web page with the following code
use Middlewares\JwtMiddleware;
use Core\Response;
use Core\Request;

$uri = trim($_SERVER['REQUEST_URI'], '/');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();

$request = new Request();
$response = new Response();

switch (true) {
    case ($uri === ''):
        require_once __DIR__ . '/../../public/views/pages/home.php';
        break;
    case ($uri === 'login'):
        require_once __DIR__ . '/../../public/views/pages/login.php';
        break;
    case ($uri === 'admin'):
            require_once __DIR__ . '/../../public/views/admin/index.php';
        break;
    case ($uri === 'admin/form'):
        require_once __DIR__ . '/../../public/views/admin/form.php';
        break;
    case ($uri === '403'):
        showErrorPage(403);
        break;
    case ($uri === '401'):
        showErrorPage(401);
        break;
    default:
        require_once __DIR__ . '/../../public/views/404.php';
        break;

}

function showErrorPage($errorCode)
{
    switch ($errorCode) {
        case 401:
            http_response_code(401);
            require_once __DIR__ . '/../../public/views/401.php';
            break;
        case 403:
            http_response_code(403);
            require_once __DIR__ . '/../../public/views/403.php';
            break;
        default:
            http_response_code(404);
            require_once __DIR__ . '/../../public/views/404.php';
            break;
    }
}