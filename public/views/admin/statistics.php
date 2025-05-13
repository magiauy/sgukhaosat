
<div class="container mt-4">
    <h1 class="mb-4">Thống kê khảo sát</h1>

    <!-- Số liệu tổng quan -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card border-primary">
                <div class="card-header bg-primary text-white">Tổng số khảo sát</div>
                <div class="card-body">
                    <h5 class="card-title" id="total-surveys">0</h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-success">
                <div class="card-header bg-success text-white">Tổng số phản hồi</div>
                <div class="card-body">
                    <h5 class="card-title" id="total-responses">0</h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-info">
                <div class="card-header bg-info text-white">Tỷ lệ hoàn thành</div>
                <div class="card-body">
                    <h5 class="card-title" id="completion-rate">0%</h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-warning">
                <div class="card-header bg-warning text-white">Đang thực hiện</div>
                <div class="card-body">
                    <h5 class="card-title" id="ongoing-surveys">0</h5>
                </div>
            </div>
        </div>
    </div>

    <!-- Biểu đồ -->
    <div class="row">
        <div class="col-md-6">
            <canvas id="responsesBySurveyChart"></canvas>
        </div>
        <div class="col-md-6">
            <canvas id="responsesByDateChart"></canvas>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/public/js/admin/statistics.js"></script>

<?php include __DIR__ . '/../layouts/footer.php'; ?>