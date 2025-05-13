<?php
include_once __DIR__ . '/../layouts/header.php';

?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h3 id="form-title">Survey Form</h3>
                    <div>
                        <span class="badge bg-primary" id="form-status"></span>
                    </div>
                </div>
                <div class="card-body">
                    <div id="form-description" class="mb-4"></div>
                    
                    <div id="survey-container">
                        <div class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p>Đang tải câu hỏi...</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-end">
                        <button type="button" class="btn btn-primary" id="btn-submit-survey">Submit Survey</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Success Modal -->
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
</div>

<script src="/public/js/survey_form.js" type="module"></script>

<?php
include_once __DIR__ . '/../layouts/footer.php';
?>