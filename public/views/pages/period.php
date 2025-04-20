<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div class="card-stats">
        <div class="card">
            <h5>0</h5>
            <p>Chu kỳ</p>
        </div>
    </div>
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="periodToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
            </div>
        </div>
    </div>
    <div class="filter-section">
        <div class="d-flex gap-3">
            <input type="number" class="form-control" id="startYearFilter" placeholder="Năm bắt đầu">
            <input type="number" class="form-control" id="endYearFilter" placeholder="Năm kết thúc">
        </div>
    </div>

    <div class="filter-section mt-3">
        <div class="action-buttons mt-2">
            <input type="number" class="form-control" id="periodKeyword" placeholder="Tìm kiếm theo năm bắt đầu hoặc kết thúc">
            <button class="btn btn-outline-primary" onclick="loadFilteredPeriods()">Lọc</button>
            <button class="btn btn-outline-secondary" onclick="resetFilteredPeriods()">Reset</button>
        </div>
        <div class="action-buttons mt-2">
            <button class="btn btn-outline-danger" onclick="deleteSelectedPeriods()"><i class="bi bi-trash"></i> Xóa</button>
            <button class="btn btn-outline-primary" onclick="loadPeriodAdd()"><i class="bi bi-plus"></i> Thêm chu kỳ</button>
        </div>
    </div>

    <div class="pagination-container d-flex align-items-center mt-3">
        <div class="d-flex align-items-center">
            <span class="me-2">Rows per page</span>
            <select id="itemsPerPageSelect" class="form-select form-select-sm w-auto" onchange="loadPeriods(1, document.getElementById('periodKeyword').value.trim())">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
        </div>

        <div class="d-flex align-items-center" style="margin-left: 10px;">
            <span id="tableInfoText" class="me-3"></span>

            <button class="btn btn-light btn-sm me-1" onclick="goToPeriodPage('first')">&laquo;</button>
            <button class="btn btn-light btn-sm me-1" onclick="goToPeriodPage('prev')">&lsaquo;</button>
            <button class="btn btn-light btn-sm me-1" onclick="goToPeriodPage('next')">&rsaquo;</button>
            <button class="btn btn-light btn-sm" onclick="goToPeriodPage('last')">&raquo;</button>
        </div>
    </div>


    <table class="table table-bordered">
        <thead>
            <tr>
                <th><input type="checkbox" id="selectAll"></th>
                <th>ID</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Sửa</th>
                <th>Xóa</th>
            </tr>
        </thead>
        <tbody id="periodTableBody">
        </tbody>
    </table>
    <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center" id="pagination">
        </ul>
    </nav>
</body>

</html>