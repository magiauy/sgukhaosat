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
            <p>Ngành</p>
        </div>
    </div>

    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="majorToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
            </div>
        </div>
    </div>

    <div class="filter-section d-flex align-items-center gap-2">
        <div class="d-flex flex-grow-1">
            <input type="text" id="majorKeyword" class="form-control" placeholder="Tìm kiếm: Nhập mã hoặc tên ngành">
            <button class="btn btn-outline-primary ms-2" onclick="loadFilteredMajors()">Lọc</button>
            <button class="btn btn-outline-secondary" style="margin-left: 10px;" onclick="resetFilteredMajors()">Reset</button>
        </div>

        <div class="action-buttons ms-auto d-flex gap-2">
            <button class="btn btn-outline-danger" onclick="deleteSelectedMajors()">
                <i class="bi bi-trash"></i> Xóa
            </button>
            <button class="btn btn-outline-primary" onclick="loadMajorAdd()">
                <i class="bi bi-plus"></i> Thêm ngành
            </button>
        </div>
    </div>

    <div class="pagination-container d-flex align-items-center mt-3">
        <div class="d-flex align-items-center">
            <span class="me-2">Rows per page</span>
            <select id="itemsPerMajorPageSelect" class="form-select form-select-sm w-auto" onchange="loadMajors(1, document.getElementById('majorKeyword').value.trim())">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
        </div>

        <div class="d-flex align-items-center ms-4">
            <span id="tableInfoText" class="me-3"></span>

            <button class="btn btn-light btn-sm me-1" onclick="goToMajorPage('first')">&laquo;</button>
            <button class="btn btn-light btn-sm me-1" onclick="goToMajorPage('prev')">&lsaquo;</button>
            <button class="btn btn-light btn-sm me-1" onclick="goToMajorPage('next')">&rsaquo;</button>
            <button class="btn btn-light btn-sm" onclick="goToMajorPage('last')">&raquo;</button>
        </div>
    </div>

    <table class="table table-bordered">
        <thead>
            <tr>
                <th><input type="checkbox" id="selectAll"></th>
                <th>Mã Ngành</th>
                <th>Ngành</th>
                <th>Sửa</th>
                <th>Xóa</th>
            </tr>
        </thead>
        <tbody id="majorTableBody">
        </tbody>
    </table>
    <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center" id="pagination">
        </ul>
    </nav>
</body>

</html>