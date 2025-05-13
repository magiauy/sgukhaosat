<?php
use Core\Request;
use Core\Response;
use Core\Router;
use Middlewares\JwtMiddleware;

$request = new Request();
$response = new Response();
$router = new Router();
$token = $_COOKIE['access_token'] ?? null;

// Middleware function to handle authentication
function authMiddleware($permission, $callback) {
    global $token;
    return function() use ($token, $permission, $callback) {
        $result = JwtMiddleware::authenticatePage($token, $permission);
        switch ($result) {
            case 200:
                return $callback();
            case 403:
                showErrorPage(403);
                exit;
            case 401:
                header('Location: /login');
                exit;
            default:
                showErrorPage(500);
                exit;
        }
    };
}

// Basic pages - no /api/ prefix for web routes
$router->get('/', function() {
    require_once __DIR__ . '/../../public/views/pages/home.php';
});

$router->get('/login', function() {
    require_once __DIR__ . '/../../public/views/pages/login.php';
});

// Admin routes with auth middleware
$router->get('/admin',  function() {
    require_once __DIR__ . '/../../public/views/admin/index.php';
});

$router->get('/admin/form', function() {
    require_once __DIR__ . '/../../public/views/admin/form.php';
});

$router->get('/admin/form/create', authMiddleware("MANAGE_FORMS", function() {
    require_once __DIR__ . '/../../public/views/admin/Form_Editor.php';
}));

$router->get('/admin/form/{id}/edit', function($params) {
    $formId = $params['id'];
    require_once __DIR__ . '/../../public/views/admin/Form_Editor.php';
});

$router->get('/admin/results', authMiddleware("MANAGE_RESULTS", function() {
    require_once __DIR__ . '/../../public/views/admin/results_management.php';
}));

$router->get('/admin/statistics-dashboard', authMiddleware("MANAGE_RESULTS", function() {
    require_once __DIR__ . '/../../public/views/statistics-dashboard.php';
}));

$router->get('/admin/statistics', authMiddleware("MANAGE_RESULTS", function() {
    require_once __DIR__ . '/../../public/views/statistics-dashboard.php';
}));

// Other pages
$router->get('/quytrinh/chuandaura', function() {
    require_once __DIR__ . '/../../public/views/pages/chuandaura.php';
});

$router->get('/form/{id}', function($params) {
    require_once __DIR__ . '/../../public/views/pages/form.php';
});

$router->get('/form', function() {
    require_once __DIR__ . '/../../public/views/pages/listform.php';
});

// Error pages
$router->get('/403', function() { showErrorPage(403); });
$router->get('/401', function() { showErrorPage(401); });
$router->get('/404', function() { showErrorPage(404); });

function showErrorPage($errorCode) {
    switch ($errorCode) {
        case 401:
            http_response_code(401);
            require_once __DIR__ . '/../../public/views/401.php';
            break;
        case 403:
            http_response_code(403);
            require_once __DIR__ . '/../../public/views/403.php';
            break;
        case 500:
            http_response_code(500);
            require_once __DIR__ . '/../../public/views/500.php';
            break;
        default:
            http_response_code(404);
            require_once __DIR__ . '/../../public/views/404.php';
            break;
    }
}

// Giải quyết vấn đề 404 cho web routes - đặt đường dẫn này vào CUỐI CÙNG
$router->get('/{any}', function() {
    showErrorPage(404);
});

// Chỉ xử lý routing cho non-API requests
$path = $_SERVER['REQUEST_URI'];
if (!str_starts_with($path, '/api/')) {
    $router->resolve($_SERVER['REQUEST_METHOD'], $path);
}