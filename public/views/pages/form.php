<?php
use Core\AuthHelper;

$data = AuthHelper::verifyUserToken();
$user = $data['user'] ?? null;
include __DIR__ . '/../../views/layouts/header.php';
include __DIR__ . '/../../views/layouts/nav-bar.php';
?>
<body>
<!-- Loading overlay -->
<div class="form-content d-flex justify-content-center w-100" style="padding: 20px">
    <!-- Insert your form editor content here -->
</div>
<div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="successModalLabel">Thành công </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Khảo sát của bạn đã được gửi đi
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="btn-go-home">Go to Home</button>
                </div>
            </div>
        </div>
    </div>
<script src="/public/js/view-form.js"></script>
<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>