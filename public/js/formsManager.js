import PaginationComponent from './component/pagination.js';
import {callApi} from "./apiService.js";


async function loadSurveyTable(data) {

    if (!data || !data.forms) {
        console.error("Invalid survey data.");
        return;
    }

    const table = document.getElementById('surveyTable');
    const pagination = document.getElementById('pagination');

    if (!table || !pagination) {
        console.error("Required elements not found.");
        return;
    }

    // Render table rows
    table.innerHTML = '';
    data.forms.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.tooltip = item.FName;
        row.innerHTML = `
            <td class="text-center" >${item.FID}</td>
            <td class="text-left tooltip-trigger" data-tooltip="${item.FName}">
                ${limitLineBreaks(item.FName, 2,41)}
                </td>
            <td class="text-center">${item.TypeID}</td>
            <td class="text-center">${item.MajorID}</td>
            <td class="text-center">${item.PeriodID}</td>
            <td class="text-left">${item.Note}</td>
            <td class="text-center">${item.UID}</td>
            <td class="text-center">${item.Status}</td>
            <td style="display: flex; justify-content: center; align-items: center; gap: 5px; height: 65px">
                <a href="${item.uri}" class="btn btn-warning custom-button btn-edit-form">Sửa</a>
                <button class="btn btn-secondary btn-settings custom-button btn-setting-form" data-id="${item.FID}">
                    <i class="bi bi-gear-fill"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });

    // Event for buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', async function () {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('td');
            if (firstTd) {
                const fid = firstTd.textContent.trim();
                const form = data.forms.find(item => item.FID === fid);
                if (this.classList.contains('btn-edit-form')) {
                    window.location.href = `${config.Url}/admin/form/${fid}/edit`;
                } else if (this.classList.contains('btn-setting-form')) {
                    const fid = firstTd.textContent.trim();
                    const form = data.forms.find(item => item.FID === fid);
                    openSettingsModal(fid, form);
                }
            }
        });
    });

    const btnAddForm = document.querySelector('.btn-add-form');
    if (btnAddForm) {
        btnAddForm.addEventListener('click', async function () {
            const res = await fetch(`${config.apiUrl}/draft`, {
                method: 'POST',

            });
            if (res.ok) {
                const data = await res.json();
                const url = data['url'];
                window.location.href = `${config.Url}${url}`;
            }
        });
    }



    cleanupTooltips();
// Call the function to add tooltip functionality
    addTooltips();

// Loại bỏ các phần tử tooltip cũ nếu có để tránh trùng lặp (ví dụ khi tải lại hoặc cập nhật bảng)
    function cleanupTooltips() {
        const existingTooltips = document.querySelectorAll('.tooltip-outside');
        existingTooltips.forEach(tooltip => tooltip.remove());
    }

}

function limitLineBreaks(text, maxLineBreaks,maxWidth) {
    const lines = text.split('\n');
    const limitedLines = lines.slice(0, maxLineBreaks).join('\n');
    return limitedLines.length > maxWidth ? limitedLines.substring(0, maxWidth) + ' ...' : limitedLines;
}
export async function loadSurveyFromAPI(offset, limit) {
    try {
        currentLimit = limit;
        const res = await fetch(`${config.apiUrl}/admin/forms/pagination?offset=${offset}&limit=${limit}`);
        const data = await res.json();
        await loadSurveyTable(data['data']);

        pagination.render({
            currentPage: data['data']['currentPage'],
            totalPages: data['data']['totalPages'],
            limit: limit,
            totalItems: data['data']['totalItems']
        });
    } catch (error) {
        console.error("Failed to load survey data:", error);
    }
}
function addTooltips() {
    document.querySelectorAll(`.tooltip-outside`).forEach(t => t.remove());

    const tooltipTriggers = document.querySelectorAll(`.tooltip-trigger`);

    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener(`mouseenter`, () => {
            const tooltipText = trigger.getAttribute(`data-tooltip`);
            if (!tooltipText) return;

            const tooltipEl = document.createElement(`div`);
            tooltipEl.classList.add(`tooltip-outside`);
            tooltipEl.style.opacity = `0`;
            tooltipEl.style.minHeight = `20px`;
            tooltipEl.textContent = tooltipText;
            tooltipEl.style.position = `absolute`;
            tooltipEl.style.padding = `5px 10px`;
            tooltipEl.style.backgroundColor = `#333`;
            tooltipEl.style.color = `#fff`;
            tooltipEl.style.borderRadius = `4px`;
            tooltipEl.style.whiteSpace = `normal`;
            tooltipEl.style.overflowWrap = `break-word`;
            tooltipEl.style.zIndex = `1000`;
            tooltipEl.style.visibility = `hidden`;

            // Gắn vào body
            document.body.appendChild(tooltipEl);

            requestAnimationFrame(() => {
                const rect = trigger.getBoundingClientRect();
                const tooltipWidth = tooltipEl.offsetWidth;
                const tooltipHeight = tooltipEl.offsetHeight;

                let topPos = rect.bottom + window.scrollY + 5; // Tính toán theo viewport + scroll
                let leftPos = rect.left + window.scrollX + (rect.width - tooltipWidth) / 2;

                tooltipEl.style.top = topPos + `px`;
                tooltipEl.style.left = leftPos + `px`;
                tooltipEl.style.opacity = `1`;
                tooltipEl.style.visibility = `visible`;
            });

            trigger.addEventListener(`mouseleave`, () => {
                tooltipEl.remove();
            }, { once: true });
        });
    });
}


