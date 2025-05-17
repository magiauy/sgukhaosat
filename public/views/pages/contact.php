<?php
include __DIR__ . '/../../views/layouts/header.php';
use Core\AuthHelper;

$data = AuthHelper::verifyUserTokenWithoutRedirect();
$user = $data['user'] ?? null;
require_once __DIR__ .'/../layouts/nav-bar.php'
?>
<link rel="stylesheet" href="/public/css/homepage.css">
<link rel="stylesheet" href="/public/css/contact.css">

<!-- Hero Section -->
<section class="hero hero-contact">
    <div class="hero-content">
        <h1>Liên Hệ với Chúng Tôi</h1>
        <p class="lead mb-4">Đóng góp ý kiến hoặc liên hệ với đội ngũ phát triển Đại học Sài Gòn</p>
    </div>
</section>

<!-- Main Content -->
<div class="container contact-container" id="contact-form">
    <div class="row mb-5">
        <div class="col-lg-8 mx-auto text-center">
            <h2 class="section-title">Gửi Thông Tin Liên Hệ</h2>
            <p class="lead">
                Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp, giải đáp thắc mắc hoặc hỗ trợ bạn với mọi vấn đề liên quan đến hệ thống khảo sát của Đại học Sài Gòn.
            </p>
        </div>
    </div>

    <div class="row">
        <!-- Contact Form -->
        <div class="col-lg-7 mb-5">
            <div class="card contact-card shadow-sm border-0">
                <div class="card-body p-4 p-md-5">
                    <form id="contactForm" action="/contact/submit" method="post" class="needs-validation" novalidate>
                        <div class="mb-4">
                            <label for="name" class="form-label fw-medium">Họ và tên <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-light-subtle"><i class="bi bi-person"></i></span>
                                <input type="text" class="form-control border-light-subtle" id="name" name="name" placeholder="Nhập họ tên của bạn" required 
                                    value="<?php echo $user ? htmlspecialchars($user->fullName ?? '') : ''; ?>">
                                <div class="invalid-feedback">Vui lòng nhập họ và tên</div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="email" class="form-label fw-medium">Email <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-light-subtle"><i class="bi bi-envelope"></i></span>
                                <input type="email" class="form-control border-light-subtle" id="email" name="email" placeholder="Nhập địa chỉ email" required
                                    value="<?php echo $user ? htmlspecialchars($user->email ?? '') : ''; ?>">
                                <div class="invalid-feedback">Vui lòng nhập email hợp lệ</div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="phone" class="form-label fw-medium">Số điện thoại</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-light-subtle"><i class="bi bi-telephone"></i></span>
                                <input type="tel" class="form-control border-light-subtle" id="phone" name="phone" placeholder="Nhập số điện thoại">
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="subject" class="form-label fw-medium">Chủ đề <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-light-subtle"><i class="bi bi-chat-left-text"></i></span>
                                <select class="form-select border-light-subtle" id="subject" name="subject" required>
                                    <option value="" selected disabled>Chọn chủ đề</option>
                                    <option value="help">Yêu cầu hỗ trợ</option>
                                    <option value="feedback">Góp ý về hệ thống</option>
                                    <option value="bug">Báo cáo lỗi</option>
                                    <option value="cooperation">Hợp tác</option>
                                    <option value="other">Khác</option>
                                </select>
                                <div class="invalid-feedback">Vui lòng chọn chủ đề</div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="message" class="form-label fw-medium">Nội dung <span class="text-danger">*</span></label>
                            <textarea class="form-control border-light-subtle" id="message" name="message" rows="5" placeholder="Nhập nội dung tin nhắn" required></textarea>
                            <div class="invalid-feedback">Vui lòng nhập nội dung tin nhắn</div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="agree" name="agree" required>
                                <label class="form-check-label" for="agree">
                                    Tôi đồng ý với <a href="#" data-bs-toggle="modal" data-bs-target="#privacyModal">điều khoản bảo mật</a> khi gửi thông tin
                                </label>
                                <div class="invalid-feedback">
                                    Bạn cần đồng ý với điều khoản bảo mật
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="bi bi-send me-2"></i> Gửi tin nhắn
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Contact Information -->
        <div class="col-lg-5">
            <div class="contact-info">
                <h3 class="mb-4">Thông Tin Liên Hệ</h3>
                
                <div class="info-card mb-4">
                    <div class="d-flex">
                        <div class="info-icon">
                            <i class="bi bi-geo-alt"></i>
                        </div>
                        <div class="info-content">
                            <h5>Địa chỉ</h5>
                            <p>273 An Dương Vương, Phường 3, Quận 5, Thành phố Hồ Chí Minh</p>
                        </div>
                    </div>
                </div>
                
                <div class="info-card mb-4">
                    <div class="d-flex">
                        <div class="info-icon">
                            <i class="bi bi-telephone"></i>
                        </div>
                        <div class="info-content">
                            <h5>Điện thoại</h5>
                            <p>
                                <a href="tel:+84 28 3835 4003">+84 28 3835 4003</a><br>
                                <a href="tel:+84 28 3835 5267">+84 28 3835 5267</a>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="info-card mb-4">
                    <div class="d-flex">
                        <div class="info-icon">
                            <i class="bi bi-envelope"></i>
                        </div>
                        <div class="info-content">
                            <h5>Email</h5>
                            <p>
                                <a href="mailto:contact@sgu.edu.vn">contact@sgu.edu.vn</a><br>
                                <a href="mailto:support@sgu.edu.vn">support@sgu.edu.vn</a>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="info-card mb-4">
                    <div class="d-flex">
                        <div class="info-icon">
                            <i class="bi bi-clock"></i>
                        </div>
                        <div class="info-content">
                            <h5>Giờ làm việc</h5>
                            <p>
                                Thứ Hai - Thứ Sáu: 7:30 - 17:00<br>
                                Thứ Bảy: 8:00 - 11:30<br>
                                Chủ Nhật: Nghỉ
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="social-links mt-4">
                    <h5 class="mb-3">Kết nối với chúng tôi</h5>
                    <div class="d-flex gap-3">
                        <a href="https://www.facebook.com/SGUDHSG" class="social-icon" target="_blank">
                            <i class="bi bi-facebook"></i>
                        </a>
                        <a href="#" class="social-icon" target="_blank">
                            <i class="bi bi-youtube"></i>
                        </a>
                        <a href="#" class="social-icon" target="_blank">
                            <i class="bi bi-linkedin"></i>
                        </a>
                        <a href="https://sgu.edu.vn" class="social-icon" target="_blank">
                            <i class="bi bi-globe"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Google Map Section -->
