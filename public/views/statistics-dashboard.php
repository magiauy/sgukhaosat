<!DOCTYPE html>
<html lang="en">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thống kê nâng cao</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Import statistics dashboard as a module to support ES6 imports -->
    <script type="module" src="/public/js/admin/statistics.js"></script>
    <script src="/public/js/config.js"></script>
    <style>
        body {
            background-color: #f8f9fa;
        }
        .card {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            transition: transform 0.2s;
            border: none;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .stats-card {
            text-align: center;
            padding: 20px;
        }
        .stats-number {
            font-size: 32px;
            font-weight: bold;
            color: #3f6ad8;
        }
        .stats-title {
            color: #6c757d;
            text-transform: uppercase;
            font-size: 14px;
        }
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        .nav-tabs .nav-link {
            color: #6c757d;
            border: none;
            border-bottom: 3px solid transparent;
            padding: 0.75rem 1rem;
        }
        .nav-tabs .nav-link.active {
            color: #3f6ad8;
            border-bottom: 3px solid #3f6ad8;
            background-color: transparent;
        }
        .nav-tabs .nav-link:hover {
            border-color: transparent;
            border-bottom: 3px solid #d1d3e2;
        }
        .dashboard-header {
            background-color: #fff;
            padding: 1.5rem 0;
            box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
            margin-bottom: 1.5rem;
        }
        .btn-primary {
            background-color: #3f6ad8;
            border-color: #3f6ad8;
        }
        .btn-outline-primary {
            color: #3f6ad8;
            border-color: #3f6ad8;
        }
        .btn-outline-primary:hover {
            background-color: #3f6ad8;
            border-color: #3f6ad8;
        }
        .loading-spinner {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            border: 0.25rem solid rgba(0,0,0,0.1);
            border-right-color: #3f6ad8;
            border-radius: 50%;
            animation: spinner-border .75s linear infinite;
        }
    </style>
</head>
<body>
    <!-- Dashboard Header -->
    <div class="dashboard-header">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h2 class="mb-0">Thống kê nâng cao</h2>
                </div>
                <div class="col-md-6 text-md-end">
                    <a href="/admin" class="btn btn-outline-primary">
                        <i class="bi bi-arrow-left me-2"></i>Quay lại trang quản trị
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid">
        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs mb-4" id="dashboard-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link active" id="overview-tab" data-bs-toggle="tab" href="#overview" role="tab">
                    <i class="bi bi-grid me-2"></i>Tổng quan
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="form-details-tab" data-bs-toggle="tab" href="#form-details-tab-content" role="tab">
                    <i class="bi bi-clipboard-data me-2"></i>Chi tiết khảo sát
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="time-analysis-tab" data-bs-toggle="tab" href="#time-analysis" role="tab">
                    <i class="bi bi-clock-history me-2"></i>Phân tích thời gian
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="export-tab" data-bs-toggle="tab" href="#export" role="tab">
                    <i class="bi bi-download me-2"></i>Xuất báo cáo
                </a>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="dashboardTabContent">
            <!-- Overview Tab -->
            <div class="tab-pane fade show active" id="overview" role="tabpanel">
                <!-- Stats Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-sm-6 col-xl-3">
                        <div class="card stats-card">
                            <div class="stats-number" id="total-surveys">...</div>
                            <div class="stats-title">Tổng số khảo sát</div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card stats-card">
                            <div class="stats-number" id="total-responses">...</div>
                            <div class="stats-title">Tổng số phản hồi</div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card stats-card">
                            <div class="stats-number" id="ongoing-surveys">...</div>
                            <div class="stats-title">Khảo sát đang diễn ra</div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card stats-card">
                            <div class="stats-number" id="completion-rate">...</div>
                            <div class="stats-title">Tỷ lệ hoàn thành</div>
                        </div>
                    </div>
                </div>

                <!-- Additional Metrics (will be populated by JS) -->
                <div class="row g-4 mb-4 d-none" id="additional-metrics"></div>

                <div class="row g-4">
                    <!-- Responses Over Time Chart -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Xu hướng phản hồi theo thời gian</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="responseChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Top Forms by Response -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Khảo sát hàng đầu theo phản hồi</h5>
                            </div>
                            <div class="card-body">
                                <div id="top-forms-list">
                                    <div class="text-center py-3">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Details Tab -->
            <div class="tab-pane fade" id="form-details-tab-content" role="tabpanel">
                <div class="row mb-4">
                    <!-- Form Selector -->
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <label for="form-select" class="form-label">Chọn biểu mẫu khảo sát:</label>
                                        <select id="form-select" class="form-select" disabled>
                                            <option value="">Đang tải biểu mẫu...</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-outline-primary" disabled id="export-csv-btn">
                                                <i class="bi bi-file-earmark-excel me-2"></i>Xuất CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Details Container (hidden until a form is selected) -->
                <div id="form-details-container" class="d-none">
                    <div class="row g-4">
                        <!-- Form Information -->
                        <div class="col-md-4">
                            <!-- Loading indicator -->
                            <div id="form-loading" class="card">
                                <div class="card-body text-center py-5">
                                    <div class="loading-spinner"></div>
                                    <p class="mt-3 mb-0">Đang tải thông tin khảo sát...</p>
                                </div>
                            </div>
                            
                            <!-- Form details will be populated by JavaScript -->
                            <div id="form-details" class="d-none"></div>
                        </div>
                        
                        <!-- Form Response Trend -->
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header bg-white">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="card-title mb-0">Xu hướng phản hồi</h5>
                                        <div class="btn-group">
                                            <select id="trend-timeframe" class="form-select form-select-sm me-2" disabled>
                                                <option value="hourly">Theo giờ</option>
                                                <option value="daily" selected>Theo ngày</option>
                                                <option value="weekly">Theo tuần</option>
                                                <option value="monthly">Theo tháng</option>
                                            </select>
                                            <select id="trend-period" class="form-select form-select-sm" disabled>
                                                <option value="7">7 ngày</option>
                                                <option value="30" selected>30 ngày</option>
                                                <option value="90">90 ngày</option>
                                                <option value="180">180 ngày</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="chart-container">
                                        <canvas id="formResponseChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Question Statistics -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header bg-white">
                                    <h5 class="card-title mb-0">Thống kê câu hỏi</h5>
                                </div>
                                <div class="card-body">
                                    <div id="question-stats">
                                        <p class="text-center py-3 text-muted">Chọn một biểu mẫu để xem thống kê câu hỏi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Time Analysis Tab -->
            <div class="tab-pane fade" id="time-analysis" role="tabpanel">
                <div class="row g-4">
                    <!-- Time of Day Chart -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Phân bố phản hồi theo giờ trong ngày</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="timeOfDayChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Time Statistics -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Phân tích thời gian</h5>
                            </div>
                            <div class="card-body">
                                <div id="time-stats-details">
                                    <div class="text-center py-3">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-muted">Đang tải dữ liệu phân tích thời gian...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Day of Week Analysis (to be implemented in future versions) -->
                <div class="row g-4 mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Phân tích thời gian phản hồi</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-0">Phân tích chi tiết về thời gian phản hồi và các xu hướng sẽ được triển khai trong các phiên bản tiếp theo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Export Tab -->
            <div class="tab-pane fade" id="export" role="tabpanel">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Xuất báo cáo</h5>
                            </div>
                            <div class="card-body">
                                <form id="export-form" class="needs-validation" novalidate>
                                    <div class="mb-3">
                                        <label for="export-form-select" class="form-label">Chọn biểu mẫu:</label>
                                        <select id="export-form-select" class="form-select" required>
                                            <option value="">Đang tải biểu mẫu...</option>
                                        </select>
                                        <div class="invalid-feedback">
                                            Vui lòng chọn một biểu mẫu
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="export-format" class="form-label">Định dạng:</label>
                                        <select id="export-format" class="form-select" required>
                                            <option value="csv" selected>CSV</option>
                                            <option value="xlsx" disabled>Excel (sắp ra mắt)</option>
                                            <option value="pdf" disabled>PDF (sắp ra mắt)</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="export-date-range" class="form-label">Phạm vi ngày:</label>
                                        <select id="export-date-range" class="form-select">
                                            <option value="all" selected>Tất cả thời gian</option>
                                            <option value="30days">30 ngày qua</option>
                                            <option value="90days">90 ngày qua</option>
                                            <option value="custom">Tùy chỉnh</option>
                                        </select>
                                    </div>
                                    
                                    <div class="row mb-3 d-none" id="custom-date-range">
                                        <div class="col-md-6">
                                            <label for="export-start-date" class="form-label">Ngày bắt đầu:</label>
                                            <input type="date" id="export-start-date" class="form-control">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="export-end-date" class="form-label">Ngày kết thúc:</label>
                                            <input type="date" id="export-end-date" class="form-control">
                                        </div>
                                    </div>
                                    
                                    <div class="d-grid gap-2">
                                        <button type="submit" class="btn btn-primary" id="generate-report-btn">
                                            <i class="bi bi-download me-2"></i>Xuất báo cáo
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Báo cáo gần đây</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">Danh sách các báo cáo được tạo gần đây sẽ xuất hiện ở đây. Tính năng này sẽ được triển khai trong phiên bản tiếp theo.</p>
                                
                                <div class="list-group mt-3">
                                    <div class="list-group-item disabled">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Không có báo cáo nào</h6>
                                            <small>-</small>
                                        </div>
                                        <p class="mb-1">Tạo báo cáo đầu tiên của bạn bằng cách sử dụng mẫu bên trái.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
      <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>    <script>
        // Setup dashboard features
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize tooltips
            const dateRangeSelect = document.getElementById('export-date-range');
            const customDateRange = document.getElementById('custom-date-range');
            
            if (dateRangeSelect) {
                dateRangeSelect.addEventListener('change', function() {
                    if (this.value === 'custom') {
                        customDateRange.classList.remove('d-none');
                    } else {
                        customDateRange.classList.add('d-none');
                    }
                });
            }
            
            // Setup export form submission
            const exportForm = document.getElementById('export-form');
            if (exportForm) {
                exportForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const formId = document.getElementById('export-form-select').value;
                    
                    if (!formId) {
                        alert('Vui lòng chọn một biểu mẫu');
                        return;
                    }
                    
                    const format = document.getElementById('export-format').value;
                    const dateRange = document.getElementById('export-date-range').value;
                    
                    let url = `/api/v2/statistics/export/${format}?formId=${formId}`;
                    
                    if (dateRange !== 'all') {
                        if (dateRange === 'custom') {
                            const startDate = document.getElementById('export-start-date').value;
                            const endDate = document.getElementById('export-end-date').value;
                            
                            if (!startDate || !endDate) {
                                alert('Vui lòng chọn ngày bắt đầu và kết thúc');
                                return;
                            }
                            
                            url += `&startDate=${startDate}&endDate=${endDate}`;
                        } else {
                            url += `&dateRange=${dateRange}`;
                        }
                    }
                    
                    window.location.href = url;
                });
            }
            
            // Sync form selectors between tabs
            const mainFormSelect = document.getElementById('form-select');
            const exportFormSelect = document.getElementById('export-form-select');
            
            if (mainFormSelect && exportFormSelect) {
                // Create a MutationObserver to watch for changes to the options in mainFormSelect
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (mutation.type === 'childList') {
                            // Clone options from main form select to export form select
                            exportFormSelect.innerHTML = mainFormSelect.innerHTML;
                        }
                    });
                });
                
                // Start observing the target node for configured mutations
                observer.observe(mainFormSelect, { childList: true });
            }
        });
    </script>
</body>
<?php
include __DIR__ . '/../layouts/footer.php';
?>
</html>