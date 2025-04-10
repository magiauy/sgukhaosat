<?php
include __DIR__ . '/../../views/layouts/header.php';
use Core\jwt_helper;
$token = $_COOKIE['access_token'] ?? null;
$secret = require __DIR__ . '/../../../config/JwtConfig.php';
if ($token) {
    $decode = jwt_helper::verifyJWT($token, $secret);
    if ($decode) {
        $user = $decode->user ?? null;
    }else{
        setcookie('access_token', '', time() - 3600, '/');
        header('Location: /');
        exit();
    }
} else {
    $user = null;
}
require_once __DIR__ .'/../layouts/nav-bar.php'

?>
    <!-- Home page content -->
    <div class="container main-content d-flex flex-column">
        <div class="row flex-grow-1">
            <div class="col-md-12">
                <h1 class="text-center mt-5">Trang chủ</h1>
            </div>
        </div>
    </div>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>