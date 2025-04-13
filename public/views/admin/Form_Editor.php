<?php
use Core\jwt_helper;
use Services\FormService;

require_once __DIR__ . '/../../../app/Services/FormService.php';

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
$user = $decode->user ?? null;
$permissions = $decode->permissions ?? [];

// Kiểm tra quyền
function hasPermission(array $permissions, string $permID): bool {
    foreach ($permissions as $perm) {
        if ($perm->permID === $permID) {
            return true;
        }
    }
    return false;
}

// Không có quyền truy cập -> cấm
if (!$user || !hasPermission($permissions, 'EDIT_FORM')) {
    http_response_code(403);
    header('Location: /');
    exit();
}

// Kiểm tra quyền sở hữu form (nếu có formId)
$uri = $_SERVER['REQUEST_URI'];
preg_match('#^/admin/form/(\d+)/edit$#', $uri, $matches);
$formId = $matches[1] ?? null;
if ($formId) {
    $formService = new FormService(); // hoặc inject qua container nếu có
    try {
        if (!$formService->checkPermission($formId, $user->email)) {
            http_response_code(403);
            header('Location: /');
            exit();
        }
    } catch (Exception $e) {
        http_response_code(403);
        header('Location: /');
        exit();
    }
}

// Phân loại trạng thái form từ URI
$uri = $_SERVER['REQUEST_URI'];
$formStatus = 'draft';

if (preg_match('#/admin/form/\d+/edit#', $uri) && str_contains($uri, 'status=draft')) {
    $formStatus = 'draft';
} elseif (preg_match('#/admin/form/\d+/edit#', $uri)) {
    $formStatus = 'edit';
}

// Load header (và tiếp tục trang)
include __DIR__ . '/../../views/layouts/header.php';
?>

<body data-form-status="<?= $formStatus ?>">
    <div class="sub-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style="background-color: white;">
        <!-- Logo + Form Editor -->
        <div class="d-flex align-items-center gap-2">
            <a class="navbar-brand" href="/">
                <img src="/public/images/sgulogo.png" alt="SGU Logo" class="rounded" width="50" height="50">
            </a>
            <h2 class="mb-0">Biên tập khảo sát</h2>
        </div>

        <!-- Các nút công cụ và Xuất bản -->
        <div class="d-flex align-items-center gap-2">
<!--            <button class="btn btn-light" title="Chủ đề"><i class="fas fa-palette"></i></button>-->
            <div class="status-content d-flex align-items-center gap-2">
                <span class="status badge px-3 py-2" id="1">Status</span>
            </div>
            <button class="btn btn-light" title="Thêm câu hỏi"><i class="fas fa-plus"></i></button>
            <!-- Thêm câu tiêu đề -->
            <button class="btn btn-light" title="Thêm câu tiêu đề"><i class= "fas fa-heading"></i></button>
            <button class="btn btn-light" title="Xem trước"><i class="fas fa-eye"></i></button>

<!--            <button class="btn btn-light" title="Sao chép liên kết"><i class="fas fa-link"></i></button>-->
            <button class="btn btn-light" title="Thêm cộng tác viên"><i class="fas fa-user-plus"></i></button>

            <!-- Nút lưu -->
            <button class="btn btn-light btn-save" title="Lưu nháp" id="btn-save-draft">
                <i class="fas fa-save"></i>
                <span class="d-none" id="btn-save-draft-text">Lưu nháp</span>
            </button>
            <!-- Nút xuất bản -->
            <button class="btn-submit btn btn-primary fw-bold">Xuất bản</button>
            <div class="more-action justify-content-center align-items-center">
                <img src="/public/icons/three-dots-vertical.svg"  style="cursor: pointer; width: 28px; height: 28px;" alt="About action">
            </div>
            <!-- Dropdown người dùng -->
            <?php
            include __DIR__ . '/../../component/userDropdown.php';
            ?>
        </div>
    </div>



    <!-- Main content container with class .form-content -->
    <div class="form-content d-flex justify-content-center w-100" style="padding: 20px">
        <!-- Insert your form editor content here -->
    </div>


    <script src="/public/js/form_pattern.js"></script>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>