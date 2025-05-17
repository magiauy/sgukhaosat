<?php

use Services\FormService;
use Core\AuthHelper;


$data = AuthHelper::verifyUserToken();
$user = $data['user'] ?? null;

$formService = new FormService();
//var_dump($user->email);
// $userCurrent = (array)$user;

<<<<<<< HEAD
var_dump($user);
=======
// var_dump($user);
>>>>>>> temp-fix


try {
    $dataF = $formService->getFormWithWhitelist($user->email);
} catch (Exception $e) {
    // Handle the exception, e.g., log it or show an error message
    $dataF = [];
    $errorMessage = "An error occurred while fetching the forms: " . $e->getMessage();

}
$forms = $dataF['forms'] ?? [];
include __DIR__ . '/../../views/layouts/header.php';
include __DIR__ . '/../../views/layouts/nav-bar.php';
?>
    <div class="container my-5 custom-container main-content">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <!-- Card bọc toàn bộ nội dung -->
                <div class="card bg-light shadow-lg rounded p-4">
                    <h1 class="text-center mb-4">Danh sách khảo sát</h1>
                    <div class="row g-4">
                        <?php foreach ($forms as $form): ?>
                            <div class="col-md-6 col-lg-6">
                                <a href="/form/<?= $form['FID'] ?>" class="text-decoration-none text-dark">
                                    <div class="card shadow-sm h-100 hover-card">
                                        <div class="card-body">
                                            <h5 class="card-title text-truncate"><?= htmlspecialchars($form['FName']) ?></h5>
                                            <p class="card-text">
                                                <strong>Loại:</strong> <?= htmlspecialchars($form['TypeName']) ?><br>
                                                <strong>Ngành:</strong> <?= htmlspecialchars($form['MajorName']) ?><br>
                                                <strong>Chu kỳ:</strong> <?= htmlspecialchars($form['PeriodName']) ?>
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        <?php endforeach; ?>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <script type="module">
        // Import hàm showFormUpdate từ file script.js
        import { showFormUpdate } from '/public/js/script.js';
        import { callApi } from '/public/js/apiService.js';
<<<<<<< HEAD
        import { showSwalToast } from '/public/js/form/utils/notifications.js';
        import {validatePhoneNumber}    from '/public/js/checkInput.js';
        let account = <?php echo json_encode($user); ?>;

        
        <?php if ($user->isFirstLogin == 1): ?>
            // Chuyển đổi PHP object thành JavaScript object
            
            const modalHTML = `
            <div class="modal fade" id="accountDetailModal" tabindex="-1" aria-labelledby="accountDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <!-- Header -->
                        <div class="modal-header">
                            <h5 class="modal-title" id="accountDetailModalLabel">
                                <i class="bi bi-person-badge me-2"></i>
                                Thông tin tài khoản (Chỉ xuất hiện lần đầu tiên)
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                        <!-- Form content -->
                        <div class="modal-body p-4">
                            <div class="row">
                                <!-- Phần bên trái: Thông tin tài khoản -->
                                <div class="col-md-6 border-end pe-4">
                                    <form id="account-detail-form">
                                        <!-- Row 1: Email and Full Name -->
                                        <div class="row mb-3">
                                            <!-- Email field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-email" class="form-label fw-medium">Email:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-envelope"></i>
                                                    </span>
                                                    <input type="email" id="account-email" class="form-control" 
                                                        value="${account.email || ''}"  disabled>
                                                </div>
                                            </div>
                                            
                                            <!-- fullName field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-fullName" class="form-label fw-medium">Họ tên:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-person"></i>
                                                    </span>
                                                    <input type="text" id="account-fullName" class="form-control" 
                                                        value="${account.fullName || ''}" >
                                                </div>
                                            </div>
                                        
                                            <!-- Phone field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-phone" class="form-label fw-medium">Số điện thoại:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-telephone"></i>
                                                    </span>
                                                    <input type="text" id="account-phone" class="form-control" 
                                                        value="${account.phone || ''}" >
                                                </div>
                                            </div>

=======
        
        <?php if ($user->isFirstLogin == 1): ?>
            // Chuyển đổi PHP object thành JavaScript object
            const account = <?php echo json_encode($user); ?>;
            
            const modalHTML = `
            <div class="modal fade" id="accountDetailModal" tabindex="-1" aria-labelledby="accountDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <!-- Header -->
                        <div class="modal-header">
                            <h5 class="modal-title" id="accountDetailModalLabel">
                                <i class="bi bi-person-badge me-2"></i>
                                Thông tin tài khoản
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                        <!-- Form content -->
                        <div class="modal-body p-4">
                            <div class="row">
                                <!-- Phần bên trái: Thông tin tài khoản -->
                                <div class="col-md-6 border-end pe-4">
                                    <form id="account-detail-form">
                                        <!-- Row 1: Email and Full Name -->
                                        <div class="row mb-3">
                                            <!-- Email field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-email" class="form-label fw-medium">Email:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-envelope"></i>
                                                    </span>
                                                    <input type="email" id="account-email" class="form-control" 
                                                        value="${account.email || ''}" disabled>
                                                </div>
                                            </div>
                                            
                                            <!-- fullName field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-fullName" class="form-label fw-medium">Họ tên:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-person"></i>
                                                    </span>
                                                    <input type="text" id="account-fullName" class="form-control" 
                                                        value="${account.fullName || ''}" disabled>
                                                </div>
                                            </div>
                                        
                                            <!-- Phone field -->
                                            <div class="col-md-12 mb-3">
                                                <label for="account-phone" class="form-label fw-medium">Số điện thoại:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-telephone"></i>
                                                    </span>
                                                    <input type="text" id="account-phone" class="form-control" 
                                                        value="${account.phone || ''}" disabled>
                                                </div>
                                            </div>

