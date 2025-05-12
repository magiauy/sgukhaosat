<div class="container mt-4">
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
        <div class="d-flex gap-3 mt-2">
            <button class="btn btn-outline-primary" id="periodSearchBtn">Lọc</button>
        </div>
    </div>

    <div class="filter-section mt-3">
        <input type="text" class="form-control" id="periodKeyword" placeholder="Tìm kiếm theo năm bắt đầu hoặc kết thúc">
        <div class="action-buttons mt-2">
            <button class="btn btn-outline-danger" id="periodDeleteBtn">
                <i class="bi bi-trash"></i> Xóa
            </button>
            <button class="btn btn-outline-primary" id="periodAddBtn">
                <i class="bi bi-plus"></i> Thêm chu kỳ
            </button>
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
</div>