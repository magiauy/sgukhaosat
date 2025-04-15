<?php

use Core\jwt_helper;

$token = $_COOKIE['access_token'] ?? null;
$secret = require __DIR__ . '/../../../config/JwtConfig.php';

// Redirect nếu không có token
if (!$token) {
    header('Location: /login');
    exit();
}

// Decode JWT
$token = str_replace('Bearer ', '', $token);
$decode = jwt_helper::verifyJWT($token, $secret);

if (!$decode) {
    http_response_code(401);
    header('Location: /login');
    exit();
}

$user = $decode->user ?? null;




include __DIR__ . '/../../views/layouts/header.php';
include __DIR__ . '/../../views/layouts/nav-bar.php';
?>
<body>

<div class="form-content d-flex justify-content-center w-100" style="padding: 20px">
    <!-- Insert your form editor content here -->
</div>

<script src="/public/js/view-form.js"></script>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>