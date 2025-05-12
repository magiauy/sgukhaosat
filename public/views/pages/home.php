<?php
include __DIR__ . '/../../views/layouts/header.php';
use Core\AuthHelper;

$data = AuthHelper::verifyUserTokenWithoutRedirect();
$user = $data['user'] ?? null;
require_once __DIR__ .'/../layouts/nav-bar.php'
?>
<link rel="stylesheet" href="/public/css/homepage.css">
<!-- Hero Section -->
<section class="hero">
    <div class="hero-content">
        <h1>Hệ thống khảo sát chuẩn đầu ra Đại học Sài Gòn</h1>
        <p class="lead mb-4">Đóng góp ý kiến của bạn để cùng nâng cao chất lượng đào tạo</p>
        <div class="d-flex justify-content-center gap-3">
            <a href="/form" class="btn btn-light btn-lg">Tham gia khảo sát</a>
            <a href="#about" class="btn btn-outline-light btn-lg">Tìm hiểu thêm</a>
        </div>
    </div>
</section>

<!-- Main Content -->
<div class="container" id="about">
    <div class="row mb-5">
        <div class="col-lg-8 mx-auto text-center">
            <h2 class="section-title">Nâng cao chất lượng đào tạo cùng Đại học Sài Gòn</h2>
            <p class="lead">
                Chúng tôi trân trọng ý kiến từ cựu sinh viên, đối tác và sinh viên sắp ra trường để không ngừng
                cải thiện chương trình đào tạo, đáp ứng nhu cầu thực tiễn của thị trường lao động và xã hội.
            </p>
        </div>
    </div>

    <div class="row mb-5">
        <div class="col-md-4 mb-4">
            <div class="feature-card">
                <div class="text-center mb-3">
                    <i class="feature-icon bi bi-mortarboard-fill"></i>
                </div>
                <h3 class="h4 text-center">Dành cho cựu sinh viên</h3>
                <p>Chia sẻ kinh nghiệm thực tế của bạn sau khi tốt nghiệp để giúp chúng tôi điều chỉnh chương trình đào tạo phù hợp hơn với thực tiễn công việc.</p>
            </div>
        </div>

        <div class="col-md-4 mb-4">
            <div class="feature-card">
                <div class="text-center mb-3">
                    <i class="feature-icon bi bi-building"></i>
                </div>
                <h3 class="h4 text-center">Dành cho đối tác</h3>
                <p>Góp phần định hình năng lực sinh viên tốt nghiệp, đảm bảo nguồn nhân lực chất lượng cao đáp ứng nhu cầu doanh nghiệp và thị trường.</p>
            </div>
        </div>

        <div class="col-md-4 mb-4">
            <div class="feature-card">
                <div class="text-center mb-3">
                    <i class="feature-icon bi bi-person-workspace"></i>
                </div>
                <h3 class="h4 text-center">Dành cho sinh viên sắp ra trường</h3>
                <p>Đánh giá trải nghiệm học tập của bạn và đóng góp ý kiến để cải thiện chương trình học cho các khóa sau.</p>
            </div>
        </div>
    </div>
</div>




<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>