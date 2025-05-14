<div class="container-fluid p-0">
        <!-- Card chính chứa nội dung -->
        <div class="card border rounded-4 overflow-hidden">
            <div class="card-body p-0">
                <!-- Search section -->
                <div class="px-4 pt-4 pb-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-lg-7 col-md-6">
                            <div class="form-floating">
                                <input type="text" class="form-control rounded-3 border-light-subtle" id="documentKeyword" placeholder="Nhập tên tài liệu cần tìm">
                                <label for="documentKeyword">Tìm kiếm theo tên tài liệu</label>
                            </div>
                        </div>
                        <div class="col-lg-5 col-md-6">
                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-primary rounded-3 px-4 py-2" id="documentSearchBtn">
                                    <i class="bi bi-search me-2"></i> Tìm kiếm
                                </button>
                                <button id="documentAddBtn" class="btn btn-secondary rounded-pill px-4 py-2 d-flex align-items-center">
                                    <i class="bi bi-plus-circle me-2"></i> Thêm tài liệu
                                </button>
                                <button id="documentDeleteBtn" class="btn btn-outline-danger rounded-pill px-3 py-2 d-none d-flex align-items-center">
                                    <i class="bi bi-trash me-2"></i> Xóa đã chọn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table section -->
                <div class="px-4 mb-4 custom-table">
                    <div class="table-responsive rounded-4 border overflow-hidden">
                        <table id="table-document" class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4" style="width: 40px;">
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="selectAll">
                                        </div>
                                    </th>
                                    <th style="width: 50px;">#</th>
                                    <th>Mã tài liệu</th>
                                    <th>Tên tài liệu</th>
                                    <th>Loại tài liệu</th>
                                    <th>Ngày tạo</th>
                                    <th class="text-end pe-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="documentTableBody">
                                <!-- Dữ liệu tài liệu sẽ được render ở đây -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination section -->
                <div class="px-4 py-3 border-top d-flex justify-content-between align-items-center bg-light bg-opacity-10">
                    <div>
                        <span class="text-muted"><span id="selected-count">0</span> mục được chọn</span>
                    </div>
                    <div>
                        <nav aria-label="Page navigation" id="pagination" class="pagination-container">
                            <!-- Phân trang sẽ được render ở đây -->
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast notification -->
        <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
            <div id="documentToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body" id="toastMessage"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
                </div>
            </div>
        </div>
    </div>


    
    <!-- CREATE TABLE document (
    DocumentID INT AUTO_INCREMENT PRIMARY KEY,
    DocumentTitle VARCHAR(255),
    type ENUM('quy_trinh_cap_nhat_chuan_dau_ra', 'danh_sach_quy_trinh_cac_chu_ky') NOT NULL,
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isDelete BOOLEAN DEFAULT FALSE
); -->

 <!-- CREATE TABLE file (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_Doc INT,
    id_major INT,
    path_folder_url VARCHAR(500),
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isDelete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_Doc) REFERENCES document(id)
);-->

