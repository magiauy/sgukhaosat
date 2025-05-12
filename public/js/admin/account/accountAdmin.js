import { callApi } from "../../apiService.js";
import { showAddAccount, importUsers } from "./addAccount.js";
import { deleteAccountSelected} from "./deleteAccountSelected.js";
import { showDetail } from "./detailAccount.js";
import { filterAccount } from "./filterAccount.js";
import { searchAccount } from "./searchAccount.js";
import PaginationComponent from "../../component/pagination.js";

export let selectedAccountIDs = new Set();

export function clearSelectedAccounts() {
    selectedAccountIDs.clear();
    const selectedCountElem = document.getElementById('selected-count');
    if (selectedCountElem) {
        selectedCountElem.textContent = "0";
    }
    
    const deleteSelectedBtn = document.getElementById('delete-selected-accounts');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.classList.add('d-none');
    }
    
    const selectAllCheckbox = document.getElementById('select-all-accounts');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

const pagination = new PaginationComponent({
    containerId: 'pagination-account',
    onPageChange: (offset, limit) => {
        renderTableAccountOnPagination(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        renderTableAccountOnPagination(offset, limit);
    },

});

//hàm render ra nội dung submenu tài khoản
export async function  renderContentUser(){
    document.querySelector("#content").innerHTML = `
    <div class="container-fluid p-0">
        <!-- Card chính chứa nội dung -->
        <div class="card border rounded-4 overflow-hidden">
            <div class="card-body p-0">
                <!-- Search section - Cải thiện spacing -->
                <div class="px-4 pt-4 pb-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-lg-5 col-md-4">
                            <div class="form-floating">
                                <input type="text" class="form-control rounded-3 border-light-subtle" id="id-search" placeholder="Nhập email cần tìm">
                                <label for="id-search-account">Tìm kiếm email</label>
                            </div>
                        </div>
                        <div class="col-lg-7 col-md-8">
                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-primary rounded-3 px-3 py-2" id="search-button">
                                    <i class="bi bi-search me-1"></i> Tìm kiếm
                                </button>
                                <button id="add-account-button" class="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center">
                                    <i class="bi bi-plus-circle me-1"></i> Thêm tài khoản
                                </button>
                                <div class="position-relative">
                                    <button id="import-accounts-button" class="btn btn-success rounded-pill px-3 py-2 d-flex align-items-center">
                                        <i class="bi bi-file-earmark-excel me-1"></i> Nhập file tài khoản
                                    </button>
                                    
                                </div>
                                <button id="delete-selected-accounts" class="btn btn-outline-danger rounded-pill px-3 py-2 d-none d-flex align-items-center">
                                    <i class="bi bi-trash me-1"></i> Xóa đã chọn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

               <!-- Filter Section - Loại bỏ shadow, cải thiện border -->
                <div class="p-4 mx-4 mb-4 border rounded-4 bg-light bg-opacity-25">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-funnel me-2"></i> Bộ lọc
                        </h5>
                        <div class="d-flex gap-3">
                            <button id="delete-filter-account" class="btn btn-outline-secondary rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-x-circle me-1"></i> Xóa lọc
                            </button>
                            <button id="filter-account" class="btn btn-primary rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-funnel me-1"></i> Áp dụng
                            </button>
                        </div>
                    </div>
                    
                    <div class="row g-4">
                        <!-- Hàng 1: 3 Select (vai trò, tình trạng, sắp xếp) -->
                        <div class="col-lg-4 col-md-4">
                            <div class="form-group mb-3">
                                <label class="form-label fw-medium mb-2">Vai trò</label>
                                <div class="form-floating">
                                    <select class="form-select rounded-3 border-light-subtle" id="role-select">
                                        <option value="all" selected>Tất cả</option>
                                        <!-- Các vai trò sẽ được thêm bằng JavaScript -->
                                    </select>
                                    <label for="role-select">Chọn vai trò</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-4 col-md-4">
                            <div class="form-group mb-3">
                                <label class="form-label fw-medium mb-2">Tình trạng</label>
                                <div class="form-floating">
                                    <select class="form-select rounded-3 border-light-subtle" id="status-select">
                                        <option value="all" selected>Tất cả</option>
                                        <option value="1">Đang hoạt động</option>
                                        <option value="0">Đã khóa</option>
                                    </select>
                                    <label for="status-select">Chọn tình trạng</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-4 col-md-4">
                            <div class="form-group mb-3">
                                <label class="form-label fw-medium mb-2">Sắp xếp theo</label>
                                <div class="form-floating">
                                    <select class="form-select rounded-3 border-light-subtle" id="sort-option">
                                        <option value="created_desc" selected>Thời gian tạo mới nhất</option>
                                        <option value="created_asc">Thời gian tạo cũ nhất</option>
                                        <option value="updated_desc">Thời gian cập nhật mới nhất</option>
                                        <option value="updated_asc">Thời gian cập nhật cũ nhất</option>
                                    </select>
                                    <label for="sort-option">Sắp xếp theo</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hàng 2: Thời gian tạo và thời gian cập nhật -->
                        <div class="col-lg-6 col-md-6">
                            <div class="form-group mb-3">
                                <label class="form-label fw-medium mb-2">Thời gian tạo</label>
                                <div class="d-flex gap-2">
                                    <div class="form-floating flex-grow-1">
                                        <input type="date" class="form-control date-create rounded-3 border-light-subtle" id="create-from-date">
                                        <label for="create-from-date">Từ</label>
                                    </div>
                                    <div class="form-floating flex-grow-1">
                                        <input type="date" class="form-control date-create rounded-3 border-light-subtle" id="create-to-date">
                                        <label for="create-to-date">Đến</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-6 col-md-6">
                            <div class="form-group mb-3">
                                <label class="form-label fw-medium mb-2">Thời gian cập nhật</label>
                                <div class="d-flex gap-2">
                                    <div class="form-floating flex-grow-1">
                                        <input type="date" class="form-control date-update rounded-3 border-light-subtle" id="update-from-date">
                                        <label for="update-from-date">Từ</label>
                                    </div>
                                    <div class="form-floating flex-grow-1">
                                        <input type="date" class="form-control date-update rounded-3 border-light-subtle" id="update-to-date">
                                        <label for="update-to-date">Đến</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>               
                    
                <!-- Table section - Loại bỏ shadow -->
                <div class="px-4 mb-4">
                    <div class="table-responsive rounded-4 border overflow-hidden">
                        <table id="table-account" class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4" style="width: 40px;">
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="select-all-accounts">
                                        </div>
                                    </th>
                                    <th style="width: 50px;">#</th>   
                                    <th>Tài khoản</th>
                                    <th>Vai trò</th>
                                    <th>Tình trạng</th>
                                    <th>
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-calendar-date text-primary me-2"></i> Thời gian tạo
                                        </div>
                                    </th>
                                    <th>
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-clock-history text-primary me-2"></i> Thời gian cập nhật
                                        </div>
                                    </th>
                                    <th class="text-end pe-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Dữ liệu vai trò sẽ được render ở đây -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Pagination section - Cải thiện styling -->
                <div class="px-4 py-3 border-top d-flex justify-content-between align-items-center bg-light bg-opacity-10">
                    <div>
                        <span class="text-muted"><span id="selected-count">0</span> mục được chọn</span>
                    </div>
                    <div>
                        <nav aria-label="Page navigation" id="pagination-account" class="pagination-container">
                            <!-- Phân trang sẽ được render ở đây -->
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // render option vai trò
    try {
        const response = await callApi("/role");    
        const roles = response.data;
        const roleSelect = document.getElementById("role-select");
        
        if (roleSelect && roles.length > 0) {
            roles.forEach((role) => {
                const option = document.createElement("option");
                option.value = role.roleID;
                option.textContent = role.roleName;
                roleSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error loading role data:", error);
    }

    await renderTableAccountOnPagination(0, 10);
   
    showAddAccount();
    deleteAccountSelected();
    importUsers();
    filterAccount();
    searchAccount();
   
    // handleClickFilter();
    // handleImportUsers();
    // handleSearchEmail(users.data);
    // handleAddUserButton();
    // handleDeleteUserButton();


    
    
}

export async function renderTableAccountOnPagination(offset, limit){
    try {
        const data = {
            offset: offset,
            limit: limit,
            isFilter: 0,
            isSearch: 0
        }
        // console.log(data);
        const response = await callApi(`/user/pagination`, "POST", data);
        const result = response.data;
        // console.log(response);
        // console.log(users);
         renderListAccount(result.accounts);
        //  console.log(result.total);

        pagination.render({
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(result.total / limit),
            limit: limit,
            totalItems: result.total
        });
       

    } catch (error) {
       console.log(error);
    }

   
}

export function renderListAccount(users) {
    const tableBody = document.querySelector("#table-account tbody");
    
    if (!tableBody) return;
    
    // Hiển thị thông báo khi không có dữ liệu
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="text-secondary">
                        <i class="bi bi-inbox fs-1 mb-2 d-block opacity-50"></i>
                        <p class="mb-0">Không có dữ liệu tài khoản</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let bodyTable = ``;
    users.forEach((user, index) => {
        // Tạo class CSS cho badge dựa trên roleID
        const roleClasses = {
            'admin': 'bg-danger',
            'teacher': 'bg-success',
            'student': 'bg-info',
            'staff': 'bg-warning'
        };
        
        const roleClass = roleClasses[user.roleID] || 'bg-secondary';
        
        // Xác định trạng thái tài khoản
        const statusClass = user.status === 1 ? 'bg-success' : 'bg-danger';
        const statusText = user.status === 1 ? 'Đang hoạt động' : 'Đã khóa';
        
        // Kiểm tra xem email đã được chọn trước đó chưa
        const isChecked = selectedAccountIDs.has(user.email) ? 'checked' : '';
        
        bodyTable += `
            <tr>
                <td class="ps-4 text-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input user-checkbox" 
                            data-id="${user.email}" id="user-${index}" ${isChecked}>
                    </div>
                </td>
                <td style="width: 50px;">${index + 1}</td>
                <td>
                    <div class="fw-medium">${user.email}</div>
                    <div class="small text-muted">${user.fullName || 'Chưa cập nhật họ tên'}</div>
                </td>
                <td>
                    <span class="badge ${roleClass} rounded-pill px-3 py-2">${user.roleName || user.roleID}</span>
                </td>
                <td>
                    <span class="badge ${statusClass} rounded-pill px-3 py-2">${statusText}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center text-nowrap">
                        <i class="bi bi-calendar-date text-primary me-2"></i>
                        <small>${user.created_at}</small>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center text-nowrap">
                        <i class="bi bi-clock-history text-primary me-2"></i>
                        <small>${user.updated_at}</small>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-outline-primary rounded-circle action-btn detail-account" 
                            title="Chỉnh sửa" data-id="${user.email}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-circle action-btn delete-account-i" 
                            title="Xóa" data-id="${user.email}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = bodyTable;

    // Kích hoạt các event listeners
    activateActionButtons();
    setupUserCheckboxes();
}

function setupUserCheckboxes() {
    const selectAllCheckbox = document.getElementById('select-all-accounts');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('delete-selected-accounts');

    if (!selectAllCheckbox || !selectedCountElem) return;

    // Cập nhật số lượng mục đã chọn và hiển thị nút xóa hàng loạt
    function updateSelectedCount() {
        // Cập nhật Set selectedAccountIDs dựa trên trạng thái checkbox hiện tại
        userCheckboxes.forEach(checkbox => {
            const email = checkbox.getAttribute('data-id');
            if (checkbox.checked) {
                selectedAccountIDs.add(email);
            } else {
                selectedAccountIDs.delete(email);
            }
        });
        
        // Hiển thị số lượng mục đã chọn
        selectedCountElem.textContent = selectedAccountIDs.size;
        
        // Hiển thị hoặc ẩn nút xóa hàng loạt
        if (selectedAccountIDs.size > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }
        
        // Cập nhật trạng thái của checkbox "chọn tất cả"
        if (userCheckboxes.length > 0) {
            if (selectedAccountIDs.size === userCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else if (selectedAccountIDs.size === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.indeterminate = true;
            }
        }
    }

    // Xử lý sự kiện khi click vào checkbox "chọn tất cả"
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const email = checkbox.getAttribute('data-id');
                
                if (this.checked) {
                    selectedAccountIDs.add(email);
                } else {
                    selectedAccountIDs.delete(email);
                }
            });
            updateSelectedCount();
        });
    }

    // Xử lý sự kiện khi click vào các checkbox riêng lẻ
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const email = this.getAttribute('data-id');
            
            if (this.checked) {
                selectedAccountIDs.add(email);
            } else {
                selectedAccountIDs.delete(email);
            }
            
            updateSelectedCount();
        });
    });

    // Khởi tạo trạng thái ban đầu
    updateSelectedCount();
}



// Kích hoạt các action buttons
function activateActionButtons() {
    // Nút chỉnh sửa
    document.querySelectorAll('.detail-account').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const email = btn.getAttribute('data-id');
            showDetail(email);
        };
    });
    
    // Nút xóa
    document.querySelectorAll('.delete-account-i').forEach(btn => {
        btn.onclick = async function(e){
            e.preventDefault();
            const email = btn.getAttribute('data-id');
            try {
                const response = await callApi("/user", "DELETE", [id]);
                console.log(response);
                renderTableAccountOnPagination(0, 10);
            } catch (error) {
                console.log(error);
            }
        };
    });
}
