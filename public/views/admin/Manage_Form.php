
<div class="container-xl my-4 container-account">
    <!-- Bộ lọc -->
    <section class="mt-4 bg-white p-3 shadow-sm rounded">
        <h5 class="mb-3">Bộ lọc</h5>
        <div class="row">
            <div class="col-md-2">
                <select class="form-select role-select">
                    <option value="all" selected>Loại hình khảo sát</option>
                </select>
            </div>

            <div class="col-md-2">
                <select class="form-select status-select">
                    <option value="all" selected>Ngành</option>

                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select status-select">
                    <option value="all" selected>Giai đoạn</option>

                </select>
            </div>


            <div class="col-md-3 d-flex justify-content-end gap-2">
                <button class="btn btn-secondary delete-filter-user">Xóa lọc</button>
                <button class="btn btn-primary filter-user">Lọc</button>
            </div>
        </div>
    </section>


    <!-- Quản lý tài khoản -->
    <section class="mt-4">
        <!-- Thanh công cụ chính -->
        <div class="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded">
            <h5 class="m-0">Quản lý tài khoản</h5>
            <div class="d-flex align-items-center gap-2">
                <input id="search-email" type="text" class="form-control" placeholder="Tìm kiếm tên khảo sát" style="max-width: 200px;">
                <button class="btn btn-primary btn-add-form">Tạo khảo sát</button>
            </div>
        </div>


        <!-- Bảng dữ liệu -->
        <div class="table-responsive mt-3">
            <table class="table table-hover table-bordered bg-white shadow-sm rounded">
                <thead class="table-dark text-center">
                <tr>
                    <th style="width: 5%;">Mã</th>
                    <th style="width: 20%;">Tên khảo sát</th>
                    <th style="width: 14%;">Loại hình khảo sát</th>
                    <th style="width: 10%;">Mã Ngành</th>
                    <th style="width: 8%;">Chu kỳ</th>
                    <th style="width: 15%;">Ghi chú</th>
                    <th style="width: 10%;">Người tạo</th>
                    <th style="width: 10%;">Trạng thái</th>
                    <th style="width: 10%;">Hành động</th>
                </tr>

                </thead>
                <tbody id="surveyTable" >
                <!-- Dữ liệu sẽ được thêm vào đây -->
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center" id="pagination">
                <!-- Các nút phân trang sẽ được render bằng JavaScript -->
            </ul>
        </nav>

    </section>
</div>

