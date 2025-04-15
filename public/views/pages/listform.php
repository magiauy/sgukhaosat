<?php

use Services\Interface\IFormService;
use Services\FormService;
use Core\jwt_helper;
use Middlewares\JwtMiddleware;

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



$formService = new FormService();
//var_dump($user->email);
$data = $formService->getFormWithWhitelist($user->email);
$forms = $data['forms'] ?? [];
include __DIR__ . '/../../views/layouts/header.php';
include __DIR__ . '/../../views/layouts/nav-bar.php';
?>
    <div class="container my-5 custom-container main-content">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <!-- Card bọc toàn bộ nội dung -->
                <div class="card bg-light shadow-lg rounded p-4">
                    <h1 class="text-center mb-4">Danh sách khảo sát</h1>
                    <div class="row g-4">
                        <?php foreach ($forms as $form): ?>
                            <div class="col-md-6 col-lg-6">
                                <a href="/form/<?= $form['FID'] ?>" class="text-decoration-none text-dark">
                                    <div class="card shadow-sm h-100 hover-card">
                                        <div class="card-body">
                                            <h5 class="card-title text-truncate"><?= htmlspecialchars($form['FName']) ?></h5>
                                            <p class="card-text">
                                                <strong>Loại:</strong> <?= htmlspecialchars($form['TypeID']) ?><br>
                                                <strong>Mã Ngành:</strong> <?= htmlspecialchars($form['MajorID']) ?><br>
                                                <strong>Chu kỳ:</strong> <?= htmlspecialchars($form['PeriodID']) ?>
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        <?php endforeach; ?>
                    </div>

                </div>
            </div>
        </div>
    </div>


<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>