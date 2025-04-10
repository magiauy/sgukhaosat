<?php
use Core\jwt_helper;
$token = $_COOKIE['access_token'] ?? null;
if (!$token) {
    header('Location: /login');
    exit();
}
$secret = require __DIR__ . '/../../../config/JwtConfig.php';
$decode = jwt_helper::verifyJWT($token,$secret);
$user = $decode->user ?? null;

$uri = $_SERVER['REQUEST_URI'];
$formStatus = 'create'; // mặc định là tạo mới

if (str_contains($uri, '/admin/form/create')) {
    $formStatus = 'create';
} elseif (preg_match('#/admin/form/\d+/edit#', $uri)) {
    $formStatus = 'edit';
} elseif (preg_match('#/admin/form/\d+/edit#', $uri) && str_contains($uri, 'status=draft')) {
    $formStatus = 'draft';
}
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
            <button class="btn btn-light" title="Xem trước"><i class="fas fa-eye"></i></button>
<!--            <button class="btn btn-light" title="Hoàn tác"><i class="fas fa-undo-alt"></i></button>-->
<!--            <button class="btn btn-light" title="Làm lại"><i class="fas fa-redo-alt"></i></button>-->
<!--            <button class="btn btn-light" title="Sao chép liên kết"><i class="fas fa-link"></i></button>-->
            <button class="btn btn-light" title="Thêm cộng tác viên"><i class="fas fa-user-plus"></i></button>

            <!-- Nút xuất bản -->
            <button class="btn-submit btn btn-primary fw-bold">Xuất bản</button>

            <!-- Dropdown người dùng -->
            <div class="dropdown">
                <button class="btn dropdown-toggle d-flex align-items-center gap-2"
                        type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-5"></i>
                    <span id="username"><?= $user->fullName ?? "User" ?></span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end mt-2 shadow-lg border-0 rounded-3"
                    aria-labelledby="dropdownMenuButton">
                    <li class="px-3 py-2">
                        <p class="mb-0 fw-bold text-dark" id="dropdown-username"><?= $user->fullName ?? "User" ?></p>
                        <small class="text-muted" id="dropdown-email"><?= $user->email ?? ""  ?></small>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item py-2 d-flex align-items-center gap-2" id ="btn-admin" href="/admin">
                            <i class="bi bi-house"></i> Trang quản trị
                        </a>
                    </li>

                    <li>
                        <a class="dropdown-item py-2 text-danger fw-bold d-flex align-items-center gap-2" href="/" id="logout">
                            <i class="bi bi-box-arrow-right"></i> Đăng xuất
                        </a>
                    </li>
                </ul>
            </div>
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