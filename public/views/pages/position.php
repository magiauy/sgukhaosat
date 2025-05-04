<div class="container mt-4">
    <div class="card-stats">
        <div class="card">
            <h5>0</h5>
            <p>Quản lý chức vụ</p>
        </div>
    </div>

    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="positionToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
            </div>
        </div>
    </div>

    <div class="filter-section d-flex align-items-center gap-2">
        <div class="d-flex flex-grow-1">
            <input type="text" id="positionKeyword" class="form-control" placeholder="Tìm kiếm: Nhập mã hoặc tên chức vụ">
            <button class="btn btn-outline-primary ms-2 btn-search" id="positionSearchBtn">Lọc</button>
        </div>

        <div class="action-buttons ms-auto d-flex gap-2">
            <button class="btn btn-outline-danger btn-delete-position" id="positionDeleteBtn">
                <i class="bi bi-trash"></i> Xóa
            </button>
            <button class="btn btn-outline-primary btn-add-position" id="positionAddBtn">
                <i class="bi bi-plus"></i> Thêm chức vụ
            </button>
        </div>
    </div>


    <table class="table table-bordered">
        <thead>
            <tr>
                <th class="col-1"><input type="checkbox" id="selectAll"></th>
                <th class="col-2">Mã chức vụ</th>
                <th class="col-5">Chức vụ</th>
                <th class="col-2">Sửa</th>
                <th class="col-2">Xóa</th>
            </tr>
        </thead>
        <tbody id="positionTableBody">
        </tbody>
    </table>
    <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center" id="pagination">
        </ul>
    </nav>
</div>