let currentLimit = 10;
let isHavePagination = false;
const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadSurveyFromAPI(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadSurveyFromAPI(offset, limit);
    },
    rowsPerPageText: 'Rows per page'
});
// When settings button is clicked
function openSettingsModal(formId, form) {
    // Create modal if it doesn't exist
    let modalElement = document.getElementById('formSettingsModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="formSettingsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Cài đặt biểu mẫu</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <h6 class="form-name fw-bold text-primary"></h6>
                            </div>
                            
                            <!-- Status Toggle -->
                            <div class="mb-3">
                                <label class="form-label">Trạng thái biểu mẫu</label>
                                <div class="d-flex align-items-center gap-2">
                                    <select class="form-select" id="formStatusSelect">
                                        <option value="1">Hoạt động</option>
                                        <option value="0">Không hoạt động</option>
                                        <option value="2">Bản nháp</option>
                                    </select>
                                    <button class="btn btn-outline-primary btn-sm" id="saveStatusBtn">Lưu</button>
                                </div>
                            </div>
                            
                            <!-- Whitelist Management -->
                               <div class="mb-3">
                                <label class="form-label">Danh sách truy cập</label>
                                <button class="btn btn-outline-primary w-100" id="manageWhitelistBtn">
                                    <i class="bi bi-people-fill me-2"></i>Quản lý danh sách truy cập
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer justify-content-between">
                            <div>
                                <button type="button" class="btn btn-danger me-2" id="deleteFormBtn">
                                    <i class="bi bi-trash"></i> Xóa biểu mẫu
                                </button>
                            </div>
                            <div>
                                <button type="button" class="btn btn-info me-2" id="duplicateFormBtn">
                                    <i class="bi bi-files"></i> Nhân bản
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('formSettingsModal');
    }

    // Set the form ID as a data attribute on the modal
    modalElement.dataset.formId = formId;

    // Update modal content with form details
    const formNameElement = modalElement.querySelector('.form-name');
    formNameElement.textContent = `Form #${formId}: ${form.FName}`;

    // Set current status in dropdown
    const statusSelect = document.getElementById('formStatusSelect');
    statusSelect.value = form.Status;

    // Setup event handlers
    setupSettingsModalHandlers(formId);


    // Show the modal
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
}

// Set up event handlers for the settings modal
function setupSettingsModalHandlers(formId) {
    // Save Status Button
    document.getElementById('saveStatusBtn').onclick = async () => {
        const status = document.getElementById('formStatusSelect').value;
        await updateFormStatus(formId, status);
    };

    document.getElementById('manageWhitelistBtn').onclick = async () => {
        await openWhitelistModal(formId);
    };
    // Delete Form Button
    document.getElementById('deleteFormBtn').onclick = async () => {
        await confirmDeleteForm(formId);
    };

    // Duplicate Form Button
    document.getElementById('duplicateFormBtn').onclick = async () => {
        await duplicateForm(formId);
    };
}

