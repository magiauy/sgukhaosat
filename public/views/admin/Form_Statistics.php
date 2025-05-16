<?php
use Core\AuthHelper;
use Services\FormService;

require_once __DIR__ . '/../../../app/Services/FormService.php';


error_log("Form editor page loaded");
$data = AuthHelper::verifyUserToken();

$user = $data['user'] ?? null;
$permissions = $data['permissions'] ?? [];

// Kiểm tra quyền
function hasPermission(array $permissions, string $permID): bool {
    foreach ($permissions as $perm) {
        if ($perm->permID === $permID) {
            return true;
        }
    }
    return false;
}

// Không có quyền truy cập -> cấm
if (!$user || !hasPermission($permissions, 'EDIT_FORM')) {
    http_response_code(403);
    header('Location: /');
    exit();
}

// Kiểm tra quyền sở hữu form (nếu có formId)
$uri = $_SERVER['REQUEST_URI'];
preg_match('#^/admin/form/(\d+)/edit$#', $uri, $matches);
$formId = $matches[1] ?? null;
if ($formId) {
    $formService = new FormService(); // hoặc inject qua container nếu có
    try {
        // Kiểm tra xem form có tồn tại kh
        if(!$formService->checkFormExists($formId, $user->email)) {
            http_response_code(404);
            header('Location: /');
            exit();
        }
        // Kiểm tra quyền truy cập form



        if (!$formService->checkPermission($formId, $user->email)) {
            http_response_code(403);
            header('Location: /');
            exit();
        }
    } catch (Exception $e) {
        http_response_code(403);
        header('Location: /');
        exit();
    }
}

// Phân loại trạng thái form từ URI
$uri = $_SERVER['REQUEST_URI'];
$formStatus = 'draft';

if (preg_match('#/admin/form/\d+/edit#', $uri) && str_contains($uri, 'status=draft')) {
    $formStatus = 'draft';
} elseif (preg_match('#/admin/form/\d+/edit#', $uri)) {
    $formStatus = 'edit';
}

// Load header (và tiếp tục trang)
include __DIR__ . '/../../views/layouts/header.php';
include __DIR__ . '/../../views/layouts/nav-bar.php';
?>

<body>
    <div class="container mt-4" style="max-width: 900px">
        <h2 class="mb-4">Thống kê khảo sát</h2>

        <!-- Tab Navigation -->
        <ul class="nav nav-tabs mb-4" id="statisticsTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary"
                    type="button" role="tab" aria-controls="summary" aria-selected="true">
                    Tóm tắt thống kê
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="individual-tab" data-bs-toggle="tab" data-bs-target="#individual"
                    type="button" role="tab" aria-controls="individual" aria-selected="false">
                    Câu trả lời cá nhân
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="statisticsTabsContent">
            <!-- Summary Tab -->
            <div class="tab-pane fade show active" id="summary" role="tabpanel" aria-labelledby="summary-tab">
                   <div class="row mb-4">
                       <div class="col-md-4">
                           <div class="card">
                               <div class="card-body">
                                   <h5 class="card-title">Tổng số lượt trả lời</h5>
                                   <h2 class="card-text text-primary" id="total-responses">0</h2>
                               </div>
                           </div>
                       </div>
                       <div class="col-md-8">
                           <div class="card">
                               <div class="card-body">
                                   <h5 class="card-title">Xuất dữ liệu</h5>
                                   <div class="d-flex flex-wrap gap-2">
                                       <button class="btn btn-outline-primary" id="export-pdf">
                                           <i class="fas fa-file-pdf"></i> Xuất PDF
                                       </button>
                                       <button class="btn btn-outline-success" id="export-excel">
                                           <i class="fas fa-file-excel"></i> Xuất Excel
                                       </button>
                                       <button class="btn btn-outline-secondary" id="export-report">
                                           <i class="fas fa-chart-bar"></i> Xuất báo cáo
                                       </button>
                                       <button class="btn btn-outline-info" id="export-csv">
                                           <i class="fas fa-file-csv"></i> Xuất CSV
                                       </button>
                                   </div>
                               </div>
                           </div>
                       </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Thống kê các câu hỏi</h5>
                                <div id="question-stats-container">
                                    <!-- Dữ liệu thống kê từng câu hỏi sẽ được tải động -->
                                    <div class="text-center my-5">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Individual Responses Tab -->
            <div class="tab-pane fade" id="individual" role="tabpanel" aria-labelledby="individual-tab">
                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Xem câu trả lời của người dùng</h5>
                                <select class="form-select" id="user-response-select">
                                    <option selected disabled>Chọn người dùng...</option>
                                    <!-- Options will be loaded dynamically -->
                                </select>

                                <div id="individual-response-container" class="mt-4">
                                    <!-- Individual response data will be loaded here -->
                                    <p class="text-muted">Vui lòng chọn người dùng để xem câu trả lời</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Thao tác</h5>
                                <button class="btn btn-danger" id="delete-response" disabled>
                                    <i class="fas fa-trash"></i> Xóa câu trả lời đã chọn
                                </button>

                                <div class="mt-4">
                                    <button class="btn btn-primary" id="export-all">
                                        <i class="fas fa-file-export"></i> Xuất tất cả dữ liệu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/public/js/form/statistics.js" type="module"></script>
</body>

<?php
include __DIR__ . '/../../views/layouts/footer.php';
?>