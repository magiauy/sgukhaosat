<?php
include __DIR__ . '/../../views/layouts/header.php';

use Core\jwt_helper;
$token = $_COOKIE['access_token'] ?? null;
if (!$token) {
    header('Location: /login');
    exit();
}
$secret = require __DIR__ . '/../../../config/JwtConfig.php';
$decode = jwt_helper::verifyJWT($token,$secret);
if (!$decode) {
    header('Location: /login');
    exit();
}
$user = $decode->user ?? null;

include __DIR__ . '/../../views/layouts/nav-bar.php';
?>
<link rel="stylesheet" href="/public/css/adminPage.css">
    <div id ="sidebar-container " class="d-flex flex-row">
        <div>
            <nav id="sidebar" class="d-flex flex-column p-3">
                <button class="btn btn-outline-light mb-3" id="toggleSidebar">
                    <i class="bi bi-list"></i>
                </button>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-house-door"></i> <span class="nav-text">Thống kê</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-people"></i> <span class="nav-text">Tài khoản</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-bar-chart"></i> <span class="nav-text">Khảo sát</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-bar-chart"></i> <span class="nav-text">Phân quyền</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                        <i class="bi bi-book"></i> <span class="nav-text">Quản lý ngành</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-calendar-week"></i> <span class="nav-text">Chu kỳ</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-collection"></i> <span class="nav-text">Loại khảo sát</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="bi bi-gear"></i> <span class="nav-text">Cài đặt</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    <!-- Content -->
        <div id="content">
            <h1>Dashboard</h1>
            <p>Welcome to the admin panel!</p>
        </div>
    </div>

<script src="/public/js/sidebarAdmin.js?v=<?php echo time(); ?>" type="module"></script>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>