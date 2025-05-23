<?php
include __DIR__ . '/../../views/layouts/header.php';

use Core\AuthHelper;

$data = AuthHelper::verifyUserToken();
$user = $data['user'] ?? null;
$permissions = $data['permissions'] ?? null;
// Check if user has ACCESS_ADMIN permission
error_log('User permissions: ' . print_r($permissions, true));
$hasAdminAccess = false;
//Check array permissions
error_log("HasAdminBF". $hasAdminAccess);
foreach ($permissions ?? [] as $permission) {
    if (isset($permission->permID) && $permission->permID === 'ACCESS_ADMIN') {
        $hasAdminAccess = true;
        break;
    }
}
error_log("HasAdmin". $hasAdminAccess);
// If user doesn't have admin access, redirect to 403 page
if (!$hasAdminAccess) {
    header('Location: /403');
    exit;
}


include __DIR__ . '/../../views/layouts/nav-bar.php';
?>

<link rel="stylesheet" href="/public/css/adminPage.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<!-- Phần div#main với thiết kế cải tiến -->
<div id="main">
    <!-- Sidebar Container - Fixed position với thiết kế mới -->
    <div id="sidebar-container">
        <nav id="sidebar" class="py-3">
            <div class="sidebar-toggle-container">
                <button class="btn btn-toggle-sidebar" id="toggleSidebar">
                    <i class="bi bi-chevron-left"></i>
                </button>
            </div>

            <div class="sidebar-heading d-flex align-items-center px-3">
                <i class="bi bi-grid-1x2 me-2"></i>Menu chính
            </div>

            <ul class="nav-menu px-2 mb-4">
<!--                <li class="nav-item">-->
<!--                    <a href="#" class="nav-link" data-section="dashboard">-->
<!--                        <span class="nav-icon"><i class="bi bi-pie-chart"></i></span> -->
<!--                        <span class="nav-text">Thống kê</span>-->
<!--                    </a>-->
<!--                </li>-->
<!--                <li class="nav-item">-->
<!--                    <a href="/admin/statistics-dashboard" class="nav-link">-->
<!--                        <span class="nav-icon"><i class="bi bi-pie-chart"></i></span> -->
<!--                        <span class="nav-text">Thống kê nâng cao</span>-->
<!--                    </a>-->
<!--                </li>    -->
                <?php
                    foreach ($permissions ?? [] as $permission) {
                        switch ($permission->permID) {
                            case 'MANAGE_USERS':
                                echo '<li class="nav-item">
                                <a href="#" class="nav-link" data-section="accounts">
                                    <span class="nav-icon"><i class="bi bi-people"></i></span>
                                    <span class="nav-text">Tài khoản</span>
                                </a>
                            </li>';
                            break;
                            case 'MANAGE_FORMS':
                                echo '<li class="nav-item">
                                    <a href="#" class="nav-link" data-section="surveys">
                                        <span class="nav-icon"><i class="bi bi-file-earmark-ruled"></i></span>
                                        <span class="nav-text">Khảo sát</span>
                                    </a>
                                </li>';
                            break;
                            // case 'MANAGE_RESULTS':
                            //     echo '  <li class="nav-item">
                            //         <a href="#" class="nav-link" data-section="results">
                            //             <span class="nav-icon"><i class="bi bi-clipboard-data"></i></span>
                            //             <span class="nav-text">Kết quả khảo sát</span>
                            //         </a>
                            //     </li>';
                            //     break;
                            default:
                                break;
                        }
            
                    }
                ?>                       
            </ul>

            <div class="sidebar-heading d-flex align-items-center px-3">
                <i class="bi bi-gear-wide-connected me-2"></i>Quản lý hệ thống
            </div>

            <ul class="nav-menu px-2">
                 <?php
                    foreach ($permissions ?? [] as $permission) {
                        switch ($permission->permID) {
                            case 'MANAGE_ROLES':
                                echo ' <li class="nav-item">
                                    <a href="#" class="nav-link" data-section="roles">
                                        <span class="nav-icon"><i class="bi bi-shield-lock"></i></span>
                                        <span class="nav-text">Phân quyền</span>
                                    </a>
                                </li>';
                            break;
                            case 'MANAGE_POSITION':
                                echo '<li class="nav-item">
                                    <a href="#" class="nav-link" data-section="positions">
                                        <span class="nav-icon"><i class="bi bi-person-badge"></i></span>
                                        <span class="nav-text">Quản lý chức vụ</span>
                                    </a>
                                </li>';
                            break;
                            case 'MANAGE_MAJOR':
                                echo '   <li class="nav-item">
                                    <a href="#" class="nav-link" data-section="majors">
                                        <span class="nav-icon"><i class="bi bi-mortarboard"></i></span>
                                        <span class="nav-text">Quản lý ngành</span>
                                    </a>
                                </li>
                                ';
                                break;
                            case 'MANAGE_PERIOD':
                                echo '<li class="nav-item">
                                    <a href="#" class="nav-link" data-section="periods">
                                        <span class="nav-icon"><i class="bi bi-calendar-week"></i></span>
                                        <span class="nav-text">Chu kỳ</span>
                                    </a>
                                </li>';
                                break;
                            case 'MANAGE_FORM_TYPE':
                                echo '<li class="nav-item">
                                    <a href="#" class="nav-link" data-section="survey-types">
                                        <span class="nav-icon"><i class="bi bi-collection"></i></span>
                                        <span class="nav-text">Loại khảo sát</span>
                                    </a>
                                </li>';
                            break;
                            case 'MANAGE_DOCUMENT':
                                echo '<li class="nav-item">
                                    <a href="#" class="nav-link" data-section="documents">
                                        <span class="nav-icon"><i class="bi bi-file-earmark-text"></i></span>
                                        <span class="nav-text">Quản lý tài liệu</span>
                                    </a>
                                </li>';
                            break;
                            default:
                                break;

                        }
            
                    }
                ?>    
            </ul>
        </nav>
    </div>
      
    <!-- Content Area với thiết kế mới -->
    <div id="content" class="container-fluid">
       
    </div>
</div>



<script src="/public/js/admin/sidebarAdmin.js?v=<?php echo time(); ?>" type="module"></script>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>