<?php

use Services\FormService;
use Core\AuthHelper;


$data = AuthHelper::verifyUserToken();
$user = $data['user'] ?? null;

$formService = new FormService();
//var_dump($user->email);
try {
    $dataF = $formService->getFormWithWhitelist($user->email);
} catch (Exception $e) {
    // Handle the exception, e.g., log it or show an error message
    $dataF = [];
    $errorMessage = "An error occurred while fetching the forms: " . $e->getMessage();

}
$forms = $dataF['forms'] ?? [];
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
                                                <strong>Loại:</strong> <?= htmlspecialchars($form['TypeName']) ?><br>
                                                <strong>Ngành:</strong> <?= htmlspecialchars($form['MajorName']) ?><br>
                                                <strong>Chu kỳ:</strong> <?= htmlspecialchars($form['PeriodName']) ?>
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