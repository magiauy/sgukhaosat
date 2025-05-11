<?php
include __DIR__ . '/../../views/layouts/header.php';

use Core\AuthHelper;

$data = AuthHelper::verifyUserToken();

$user = $data['user'] ?? null;
$permissions = $data['permissions'] ?? null;
// Check if user has ACCESS_ADMIN permission
error_log('User permissions: ' . json_encode($permissions));
$hasAdminAccess = false;
foreach ($permissions ?? [] as $permission) {
    if (isset($permission->permID) && $permission->permID === 'ACCESS_ADMIN') {
        $hasAdminAccess = true;
        break;
    }
}
// If user doesn't have admin access, redirect to 403 page
if (!$hasAdminAccess) {
    header('Location: /403');
    exit;
}



include __DIR__ . '/../../views/layouts/nav-bar.php';
?>

<link rel="stylesheet" href="/public/css/adminPage.css">

    <div id="sidebar-container" class="d-flex flex-row">
        <div>
            <nav id="sidebar" class="d-flex flex-column p-3">
                <button class="btn btn-outline-primary mb-3" id="toggleSidebar">
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
                        <a href="/admin/results" class="nav-link">
                            <i class="bi bi-clipboard-data"></i> <span class="nav-text">Kết quả khảo sát</span>
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
                        <i class="bi bi-book"></i> <span class="nav-text">Quản lý chức vụ</span>
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
        <div id="content" class="container py-4">
            

        </div>
    </div>

<script src="/public/js/admin/sidebarAdmin.js?v=<?php echo time(); ?>" type="module"></script>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>