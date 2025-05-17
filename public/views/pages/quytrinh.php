<?php
include __DIR__ . '/../../views/layouts/header.php';
use Core\AuthHelper;

$data = AuthHelper::verifyUserTokenWithoutRedirect();
$user = $data['user'] ?? null;
require_once __DIR__ .'/../layouts/nav-bar.php'
?>
<link rel="stylesheet" href="/public/css/homepage.css">
<link rel="stylesheet" href="/public/css/quytrinh.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Hero Section -->
<section class="hero hero-quytrinh">
    <div class="hero-content">
        <h1>Quy Trình Khảo Sát</h1>
        <p class="lead mb-4">Hiểu rõ quy trình khảo sát tại Đại học Sài Gòn</p>
    </div>
</section>

<!-- Main Content -->
<div class="container">
    <!-- Giới thiệu -->
    <div class="row mb-5">
        <div class="col-lg-8 mx-auto text-center">
            <h2 class="section-title">Quy Trình Khảo Sát Tại Đại Học Sài Gòn</h2>
            <p class="lead">
                Hệ thống khảo sát của Đại học Sài Gòn được xây dựng nhằm thu thập và phân tích ý kiến của sinh viên, 
                giảng viên và các bên liên quan để không ngừng cải thiện chất lượng đào tạo. 
                Dưới đây là quy trình khảo sát chi tiết của trường.
            </p>
        </div>
    </div>

    <!-- Quy trình tổng quan -->
    <div class="row mb-5">
        <div class="col-12">
            <h3 class="mb-4 text-center">Quy Trình Khảo Sát Tổng Quan</h3>
            
            <div class="process-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h5>Thiết Kế Khảo Sát</h5>
                    <p>Quản trị viên thiết kế mẫu khảo sát với các câu hỏi phù hợp để thu thập thông tin cần thiết.</p>
                </div>
            </div>
            
            <div class="process-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h5>Phát Hành Khảo Sát</h5>
                    <p>Hệ thống phát hành khảo sát đến đối tượng mục tiêu thông qua email hoặc trên trang web.</p>
                </div>
            </div>
            
            <div class="process-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h5>Thu Thập Phản Hồi</h5>
                    <p>Người tham gia hoàn thành khảo sát và gửi lại phản hồi thông qua hệ thống.</p>
                </div>
            </div>
            
            <div class="process-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h5>Phân Tích Dữ Liệu</h5>
                    <p>Dữ liệu từ các phản hồi được hệ thống tự động tổng hợp và phân tích.</p>
                </div>
            </div>
            
            <div class="process-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h5>Báo Cáo Và Cải Thiện</h5>
                    <p>Báo cáo được tạo ra và sử dụng để đưa ra các giải pháp cải thiện chất lượng đào tạo.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Các loại khảo sát -->
    <div class="row mb-5">
        <div class="col-12 text-center mb-4">
            <h3>Đối tượng khảo Sát</h3>
        </div>

        <div class="col-md-4">
            <div class="card process-card h-100">
                <div class="card-body text-center">
                    <div class="process-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <h5 class="card-title">Khảo Sát Sinh Viên</h5>
                    <p class="card-text">Thu thập ý kiến của sinh viên về chất lượng giảng dạy, nội dung môn học, cơ sở vật chất và các hoạt động hỗ trợ.</p>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card process-card h-100">
                <div class="card-body text-center">
                    <div class="process-icon">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <h5 class="card-title">Khảo Sát Giảng Viên</h5>
                    <p class="card-text">Lấy ý kiến giảng viên về môi trường làm việc, chính sách đào tạo và nghiên cứu, cũng như các hỗ trợ từ nhà trường.</p>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card process-card h-100">
                <div class="card-body text-center">
                    <div class="process-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h5 class="card-title">Khảo Sát Doanh Nghiệp</h5>
                    <p class="card-text">Thu thập phản hồi từ các doanh nghiệp về chất lượng của sinh viên tốt nghiệp và yêu cầu thị trường lao động.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Thời gian khảo sát -->
    <div class="row mb-5">
        <div class="col-12 text-center mb-4">
            <h3>Lịch Trình Khảo Sát</h3>
            <p>Lịch trình khảo sát chuẩn của Đại học Sài Gòn trong năm học</p>
        </div>

        <div class="col-12">
            <table class="table table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>Loại Khảo Sát</th>
                        <th>Thời Gian Thực Hiện</th>
                        <th>Đối Tượng Tham Gia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Khảo sát đánh giá môn học</td>
                        <td>Cuối mỗi học kỳ (tháng 1 và tháng 6)</td>
                        <td>Sinh viên đã học môn học</td>
                    </tr>
                    <tr>
                        <td>Khảo sát sinh viên mới nhập học</td>
                        <td>Tháng 9 - tháng 10 hàng năm</td>
                        <td>Sinh viên năm nhất</td>
                    </tr>
                    <tr>
                        <td>Khảo sát sinh viên sắp tốt nghiệp</td>
                        <td>Tháng 4 - tháng 5 hàng năm</td>
                        <td>Sinh viên năm cuối</td>
                    </tr>
                    <tr>
                        <td>Khảo sát cựu sinh viên</td>
                        <td>Tháng 8 - tháng 9 hàng năm</td>
                        <td>Cựu sinh viên đã tốt nghiệp 1 năm</td>
                    </tr>
                    <tr>
                        <td>Khảo sát doanh nghiệp</td>
                        <td>Quý III hàng năm</td>
                        <td>Doanh nghiệp có sinh viên thực tập hoặc làm việc</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Lợi ích của khảo sát -->
    <div class="row mb-5">
        <div class="col-12 text-center mb-4">
            <h3>Lợi Ích Của Việc Tham Gia Khảo Sát</h3>
        </div>

        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Đối Với Sinh Viên</h5>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Góp phần cải thiện chất lượng giảng dạy</li>
                        <li class="list-group-item">Được lắng nghe và giải quyết các vấn đề trong học tập</li>
                        <li class="list-group-item">Cơ hội đóng góp vào sự phát triển của nhà trường</li>
                        <li class="list-group-item">Nâng cao trải nghiệm học tập và đời sống sinh viên</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">Đối Với Nhà Trường</h5>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Thu thập dữ liệu phục vụ cải tiến chương trình đào tạo</li>
                        <li class="list-group-item">Đáp ứng yêu cầu đánh giá và kiểm định chất lượng</li>
                        <li class="list-group-item">Nhận diện được điểm mạnh, điểm yếu trong công tác đào tạo</li>
                        <li class="list-group-item">Xây dựng kế hoạch phát triển phù hợp với nhu cầu xã hội</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- FAQ -->
    <div class="row mb-5">
        <div class="col-12 text-center mb-4">
            <h3>Câu Hỏi Thường Gặp</h3>
        </div>

        <div class="col-12">
            <div class="accordion" id="accordionFAQ">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Lorem ipsum dolor sit amet consectetur.
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionFAQ">
                        <div class="accordion-body">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Thông tin khảo sát của tôi có được bảo mật không?
                        </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionFAQ">
                        <div class="accordion-body">
                            Tất cả thông tin từ các cuộc khảo sát đều được bảo mật. 
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingThree">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            Làm thế nào để biết kết quả của các cuộc khảo sát?
                        </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionFAQ">
                        <div class="accordion-body">
                            Kết quả tổng hợp của các cuộc khảo sát sẽ được công bố trên website của trường hoặc qua email cho các bên liên quan. 
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingFour">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                            Tôi có thể đóng góp ý kiến ngoài các đợt khảo sát chính thức không?
                        </button>
                    </h2>
                    <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionFAQ">
                        <div class="accordion-body">
                            Có, ngoài các đợt khảo sát chính thức, bạn luôn có thể gửi ý kiến đóng góp thông qua trang Liên hệ của trường hoặc gửi trực tiếp đến phòng/ban chức năng liên quan.
                        </div>
                    </div>
                </div>
            </div>
        </div>    </div>

    <!-- Documents section -->
    <!-- <div class="row mb-5">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Tài Liệu Quy Trình Khảo Sát</h5>
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
                     -->
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

    <!-- CTA -->
    <div class="row mb-5">
        <div class="col-12 text-center">
            <div class="card bg-light p-4">
                <div class="card-body">
                    <h4>Tham Gia Khảo Sát</h4>
                    <p>Hãy để tiếng nói của bạn được lắng nghe và góp phần xây dựng Đại học Sài Gòn ngày càng phát triển</p>
                    <a href="/form" class="btn btn-primary btn-lg">Tham Gia Khảo Sát</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/public/js/document-view.js"></script>
<?php include __DIR__ . '/../../views/layouts/footer.php'; ?>