// Update form status
async function updateFormStatus(formId, status) {
    try {
        const response = await fetch(`${config.apiUrl}/forms/${formId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (result.success) {
            showToast('success', 'Cập nhật trạng thái thành công');
            // Refresh the form list
            loadSurveyFromAPI(0, currentLimit);
        } else {
            showToast('error', result.message || 'Không thể cập nhật trạng thái');
        }
    } catch (error) {
        console.error("Error updating status:", error);
        showToast('error', 'Lỗi khi cập nhật trạng thái');
    }
}
// Confirm and delete form
async function confirmDeleteForm(formId) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Xác nhận xóa biểu mẫu',
        text: 'Bạn có chắc muốn xóa biểu mẫu này? Hành động này không thể hoàn tác.',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${config.apiUrl}/forms/${formId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', 'Đã xóa biểu mẫu thành công');
                bootstrap.Modal.getInstance(document.getElementById('formSettingsModal')).hide();
                loadSurveyFromAPI(0, currentLimit);
            } else {
                showToast('error', result.message || 'Không thể xóa biểu mẫu');
            }
        } catch (error) {
            console.error("Error deleting form:", error);
            showToast('error', 'Lỗi khi xóa biểu mẫu');
        }
    }
}

// Duplicate form
async function duplicateForm(formId) {
    try {
        const response = await fetch(`${config.apiUrl}/forms/${formId}/duplicate`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showToast('success', 'Đã nhân bản biểu mẫu thành công');
            bootstrap.Modal.getInstance(document.getElementById('formSettingsModal')).hide();
            loadSurveyFromAPI(0, currentLimit);
        } else {
            showToast('error', result.message || 'Không thể nhân bản biểu mẫu');
        }
    } catch (error) {
        console.error("Error duplicating form:", error);
        showToast('error', 'Lỗi khi nhân bản biểu mẫu');
    }
}

// Simple toast notification function
function showToast(type, message) {
    Swal.fire({
        icon: type,
        title: type === 'success' ? 'Thành công' : 'Lỗi',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}
// Create and manage whitelist modal
async function openWhitelistModal(formId) {
    // Create modal if it doesn't exist
    let whitelistModalElement = document.getElementById('whitelistManagementModal');
    if (!whitelistModalElement) {
        const whitelistModalHTML = `
            <div class="modal fade" id="whitelistManagementModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Quản lý danh sách truy cập</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <!-- Left column: Available users -->
                                <div class="col-md-5">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h6 class="m-0">Danh sách người dùng</h6>
                                            <div>
                                                <label for="importExcel" class="btn btn-sm btn-success mb-0">
                                                    <i class="bi bi-file-earmark-excel me-1"></i>Nhập Excel
                                                </label>
                                                <input type="file" id="importExcel" accept=".xlsx,.xls" class="d-none" />
                                            </div>
                                        </div>
                                        <div class="card-body p-0">
                                            <div class="p-2 border-bottom">
                                                <input type="text" class="form-control form-control-sm" 
                                                    id="userSearchInput" placeholder="Tìm kiếm email/tên..." />
                                            </div>
                                            <div class="user-list-container" style="height: 300px; overflow-y: auto;">
                                                <table class="table table-hover table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th style="width: 40px">
                                                                <input type="checkbox" class="form-check-input" id="selectAllUsers" />
                                                            </th>
                                                            <th>Email</th>
                                                            <th>Tên</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="availableUsersList">
                                                        <!-- User list will be loaded here -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Middle column: Action buttons -->
                                <div class="col-md-2 d-flex flex-column justify-content-center align-items-center gap-3">
                                    <button class="btn btn-primary" id="addToWhitelistBtn">
                                        <i class="bi bi-arrow-right"></i>
                                    </button>
                                    <button class="btn btn-danger" id="removeFromWhitelistBtn">
                                        <i class="bi bi-arrow-left"></i>
                                    </button>
                                </div>
                                
                                <!-- Right column: Whitelisted users -->
                                <div class="col-md-5">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h6 class="m-0">Danh sách đã được phép truy cập</h6>
                                            <span class="badge bg-primary" id="whitelistCount">0</span>
                                        </div>
                                        <div class="card-body p-0">
                                            <div class="p-2 border-bottom">
                                                <input type="text" class="form-control form-control-sm" 
                                                    id="whitelistSearchInput" placeholder="Lọc danh sách..." />
                                            </div>
                                            <div class="whitelist-container" style="height: 300px; overflow-y: auto;">
                                                <table class="table table-hover table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th style="width: 40px">
                                                                <input type="checkbox" class="form-check-input" id="selectAllWhitelist" />
                                                            </th>
                                                            <th>Email</th>
                                                            <th>Thời gian thêm</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="whitelistedUsersList">
                                                        <!-- Whitelisted users will be loaded here -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', whitelistModalHTML);
        whitelistModalElement = document.getElementById('whitelistManagementModal');
    }

    // Set the form ID as a data attribute on the modal
    whitelistModalElement.dataset.formId = formId;

    // Load data
    await loadUsersAndWhitelist(formId);

    // Setup event handlers
    setupWhitelistModalHandlers(formId);

    // Show the modal
    const whitelistModal = new bootstrap.Modal(whitelistModalElement, {
        backdrop: 'static'
    });
    whitelistModal.show();

    // Hide the settings modal when showing whitelist modal
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('formSettingsModal'));
    if (settingsModal) {
        settingsModal.hide();
    }

    // When whitelist modal is hidden, show settings modal again
    whitelistModalElement.addEventListener('hidden.bs.modal', () => {
        const settingsModal = new bootstrap.Modal(document.getElementById('formSettingsModal'));
        settingsModal.show();
    }, { once: true });
}

