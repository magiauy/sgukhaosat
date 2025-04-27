<?php
include __DIR__ . '/../../views/layouts/header.php';
<<<<<<< HEAD
?>
    <head>
        <link rel="stylesheet" href="/public/css/homepage.css">
    </head>
    <div>
        <section class="hero">
            <div class="overlay"></div>
                <h1 class="">Đánh giá chất lượng giảng dạy cho sinh viên Trường Đại Học Sài Gòn</h1>
                <p>Tiếng nói của bạn, sự thay đổi của chúng tôi</p>
                <a href="#" class="btn">Danh sách các đánh giá →</a>
        </section>
    
        <section class="main-content">
            <h2>Cùng nhau tạo nên một môi trường học tập tốt hơn</h2>
            <h3>Nói lên suy nghĩ, góp phần thay đổi ngôi trường của mình! Chỉ với vài phút,
                 bạn có thể giúp nhà trường hiểu rõ hơn về trải nghiệm của sinh viên,
                  từ đó cải thiện chất lượng giảng dạy, cơ sở vật chất, dịch vụ hỗ trợ và nhiều hơn nữa.</h3>
            <div class="content-item">
                <img src="/public/images/pie-chart-1.png" alt="Pie Chart 1">
                <div>
                    <h3>Góp ý của bạn đều được xem xét</h3>
                    <p>Chúng tôi luôn lắng nghe và đánh giá cao mọi ý kiến đóng góp từ bạn.</p>
                </div>
=======
use Core\jwt_helper;
$token = $_COOKIE['access_token'] ?? null;
$secret = require __DIR__ . '/../../../config/JwtConfig.php';
if ($token) {
    $decode = jwt_helper::verifyJWT($token, $secret);
    if ($decode) {
        $user = $decode->user ?? null;
    }else{
        setcookie('access_token', '', time() - 3600, '/');
        header('Location: /');
        exit();
    }
} else {
    $user = null;
}
require_once __DIR__ .'/../layouts/nav-bar.php'

?>
    <!-- Home page content -->
    <div class="container main-content d-flex flex-column">
        <div class="row flex-grow-1">
            <div class="col-md-12">
                <h1 class="text-center mt-5">Trang chủ</h1>
>>>>>>> d0f9b8e3ba89c6a21afec0e337860ff94d796412
            </div>
        
            <div class="content-item-2">
                <div>
                    <h3>Góp ý của bạn giúp chúng tôi phát triển</h3>
                    <p>Sự đóng góp của bạn là động lực để chúng tôi không ngừng hoàn thiện.</p>
                </div>
                <img src="/public/images/pie-chart-1.png" alt="Pie Chart 2" class="image-piechart2">
            </div>
        
            <button class="cta-button">Gửi tâm tư của bạn cho chúng tôi</button>
        </section>
    </div>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>