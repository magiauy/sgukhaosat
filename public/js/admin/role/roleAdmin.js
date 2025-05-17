import { callApi } from "../../apiService.js";
import { handleDeleteRole, handleDeleteSelectedRoles } from "./deleteRole.js";
import { showPopupAddRole } from "./addRole.js";
import { showEditRole } from "./editRole.js";
import { search } from "./searchRole.js";
import { filter } from "./filterRole.js";
import PaginationComponent from "../../component/pagination.js";

// Function to convert table to mobile view
function setupResponsiveTable() {
    const tableElement = document.getElementById('table-role');
    if (!tableElement) return;
    
    function adjustTableForScreenSize() {
        if (window.innerWidth < 768) {
            tableElement.classList.add('mobile-card-view');
            convertToMobileCards();
        } else {
            tableElement.classList.remove('mobile-card-view');
            // Restore original table if needed
            if (document.querySelectorAll('.mobile-role-header').length > 0) {
                renderTableOnPagination(
                    (pagination.currentPage - 1) * pagination.limit, 
                    pagination.limit
                );
            }
        }
    }
    
    // Call once on init
    adjustTableForScreenSize();
    
    // Setup resize listener
    window.removeEventListener('resize', adjustTableForScreenSize);
    window.addEventListener('resize', adjustTableForScreenSize);
}

// Function to convert table rows to mobile cards
function convertToMobileCards() {
    const rows = document.querySelectorAll('#table-role tbody tr');
    
    rows.forEach(row => {
        if (row.querySelector('.mobile-role-header')) return; // Already converted
        
        const checkbox = row.querySelector('td:nth-child(1)');
        const index = row.querySelector('td:nth-child(2) .badge')?.textContent || '';
        const roleId = row.querySelector('td:nth-child(3) .fw-medium')?.textContent || '';
        const roleName = row.querySelector('td:nth-child(4) .fw-medium')?.textContent || '';
        const createdDate = row.querySelector('td:nth-child(5) .text-secondary')?.textContent || '';
        const updatedDate = row.querySelector('td:nth-child(6) .text-secondary')?.textContent || '';
        const actions = row.querySelector('td:nth-child(7) .d-flex')?.innerHTML || '';
        
        // Create mobile header
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-role-header';
        mobileHeader.innerHTML = `
            <div>
                <span class="badge bg-light text-dark rounded-pill px-2">${index}</span>
                <span class="ms-2 fw-medium text-primary">${roleId}</span>
            </div>
            ${checkbox.outerHTML}
        `;
        
        // Create mobile info section
        const mobileInfo = document.createElement('div');
        mobileInfo.className = 'mobile-role-info';
        mobileInfo.innerHTML = `
            <div class="data-row">
                <span class="data-label">Tên vai trò:</span>
                <span class="fw-medium">${roleName}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Thời gian tạo:</span>
                <span class="d-flex align-items-center">
                    <i class="bi bi-calendar-date text-primary me-2"></i>
                    <span class="text-secondary">${createdDate}</span>
                </span>
            </div>
            <div class="data-row">
                <span class="data-label">Thời gian cập nhật:</span>
                <span class="d-flex align-items-center">
                    <i class="bi bi-clock-history text-primary me-2"></i>
                    <span class="text-secondary">${updatedDate}</span>
                </span>
            </div>
        `;
        
        // Create mobile actions section
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-role-actions';
        mobileActions.innerHTML = actions;
        
        // Clear the row and add our new elements
        row.innerHTML = '';
        row.appendChild(mobileHeader);
        row.appendChild(mobileInfo);
        row.appendChild(mobileActions);
    });
    
    // Reattach event listeners after DOM changes
    logicCheckbox();
    handleDeleteRole();
    showEditRole();
}

export let selectedRoleIDs = new Set();

// Thêm hàm này vào file

export function clearSelectedRoles() {
    selectedRoleIDs.clear();
    const selectedCountElem = document.getElementById('selected-count');
    if (selectedCountElem) {
        selectedCountElem.textContent = "0";
    }
    
    const deleteSelectedBtn = document.getElementById('delete-selected-roles');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.classList.add('d-none');
    }
    
    const selectAllCheckbox = document.getElementById('select-all-roles');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

