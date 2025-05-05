import { callApi } from "../../apiService.js";
import { handleDeleteRole, handleDeleteSelectedRoles } from "./deleteRole.js";
import { showAddRoleUI } from "./addRole.js";
import { showEditRoleUI } from "./editRole.js";

export async function renderContentRole(){
    document.querySelector("#content").innerHTML = `
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-body text-center py-4">
                <h3 class="mb-0 fw-bold">Quản lí phân quyền</h3>
            </div>
        </div>

        <div class="card shadow-sm border-0 content-role">
            <div class="card-body p-0" id="container-role">
                <!-- Nội dung vai trò sẽ được render ở đây -->
            </div>
        </div>
    `;

    showContentRole();
}

//hàm render các vai trò trong database
async function showContentRole(){
    let response = await callApi('/role');
    let roles = response.data;
    const roleIDCurrent = parseInt(document.querySelector("#sidebar-container").getAttribute("data-code"));
    
    document.querySelector('#container-role').innerHTML = `
        <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
            <h5 class="mb-0 fw-bold text-primary">Quản lý vai trò</h5>
            <div class="d-flex align-items-center gap-2">
                <button id="delete-selected-roles" class="btn btn-outline-danger btn-sm d-none">
                    <i class="bi bi-trash"></i> Xóa đã chọn
                </button>
                <button id="add-role-button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addRoleModal">
                    <i class="bi bi-plus-circle"></i> Thêm vai trò
                </button>
            </div>
        </div>
        
        <div class="table-responsive">
            <table id="table-role" class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4" style="width: 40px;">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="select-all-roles">
                            </div>
                        </th>
                        <th style="width: 50px;">#</th>
                        <th>Tên vai trò</th>
                        <th>Thời gian tạo</th>
                        <th>Thời gian cập nhật</th>
                        <th class="text-end pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Dữ liệu vai trò sẽ được render ở đây -->
                </tbody>
            </table>
        </div>
        
        <div class="p-3 border-top d-flex justify-content-between align-items-center">
            <div>
                <span class="text-muted fs-sm"><span id="selected-count">0</span> mục được chọn</span>
            </div>
            <div>
                <nav aria-label="Page navigation example">
                    <ul class="pagination pagination-sm mb-0">
                     
                    </ul>
                </nav>
            </div>
        </div>
    `;


    const tableBody = document.querySelector("#table-role tbody");
    tableBody.innerHTML = "";

    roles.forEach((role, index) => {
        if(index+1 !== roleIDCurrent){
            const createdDate = new Date('2024-01-01').toLocaleDateString('vi-VN');
            const updatedDate = new Date('2024-03-01').toLocaleDateString('vi-VN');
            
            tableBody.innerHTML += `
                <tr>
                    <td class="ps-4">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input role-checkbox" data-id="${role.roleID}">
                        </div>
                    </td>
                    <td>${index+1}</td>
                    <td>
                        <div class="fw-medium">${role.roleName}</div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-calendar-date text-muted me-2"></i>
                            <span>${createdDate}</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-clock-history text-muted me-2"></i>
                            <span>${updatedDate}</span>
                        </div>
                    </td>
                    <td class="text-end pe-4">
                        <div class="btn-group">
                            <button data-code=${role.roleID} class="btn btn-outline-primary btn-sm edit-role" data-bs-toggle="modal" data-bs-target="#editRoleModal">
                                <i class="bi bi-pencil"></i> Sửa
                            </button>
                            <button data-code=${role.roleID} class="btn btn-outline-danger btn-sm delete-role">
                                <i class="bi bi-trash"></i> Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    // Xử lý checkbox và đếm số mục đã chọn
    const selectAllCheckbox = document.getElementById('select-all-roles');
    const roleCheckboxes = document.querySelectorAll('.role-checkbox');
    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('delete-selected-roles');

    // Cập nhật số lượng mục đã chọn và hiển thị nút xóa hàng loạt
    function updateSelectedCount() {
        const checkedBoxes = document.querySelectorAll('.role-checkbox:checked');
        selectedCountElem.textContent = checkedBoxes.length;
        
        // Hiển thị hoặc ẩn nút xóa hàng loạt
        if (checkedBoxes.length > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }
        
        // Cập nhật trạng thái của checkbox "chọn tất cả"
        if (checkedBoxes.length === roleCheckboxes.length && roleCheckboxes.length > 0) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // Xử lý sự kiện khi click vào checkbox "chọn tất cả"
    selectAllCheckbox.addEventListener('change', function() {
        roleCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateSelectedCount();
    });

    // Xử lý sự kiện khi click vào các checkbox riêng lẻ
    roleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    // Khởi tạo trạng thái ban đầu
    updateSelectedCount();

    // Các hàm xử lý khác
    showAddRoleUI(); // Khi ấn thêm vai trò
    handleDeleteRole(); // Xóa vai trò
    showEditRoleUI(); // Sửa vai trò
    handleDeleteSelectedRoles(); // Xóa vai trò đã chọn
}




