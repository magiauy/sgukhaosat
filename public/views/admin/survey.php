<div class="container-fluid p-0">
                    <!-- Card chính chứa nội dung -->
                    <div class="card border rounded-4 overflow-hidden">
                        <div class="card-body p-0">
                            <!-- Search section -->
                            <div class="px-4 pt-4 pb-3">
                                <div class="row g-3 align-items-center">
                                    <div class="col-lg-7 col-md-6">
                                        <div class="form-floating">
                                            <input type="text" class="form-control rounded-3 border-light-subtle" id="search-form" placeholder="Tìm kiếm tên khảo sát">
                                            <label for="search-form">Tìm kiếm theo tên khảo sát</label>
                                        </div>
                                    </div>
                                    <div class="col-lg-5 col-md-6">
                                        <div class="d-flex gap-2 flex-wrap">
                                            <button class="btn btn-primary rounded-3 px-4 py-2 btn-search">
                                                <i class="bi bi-search me-2"></i> Tìm kiếm
                                            </button>
                                            <button class="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center btn-add-form">
                                                <i class="bi bi-plus-circle me-2"></i> Tạo khảo sát
                                            </button>
                                            <button id="delete-selected-surveys" class="btn btn-outline-danger rounded-pill px-3 py-2 d-none d-flex align-items-center">
                                                <i class="bi bi-trash me-2"></i> Xóa đã chọn
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Filter Section -->
                            <div class="p-4 mx-4 mb-4 border rounded-4 bg-light bg-opacity-25">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h5 class="mb-0 fw-bold text-primary">
                                        <i class="bi bi-funnel me-2"></i> Bộ lọc
                                    </h5>
                                    <div class="d-flex gap-3">
                                        <button class="btn btn-outline-secondary rounded-pill px-3 py-2 min-width-120 btn-reset">
                                            <i class="bi bi-x-circle me-1"></i> Xóa lọc
                                        </button>
                                        <button class="btn btn-primary rounded-pill px-3 py-2 min-width-120 btn-filter">
                                            <i class="bi bi-funnel me-1"></i> Áp dụng
                                        </button>
                                    </div>
                                </div>

                                <div class="row g-4">
                                    <div class="col-lg-4 col-md-6">
                                        <div class="form-group mb-3">
                                            <label class="form-label fw-medium mb-2">Loại hình khảo sát</label>
                                            <div class="form-floating">
                                                <select class="form-select form-type-select rounded-3 border-light-subtle" id="form-type-select">
                                                    <option value="all" selected>Tất cả loại hình khảo sát</option>
                                                </select>
                                                <label for="form-type-select">Loại hình khảo sát</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-lg-4 col-md-6">
                                        <div class="form-group mb-3">
                                            <label class="form-label fw-medium mb-2">Ngành</label>
                                            <div class="form-floating">
                                                <select class="form-select major-select rounded-3 border-light-subtle" id="major-select">
                                                    <option value="all" selected>Tất cả ngành</option>
                                                </select>
                                                <label for="major-select">Ngành</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-lg-4 col-md-12">
                                        <div class="form-group mb-3">
                                            <label class="form-label fw-medium mb-2">Chu kỳ</label>
                                            <div class="form-floating">
                                                <select class="form-select period-select rounded-3 border-light-subtle" id="period-select">
                                                    <option value="all" selected>Tất cả chu kỳ</option>
                                                </select>
                                                <label for="period-select">Chu kỳ</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Table section -->
                            <div class="px-4 mb-4 custom-form-table">
                                <div class="table-responsive rounded-4 border overflow-hidden">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light">
                                            <tr>
<!--                                                 <th class="ps-4" style="width: 40px;">-->
<!--                                                     <div class="form-check">-->
<!--                                                         <input type="checkbox" class="form-check-input" id="select-all-surveys">-->
<!--                                                     </div>-->
<!--                                                 </th>-->
                                                 <th class="ps-4" style="width: 50px;">#</th>
                                                 <th class="text-center" style="width: 5%;">Mã</th>
                                                 <th class="text-center" style="width: 20%;">Tên khảo sát</th>
                                                 <th class="text-center" style="width: 14%;">Loại hình khảo sát</th>
                                                 <th class="text-center" style="width: 10%;">Mã Ngành</th>
                                                 <th class="text-center" style="width: 8%;">Chu kỳ</th>
                                                 <th class="text-center" style="width: 15%;">Ghi chú</th>
                                                 <th class="text-center" style="width: 10%;">
                                                     <div class="d-flex align-items-center">
                                                         <i class="bi bi-person text-primary me-2"></i> Người tạo
                                                     </div>
                                                 </th>
                                                 <th class="text-center" style="width: 10%;">Trạng thái</th>
                                                 <th class="text-end pe-4" style="width: 10%;">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody id="surveyTable">
                                            <!-- Dữ liệu khảo sát sẽ được render ở đây -->
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
                        <div id="surveyToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                            <div class="d-flex">
                                <div class="toast-body" id="toastMessage"></div>
                                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
                            </div>
                        </div>
                    </div>
                </div>