>>>>>>> temp-fix
                                            <!-- Position field -->
                                            <div class="col-md-12">
                                                <label for="account-position" class="form-label fw-medium">Chức vụ:</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-light">
                                                        <i class="bi bi-briefcase"></i>
                                                    </span>
<<<<<<< HEAD
                                                    <select id="account-position" class="form-select" >
=======
                                                    <select id="account-position" class="form-select" disabled>
>>>>>>> temp-fix
                                                        <!-- Options will be populated via JavaScript -->
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                    
                                </div>
                                
                                <!-- Phần bên phải: Đổi mật khẩu -->
                                <div class="col-md-6 ps-4">
                                    <form id="change-password-form">
                                       
                                        
                                        <!-- Mật khẩu mới -->
                                        <div class="mb-3">
                                            <label for="new-password" class="form-label fw-medium">Mật khẩu mới:</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light">
                                                    <i class="bi bi-lock"></i>
                                                </span>
                                                <input type="password" id="new-password" class="form-control" 
                                                    placeholder="Nhập mật khẩu mới">
                                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Xác nhận mật khẩu mới -->
                                        <div class="mb-3">
                                            <label for="confirm-password" class="form-label fw-medium">Xác nhận mật khẩu:</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light">
                                                    <i class="bi bi-lock-fill"></i>
                                                </span>
                                                <input type="password" id="confirm-password" class="form-control" 
                                                    placeholder="Nhập lại mật khẩu mới">
                                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                            <div class="invalid-feedback" id="confirm-password-error"></div>
                                        </div>
                                        
                                        <!-- Button đổi mật khẩu -->
                                        <!-- Buttons for personal info section -->
                                    <div class="d-flex justify-content-end mt-4 pt-3 border-top">
                                    
<<<<<<< HEAD
                                        <button type="button" class="btn btn-primary" id="submit-update-info">
=======
                                        <button type="button" class="btn btn-primary" id="detail-edit-information">
>>>>>>> temp-fix
                                            <i class="bi bi-pencil-square me-2"></i>Sửa thông tin
                                        </button>
                                    </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
            // Thêm modal vào body
            document.body.insertAdjacentHTML("beforeend", modalHTML);

            // Lấy position
            let positions = await callApi("/position");
            positions = positions.data;

            const positionSelect = document.querySelector("#account-position");
            positions.forEach((position) => {
                positionSelect.insertAdjacentHTML("beforeend", `
                    <option value="${position.PositionID}" ${account.position === position.PositionID ? "selected" : ""}>${position.PositionName}</option>
                `);
            });
            
            // Khởi tạo modal Bootstrap
            const modal = new bootstrap.Modal(document.getElementById('accountDetailModal'));
            modal.show();
<<<<<<< HEAD

            let update = false;
=======
>>>>>>> temp-fix
            
            // Xử lý đóng modal
            document.getElementById('accountDetailModal').addEventListener('hidden.bs.modal', function () {
                // Xóa modal khỏi DOM sau khi đóng
                this.remove();
<<<<<<< HEAD
                if(!update) {
                    window.location.href = "/";
                }
                
=======
                window.location.href = "/";
>>>>>>> temp-fix
            });
            
            // Xử lý chức năng hiện/ẩn mật khẩu
            document.querySelectorAll('.toggle-password').forEach(button => {
                button.addEventListener('click', function() {
                    const input = this.previousElementSibling;
                    const icon = this.querySelector('i');
                    
                    // Chuyển đổi kiểu input
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('bi-eye');
                        icon.classList.add('bi-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('bi-eye-slash');
                        icon.classList.add('bi-eye');
                    }
                });
            });

<<<<<<< HEAD
            document.querySelector("#submit-update-info").onclick = async (e) => {
                e.preventDefault();
                const password = document.querySelector("#new-password").value;
                const confirmPassword = document.querySelector("#confirm-password").value;
                const position = document.querySelector("#account-position").value;
                const fullName = document.querySelector("#account-fullName").value;
                const phone = document.querySelector("#account-phone").value;
                const email = document.querySelector("#account-email").value;
                if(fullName === "" || phone === "" || password === "" || confirmPassword === "" || position === "") {
                    showSwalToast("Vui lòng nhập đầy đủ thông tin", "warning");
                    return;
                }
                if(password !== confirmPassword) {
                     showSwalToast("Mật khẩu không khớp", "warning");
                    return;
                }
                if(!validatePhoneNumber(phone).valid) {
                    showSwalToast(validatePhoneNumber(phone).message, "warning");
                    return;
                }
                
                // console.log(user);
                account.fullName = fullName;
                account.phone = phone;
                account.position = position;
                account.password = password;
                account.isFirstLogin = 0;
                try {
                    const response = await callApi("/user/information", "POST", account);
                    console.log(response);
                    showSwalToast("Cập nhật thông tin thành công", "success");
                    update = true;
                  
                    // Xử lý đóng modal
                   modal.hide();
                  

                } catch (error) {
                    console.error("Error updating user:", error);
                    showSwalToast("Có lỗi xảy ra khi cập nhật thông tin", "error");
                    return;
                }

            }

=======
>>>>>>> temp-fix
           
            
                
        <?php endif; ?>

        
    </script>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>