// Load users and whitelist data
async function loadUsersAndWhitelist(formId) {
    await Promise.all([
        loadAvailableUsers(formId),
        loadWhitelistedUsers(formId)
    ]);
}

// Load available users
async function loadAvailableUsers(formId) {
    try {
        const availableUsersList = document.getElementById('availableUsersList');
        availableUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Loading...</td></tr>';

        const response = await fetch(`${config.apiUrl}/userWithoutWhitelist/${formId}`);

        const data = await response.json();
        const users = data['data'];


        // const users = []

        // Render users
        if (users.length === 0) {
            availableUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3">Không tìm thấy người dùng nào</td></tr>';
        } else {
            availableUsersList.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input user-checkbox" value="${user.id}" 
                            data-email="${user.email}" data-name="${user.name}">
                    </td>
                    <td>${user.email}</td>
                    <td>${user.name}</td>
                `;
                availableUsersList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error loading available users:", error);
        document.getElementById('availableUsersList').innerHTML =
            '<tr><td colspan="3" class="text-center text-danger py-3">Lỗi khi tải danh sách người dùng</td></tr>';
    }
}

// Load whitelisted users
async function loadWhitelistedUsers(formId) {
    try {
        const whitelistedUsersList = document.getElementById('whitelistedUsersList');
        whitelistedUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Loading...</td></tr>';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 700));


        // Example whitelist data
        // const whitelist = [
        //     { email: 'john.doe@example.com', addedAt: '2023-05-15 10:30:22' },
        //     { email: 'jane.smith@example.com', addedAt: '2023-05-16 09:45:11' },
        //     { email: 'robert.johnson@example.com', addedAt: '2023-05-17 14:22:05' }
        // ];

        const data = await callApi(`/forms/${formId}/whitelist`);
        console.log(data);
        let whitelist = [];
        if (data.status){
            whitelist = data['data'];
        }
        console.log(whitelist);
        // Update whitelist count badge
        document.getElementById('whitelistCount').textContent = whitelist.length;

        // Render whitelisted users
        if (whitelist.length === 0) {
            whitelistedUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3">Chưa có người dùng nào được thêm vào danh sách</td></tr>';
        } else {
            whitelistedUsersList.innerHTML = '';
            whitelist.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input whitelist-checkbox" value="${item.email}">
                    </td>
                    <td>${item.UID}</td>
                    <td>${item.addedAt}</td>
                `;
                whitelistedUsersList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error loading whitelist:", error);
        document.getElementById('whitelistedUsersList').innerHTML =
            '<tr><td colspan="3" class="text-center text-danger py-3">Lỗi khi tải danh sách truy cập</td></tr>';
    }
}

// Setup event handlers for whitelist modal
function setupWhitelistModalHandlers(formId) {
    // Search input for users list
    document.getElementById('userSearchInput').addEventListener('input', function() {
        filterTable('availableUsersList', this.value);
    });

    // Search input for whitelist
    document.getElementById('whitelistSearchInput').addEventListener('input', function() {
        filterTable('whitelistedUsersList', this.value);
    });

    // Select all available users
    document.getElementById('selectAllUsers').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#availableUsersList .user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Select all whitelisted users
    document.getElementById('selectAllWhitelist').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#whitelistedUsersList .whitelist-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Add selected users to whitelist
    document.getElementById('addToWhitelistBtn').addEventListener('click', async function() {
        const selectedUsers = Array.from(document.querySelectorAll('#availableUsersList .user-checkbox:checked'))
            .map(checkbox => ({
                email: checkbox.dataset.email,
                name: checkbox.dataset.name
            }));

        if (selectedUsers.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một người dùng');
            return;
        }

        await addMultipleToWhitelist(formId, selectedUsers);
    });

    // Remove selected users from whitelist
    document.getElementById('removeFromWhitelistBtn').addEventListener('click', async function() {
        const selectedUsers = Array.from(document.querySelectorAll('#availableUsersList .user-checkbox:checked'))
            .map(checkbox => ({
                email: checkbox.dataset.email,
                name: checkbox.dataset.name
            }));

        if (selectedUsers.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một người dùng');
            return;
        }

        await removeMultipleFromWhitelist(formId, selectedUsers);
    });

    // Import Excel file
    document.getElementById('importExcel').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            importExcelWhitelist(formId, file);
            // Reset file input
            event.target.value = '';
        }
    });
}

