import { callApi } from "../../apiService.js";
import { handleDeleteRole, handleDeleteSelectedRoles } from "./deleteRole.js";
import { showPopupAddRole } from "./addRole.js";
import { showEditRole } from "./editRole.js";
// import { showEditRoleUI } from "./editRole.js";

export async function renderContentRole(){
    document.querySelector("#content").innerHTML = `
        <div class="card shadow-sm border-0 content-role">
            <div class="card-body p-0" id="container-role">
                <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <button id="add-role-button" class="btn btn-primary">
                            <i class="bi bi-plus-circle"></i> Thêm vai trò
                        </button>
                        <button id="delete-selected-roles" class="btn btn-outline-danger btn-sm d-none">
                            <i class="bi bi-trash"></i> Xóa đã chọn
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
            </div>
        </div>
    `;

    await renderTableRole();
    showPopupAddRole(); // Khi ấn thêm vai trò
    handleDeleteSelectedRoles(); // Xóa vai trò đã chọn
}

//hàm render bảng vai trò
async function renderTableRole() {
    let response = await callApi('/role');
    let roles = response.data;
    const roleIDCurrent = document.querySelector("#sidebar-container").getAttribute("data-code");

    const tableBody = document.querySelector("#table-role tbody");
    tableBody.innerHTML = "";

    roles.forEach((role, index) => {
        if(role.roleID !== roleIDCurrent){
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
                            <span>null</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-clock-history text-muted me-2"></i>
                            <span>null</span>
                        </div>
                    </td>
                    <td class="text-end pe-4">
                        <div class="btn-group">
                            <button data-code=${role.roleID} class="btn btn-outline-primary btn-sm edit-role">
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

    logicCheckbox();
    handleDeleteRole(); // Xóa vai trò
    showEditRole(); // Sửa vai trò
}

//hàm render các vai trò trong database
async function logicCheckbox(){
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
}






