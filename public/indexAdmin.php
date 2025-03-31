<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sidebar & Content</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="/public/css/adminPage.css">
</head>
<body>
    <!-- Sidebar -->
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

    <!-- Content -->
    <div id="content">
        <h1>Dashboard</h1>
        <p>Welcome to the admin panel!</p>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/public/js/sidebarAdmin.js?v=<?php echo time(); ?>" type="module"></script>
</body>
</html>