// Filter table rows based on search input
function filterTable(tableId, searchText) {
    const rows = document.querySelectorAll(`#${tableId} tr:not(:first-child)`);
    const lowerSearchText = searchText.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(lowerSearchText)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Add multiple users to whitelist
async function addMultipleToWhitelist(formId, users) {
    try {
        showToast('info', 'Đang thêm người dùng vào danh sách...');

        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 800));
        const response = await fetch(`${config.apiUrl}/forms/${formId}/whitelist`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users })
        });


        // Success message
        showToast('success', `Đã thêm ${users.length} người dùng vào danh sách truy cập`);

        // Reload data
        await loadWhitelistedUsers(formId);

        // Uncheck all in users list
        document.getElementById('selectAllUsers').checked = false;
        document.querySelectorAll('#availableUsersList .user-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    } catch (error) {
        console.error("Error adding to whitelist:", error);
        showToast('error', 'Lỗi khi thêm người dùng vào danh sách');
    }
}

// Remove multiple users from whitelist
async function removeMultipleFromWhitelist(formId, user) {
    try {
        showToast('info', 'Đang xóa người dùng khỏi danh sách...');

        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 600));
        
        // Success message
        showToast('success', `Đã xóa ${emails.length} người dùng khỏi danh sách truy cập`);

        // Reload data
        await loadWhitelistedUsers(formId);

        // Uncheck all in whitelist
        document.getElementById('selectAllWhitelist').checked = false;
    } catch (error) {
        console.error("Error removing from whitelist:", error);
        showToast('error', 'Lỗi khi xóa người dùng khỏi danh sách');
    }
}

// Import Excel file for whitelist
async function importExcelWhitelist(formId, file) {
    try {
        showToast('info', 'Đang xử lý file Excel...');

        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate successful import
        showToast('success', 'Đã nhập 15 email từ file Excel thành công');

        // Reload whitelist
        await loadWhitelistedUsers(formId);
    } catch (error) {
        console.error("Error importing Excel:", error);
        showToast('error', 'Lỗi khi xử lý file Excel');
    }
}