const pagination = new PaginationComponent({
    containerId: 'pagination-role',
    onPageChange: (offset, limit) => {
        renderTableOnPagination(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        renderTableOnPagination(offset, limit);
    },

});

export async function renderContentRole(){
    // Add CSS link for responsive tables
    if (!document.getElementById('responsive-tables-css')) {
        const cssLink = document.createElement('link');
        cssLink.id = 'responsive-tables-css';
        cssLink.rel = 'stylesheet';
        cssLink.href = '/public/css/responsive-tables.css';
        document.head.appendChild(cssLink);
    }


    document.querySelector("#content").innerHTML = `
    <div class="container-fluid p-0">
        <!-- Card chính chứa nội dung -->
        <div class="card border rounded-4 overflow-hidden">
            <div class="card-body p-0">
                <!-- Search section - Cải thiện spacing -->
                <div class="px-4 pt-4 pb-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-lg-7 col-md-6">
                            <div class="form-floating">
                                <input type="text" class="form-control rounded-3 border-light-subtle" id="id-search" placeholder="Nhập tên vai trò cần tìm">
                                <label for="id-search">Tìm kiếm theo ID vai trò</label>
                            </div>
                        </div>
                        <div class="col-lg-5 col-md-6">
                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-primary rounded-3 px-4 py-2" id="search-button">
                                    <i class="bi bi-search me-2"></i> Tìm kiếm
                                </button>
                                <button id="add-role-button" class="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center">
                                    <i class="bi bi-plus-circle me-2"></i> Thêm vai trò
                                </button>
                                <button id="delete-selected-roles" class="btn btn-outline-danger rounded-pill px-3 py-2 d-none d-flex align-items-center">
                                    <i class="bi bi-trash me-2"></i> Xóa đã chọn
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
                            <button id="delete-filter-role" class="btn btn-outline-secondary rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-x-circle me-1"></i> Xóa lọc
                            </button>
                            <button id="filter-role" class="btn btn-primary rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-funnel me-1"></i> Áp dụng
                            </button>
                        </div>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-lg-4 col-md-6">
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
                        
                        <div class="col-lg-4 col-md-6">
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
                        
                        <div class="col-lg-4 col-md-12">
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
                    </div>
                </div>                    
                    
                <!-- Table section - Loại bỏ shadow -->
                <div class="px-4 mb-4">
                    <div class="table-responsive rounded-4 border overflow-hidden">
                        <table id="table-role" class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4" style="width: 40px;">
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="select-all-roles">
                                        </div>
                                    </th>
                                    <th style="width: 50px;">#</th>
                                    <th>ID vai trò</th>
                                    <th>Tên vai trò</th>
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
                        <nav aria-label="Page navigation" id="pagination-role" class="pagination-container">
                            <!-- Phân trang sẽ được render ở đây -->
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

   
    // renderTableOnPagination(0, 10); // Hiển thị 10 vai trò đầu tiên
     // Call setupResponsiveTable after table is rendered
    renderTableOnPagination(0, 10).then(() => {
        setupResponsiveTable();
    });


    showPopupAddRole(); // Khi ấn thêm vai trò
    handleDeleteSelectedRoles(); // Xóa vai trò đã chọn
    search();
    filter(); // Lọc vai trò theo ngày tạo
}

// Cập nhật hàm renderTableRole

export async function renderTableRole(roles) {

    let currentAccount = await callApi("/me", "POST");
    currentAccount = currentAccount.data;
    currentAccount = currentAccount.user;
    const roleIDCurrent = currentAccount.roleID;

    const tableBody = document.querySelector("#table-role tbody");
    tableBody.innerHTML = "";

    // const indexCurrent = roles.findIndex(role => role.roleID === roleIDCurrent);

    roles.forEach((role, index) => {
        // Kiểm tra xem role này có trong danh sách đã chọn hay không
        const isChecked = selectedRoleIDs.has(role.roleID) ? 'checked' : '';
        let isCheckedCurrent = '';
<<<<<<< HEAD
        if(role.roleID !== roleIDCurrent){
            
        tableBody.innerHTML += `
            <tr class="role-row">
                <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input role-checkbox" data-id="${role.roleID}" ${isChecked}>
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge bg-light text-dark rounded-pill px-2">${index+1}</span>
                </td>
                <td>
                    <div class="fw-medium text-primary">${role.roleID}</div>
                </td>
                <td>
                    <div class="fw-medium">${role.roleName}</div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar-date text-primary me-2"></i>
                        <span class="text-secondary">${role.created_at}</span>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clock-history text-primary me-2"></i>
                        <span class="text-secondary">${role.updated_at}</span>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <div class="d-flex gap-2 justify-content-end">
                        <button data-code="${role.roleID}" class="btn btn-outline-primary btn-sm rounded-pill px-3 edit-role">
                            <i class="bi bi-pencil me-1"></i> Sửa
                        </button>
                        <button data-code="${role.roleID}" class="btn btn-outline-danger btn-sm rounded-pill px-3 delete-role">
                            <i class="bi bi-trash me-1"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
=======
        if(indexCurrent === index){
            isCheckedCurrent = 'disabled-row';
        }
        if(role.roleID !== roleIDCurrent){
            tableBody.innerHTML += `
                <tr class="role-row ${isCheckedCurrent}">
                    <td class="ps-4">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input role-checkbox" data-id="${role.roleID}" ${isChecked}>
                        </div>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-light text-dark rounded-pill px-2">${index+1}</span>
                    </td>
                    <td>
                        <div class="fw-medium text-primary">${role.roleID}</div>
                    </td>
                    <td>
                        <div class="fw-medium">${role.roleName}</div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-calendar-date text-primary me-2"></i>
                            <span class="text-secondary">${role.created_at}</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-clock-history text-primary me-2"></i>
                            <span class="text-secondary">${role.updated_at}</span>
                        </div>
                    </td>
                    <td class="text-end pe-4">
                        <div class="d-flex gap-2 justify-content-end">
                            <button data-code="${role.roleID}" class="btn btn-outline-primary btn-sm rounded-pill px-3 edit-role">
                                <i class="bi bi-pencil me-1"></i> Sửa
                            </button>
                            <button data-code="${role.roleID}" class="btn btn-outline-danger btn-sm rounded-pill px-3 delete-role">
                                <i class="bi bi-trash me-1"></i> Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
>>>>>>> temp-fix
        }
    });

    logicCheckbox();
    handleDeleteRole(); // Xóa vai trò
    showEditRole(); // Sửa vai trò

     // After rendering is complete, setup responsive again if needed
    if (window.innerWidth < 768) {
        convertToMobileCards();
    }
}


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
    selectAllCheckbox.onchange = function() {
        roleCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            
            // Cập nhật Set các ID được chọn
            const roleID = checkbox.getAttribute('data-id');
            if (this.checked) {
                selectedRoleIDs.add(roleID);
            } else {
                selectedRoleIDs.delete(roleID);
            }
        });
        updateSelectedCount();
    };

    // Xử lý sự kiện khi click vào các checkbox riêng lẻ
    roleCheckboxes.forEach(checkbox => {
        checkbox.onchange = function() {
            const roleID = this.getAttribute('data-id');
            
            // Cập nhật Set các ID được chọn
            if (this.checked) {
                selectedRoleIDs.add(roleID);
            } else {
                selectedRoleIDs.delete(roleID);
            }
            
            updateSelectedCount();
        };
    });

    // Khôi phục trạng thái checkbox từ selectedRoleIDs
    roleCheckboxes.forEach(checkbox => {
        const roleID = checkbox.getAttribute('data-id');
        if (selectedRoleIDs.has(roleID)) {
            checkbox.checked = true;
        }
    });

    // Khởi tạo trạng thái ban đầu
    updateSelectedCount();
}


export async function renderTableOnPagination(offset, limit){
    try {
        // console.log(offset, limit);
        let response = await callApi("/role/pagination", "POST", {
            offset: offset,
            limit: limit,
            isFilter: 0,
            isSearch: 0
        });
        let result = response.data; // Lấy danh sách vai trò từ API
        // console.log(result);
        renderTableRole(result.roles); // Gọi hàm renderTableRole để hiển thị danh sách vai trò
        
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






