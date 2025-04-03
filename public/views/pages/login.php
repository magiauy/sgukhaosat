<?php
include __DIR__ . '/../../views/layouts/header.php';
?>


<div class="d-flex justify-content-center align-items-center bg-light main-content">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card shadow-lg p-4">
                    <h3 class="text-center mb-4">Đăng Nhập</h3>
                    <form id="login-form">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Mật khẩu</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Đăng Nhập</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="/public/js/login.js" type="module"></script>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>