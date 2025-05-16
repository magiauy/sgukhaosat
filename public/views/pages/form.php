<?php
use Core\AuthHelper;
use Services\FormService;

$authParam = $_GET['auth'] ?? null;
$path = $_SERVER['REQUEST_URI'];
$formId = null;
if (preg_match('/\/form\/(\d+)/', $path, $matches)) {
    $formId = (int)$matches[1];
}
if ($authParam) {
    $data = AuthHelper::verifyLoginUrlToken($authParam);
    $user = $data['user'] ?? null;

    if (!$user) {
        header('Location: /login');
        exit();
    }
} else {
    $data = AuthHelper::verifyUserToken();
    $user = $data['user'] ?? null;
}

//Kiểm tra quyền truy cập form
if (empty($user)) {
    header('Location: /login');
    exit();
}
$formService = new FormService();
$formService = new FormService();
try {
    $dataF = $formService->checkWhitelist($formId,$user->email ?? $user['email'] ?? '');
    if (!$dataF) {
        header('Location: /login');
        exit();
    }
} catch (Exception $e) {
    error_log("Error fetching form data: " . $e->getMessage());
    header('Location: /login');
}




//error_log("Permissions: " . json_encode($data['permissions']));
include_once __DIR__ . '/../../views/layouts/header.php';
include_once __DIR__ . '/../../views/layouts/nav-bar.php';
?>
<body>
<!-- Loading overlay -->
<div class="form-content d-flex justify-content-center w-100" style="padding: 20px">
    <!-- Insert your form editor content here -->
</div>
<div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="successModalLabel">Thành công </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Khảo sát của bạn đã được gửi đi
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <a href="/"><button type="button" class="btn btn-primary" id="btn-go-home">Về trang chủ</button></a>
                </div>
            </div>
        </div>
    </div>
<script src="/public/js/view-form.js" type="module"></script>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>