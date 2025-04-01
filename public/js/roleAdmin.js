export function renderContentRole(){
    document.querySelector("#content").innerHTML = `
         <section class="mt-4">
            <!-- Thanh công cụ chính -->
            <div class="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded">
                <h5 class="m-0">Quản lý phân quyền</h5>
            </div>

            <!-- Bảng dữ liệu -->
            <div class="table-responsive mt-3">
                <table class="table table-hover table-bordered bg-white shadow-sm rounded">
                    <thead class="table-dark text-center">
                        <tr>
                            <th><input type="checkbox" class="choose-all-user"/></th>
                            <th>Email</th>
                            <th>Họ tên</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo</th>
                            <th>Tình trạng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <!-- Dữ liệu sẽ được thêm vào đây -->
                    </tbody>
                </table>
            </div>
        </section>
    `
}