<section class="map-section mt-5">
    <div class="container-fluid p-0">
        <div class="row g-0">
            <div class="col-12">
                <div class="map-container">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.675134181548!2d106.67980457457475!3d10.759501159506641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b7c3ed289%3A0xa06651894598e488!2sSaigon%20University!5e0!3m2!1sen!2s!4v1747105706400!5m2!1sen!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Privacy Policy Modal -->
<div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="privacyModalLabel">Điều khoản bảo mật</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <h5>Chính sách bảo mật thông tin</h5>
                <p>Trường Đại học Sài Gòn cam kết bảo mật thông tin cá nhân của bạn. Chúng tôi chỉ thu thập những thông tin cần thiết để hỗ trợ bạn.</p>
                
                <h5>Mục đích thu thập thông tin</h5>
                <p>Thông tin cá nhân được thu thập nhằm mục đích:</p>
                <ul>
                    <li>Liên hệ và hỗ trợ giải đáp thắc mắc</li>
                    <li>Cải thiện chất lượng dịch vụ</li>
                    <li>Gửi thông báo về những thay đổi trong hệ thống</li>
                </ul>
                
                <h5>Phạm vi sử dụng thông tin</h5>
                <p>Trường Đại học Sài Gòn cam kết không chia sẻ thông tin của bạn cho bất kỳ bên thứ ba nào nếu không có sự đồng ý từ bạn, trừ khi có yêu cầu từ cơ quan chức năng có thẩm quyền.</p>
                
                <h5>Thời gian lưu trữ</h5>
                <p>Thông tin cá nhân của bạn sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự bạn đăng nhập và thực hiện xóa thông tin. Trong mọi trường hợp, thông tin cá nhân của bạn sẽ được bảo mật trên máy chủ của Trường Đại học Sài Gòn.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Đã hiểu</button>
            </div>
        </div>
    </div>
</div>

<!-- Success Modal -->
<div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body text-center p-4">
                <div class="mb-3">
                    <i class="bi bi-check-circle text-success" style="font-size: 4rem;"></i>
                </div>
                <h5 class="mb-3">Gửi tin nhắn thành công!</h5>
                <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                <button type="button" class="btn btn-primary mt-3" data-bs-dismiss="modal">Đóng</button>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

<script>
// Form validation
(function() {
    'use strict';
    
    // Fetch all forms with needs-validation class
    var forms = document.querySelectorAll('.needs-validation');
    
    // Loop through them and prevent submission if fields are invalid
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                // If form is valid, prevent default and show success modal
                event.preventDefault();
                
                // Here you would normally send the form data via AJAX
                // For demo purposes, we'll just show the success modal
                var successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // Reset form after successful submission
                form.reset();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
})();
</script>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>