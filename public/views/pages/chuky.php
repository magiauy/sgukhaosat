<?php
include __DIR__ . '/../../views/layouts/header.php';
use Core\AuthHelper;

$data = AuthHelper::verifyUserTokenWithoutRedirect();
$user = $data['user'] ?? null;
require_once __DIR__ .'/../layouts/nav-bar.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
?>

<link rel="stylesheet" href="/public/css/homepage.css">
<link rel="stylesheet" href="/public/css/quytrinh.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Hero Section -->
<section class="hero hero-quytrinh">
    <div class="hero-content">
        <h1>Danh Sách Quy Trình Các Chu Kỳ</h1>
        <p class="lead mb-4">Các tài liệu liên quan đến quy trình các chu kỳ đào tạo của Đại học Sài Gòn</p>
    </div>
</section>

<!-- Main Content -->
<div class="container">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mt-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Trang chủ</a></li>
            <li class="breadcrumb-item"><a href="/quytrinh">Quy trình</a></li>
            <li class="breadcrumb-item active" aria-current="page">Danh Sách Quy Trình Các Chu Kỳ</li>
        </ol>
    </nav>

    <!-- Documents List -->
    <div class="row mb-5">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Tài Liệu Quy Trình Các Chu Kỳ</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tiêu đề</th>
                                    <th>Ngày tạo</th>
                                    <th>Tệp đính kèm</th>
                                </tr>
                            </thead>                            
                            <tbody id="documentTableBody">
                                <tr>
                                    <td colspan="4" class="text-center">
                                        <div class="d-flex justify-content-center">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Đang tải...</span>
                                            </div>
                                        </div>
                                        <div class="mt-2">Đang tải dữ liệu...</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                      <!-- Pagination -->
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center mt-4">
                            <!-- Pagination will be rendered by JavaScript -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/public/js/document-view.js"></script>
<?php include __DIR__ . '/../../views/layouts/footer.php'; ?>
