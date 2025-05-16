import {callApi} from "../apiService.js";
import ImportExcelModal from "./ImportExcelModal.js";
import {cleanupModalBackdrops} from "../formsManager.js";
import EmailSendModal from "./EmailSendModal.js";

// Updated FormSettingsModal Class
export default class FormSettingsModal {
    constructor(config) {

        this.config = config;
        this.formId = null;
        this.form = null;
        this.lastCheckedUser = null;
        this.lastCheckedWhitelist = null;
        this.page = null;
    }

    async open(formId, form,page) {
        this.formId = formId;
        this.form = form;
        this.page = page;

        let modalElement = document.getElementById('formSettingsModal');
        if (modalElement) {
            // Dispose Bootstrap modal instance if it exists
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.dispose();
            }

            // Remove the element completely to clear all event listeners
            modalElement.remove();
        }

        // Create new modal - use getModalHTML instead of getHTML
        document.body.insertAdjacentHTML('beforeend', this.getModalHTML());
        modalElement = document.getElementById('formSettingsModal');

        // Set form ID as data attribute
        modalElement.dataset.formId = formId;

        // Update form name and status
        const formNameElement = modalElement.querySelector('.form-name');
        formNameElement.textContent = `Form #${formId}: ${form.FName}`;

        const statusSelect = document.getElementById('formStatusSelect');
        statusSelect.value = form.Status;

        // Reset any previous disabled states first
        statusSelect.disabled = false;
        const option0 = statusSelect.querySelector('option[value="0"]');
        if (option0) option0.disabled = false;

        // Apply status restrictions
        if (form.Status == '0') {
            statusSelect.disabled = true;
        } else if (form.Status == '1') {
            if (option0) option0.disabled = true;
        }

        const privacySelect = document.getElementById('formPrivacySelect');
        privacySelect.value = form.isPublic || '0'; // Default to private if not set

        // Load whitelist data
        await this.loadUsersAndWhitelist(formId);

        // Setup event handlers
        await this.setupHandlers(formId);

        // Handle accessibility for the modal
        modalElement.addEventListener('show.bs.modal', function() {
            // Set aria-hidden to false BEFORE the modal is shown
            this.setAttribute('aria-hidden', 'false');
        });

        modalElement.addEventListener('shown.bs.modal', function() {
            // Ensure aria-hidden remains false after showing
            this.setAttribute('aria-hidden', 'false');

            // Auto-focus the first interactive element
            const firstFocusable = this.querySelector('button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });

        modalElement.addEventListener('hide.bs.modal', function() {
            // Move focus away from modal elements before closing
            document.activeElement.blur();
        });

        modalElement.addEventListener('hidden.bs.modal', function() {
            // Reset aria-hidden when modal is fully closed
            this.setAttribute('aria-hidden', 'true');
        });

        // Show the modal
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();

        // Store instance reference on modal element
        modalElement.__settingsInstance = this;
    }

    getModalHTML() {
        return `
            <div class="modal fade" id="formSettingsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl" style="max-width: 95%; width: 1400px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title form-name">Form Settings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <!-- Left sidebar: Form settings -->
                                <div class="col-md-3">
                                    <div class="card mb-3">
                                        <div class="card-header bg-light">
                                            <h6 class="card-title mb-0">Status</h6>
                                        </div>
                                        <div class="card-body">
                                            <select class="form-select mb-2" id="formStatusSelect">
                                                <option value="0">Chưa công bố</option>
                                                <option value="1">Đã xuất bản</option>
                                                <option value="2">Đã đóng</option>
                                            </select>
                                            <select class="form-select mb-2" id="formPrivacySelect">
                                                <option value="0">Không công khai</option>
                                                <option value="1">Công khai</option>
                                            </select>                                 
                                            <button type="button" class="btn btn-primary btn-sm w-100" id="saveStatusBtn">
                                                <i class="bi bi-check-lg"></i> Lưu trạng thái
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="card mb-3">
                                        <div class="card-header bg-light">
                                            <h6 class="card-title mb-0">Thao tác</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="d-grid gap-2">
                                                <button type="button" class="btn btn-primary btn-sm" id="sendMailBtn">
                                                    <i class="bi bi-envelope"></i> Gửi mail
                                                </button>
                                                <button type="button" class="btn btn-info btn-sm" id="duplicateFormBtn">
                                                    <i class="bi bi-files"></i> Nhân bản
                                                </button>
                                                <button type="button" class="btn btn-danger btn-sm" id="deleteFormBtn">
                                                    <i class="bi bi-trash"></i> Xóa
                                                </button>
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Right section: Whitelist management -->
                                <div class="col-md-9">
                                    <div class="card">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                            <h6 class="card-title mb-0">Quản lý danh sách truy cập</h6>
                                            <button class="btn btn-sm btn-success" id="importExcel">
                                                <i class="bi bi-file-earmark-excel me-1"></i>Nhập Excel
                                            </button>
                                        </div>
                                        <div class="card-body p-0">
                                            <div class="row g-0">
                                                <!-- Available users -->
                                                <div class="col-md-5">
                                                    <div class="border-end h-100">
                                                        <div class="p-2 border-bottom">
                                                            <div class="d-flex flex-column gap-2">
                                                                <input type="text" class="form-control form-control-sm"
                                                                    id="userSearchInput" placeholder="Tìm kiếm email/tên..." />
                                                                <div class="d-flex align-items-center gap-2">
                                                                    <select class="form-select form-select-sm" id="userPositionFilter">
                                                                        <option value="">-- Tất cả chức vụ --</option>
                                                                    </select>
                                                                    <button class="btn btn-sm btn-outline-secondary" id="refresh">
                                                                        <i class="bi bi-arrow-clockwise fw-bold fs-5"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="p-2 border-bottom d-flex justify-content-between align-items-center bg-light">
                                                            <div class="form-check">
                                                                <input type="checkbox" class="form-check-input" id="selectAllUsers" />
                                                                <label class="form-check-label" for="selectAllUsers">Chọn tất cả</label>
                                                            </div>
                                                            <span>Người dùng có sẵn</span>
                                                        </div>
                                                        <div class="user-list-container" style="height: 300px; overflow-y: auto;">
                                                            <table class="table table-hover table-sm mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: 40px"></th>
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
                                                
                                                <!-- Middle column: Action buttons -->
                                                <div class="col-md-2">
                                                    <div class="d-flex flex-column justify-content-center align-items-center h-100 gap-3 py-4">
                                                        <button class="btn btn-primary" id="addToWhitelistBtn">
                                                            <i class="bi bi-arrow-right"></i>
                                                        </button>
                                                        <button class="btn btn-danger" id="removeFromWhitelistBtn">
                                                            <i class="bi bi-arrow-left"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <!-- Whitelisted users -->
                                                <div class="col-md-5">
                                                    <div class="h-100">
                                                        <div class="p-2 border-bottom">
                                                            <input type="text" class="form-control form-control-sm"
                                                                id="whitelistSearchInput" placeholder="Lọc danh sách..." />
                                                        </div>
                                                        <div class="p-2 border-bottom d-flex justify-content-between align-items-center bg-light">
                                                            <div class="form-check">
                                                                <input type="checkbox" class="form-check-input" id="selectAllWhitelist" />
                                                                <label class="form-check-label" for="selectAllWhitelist">Chọn tất cả</label>
                                                            </div>
                                                            <span class="d-flex align-items-center">
                                                                Danh sách truy cập
                                                                <span class="badge bg-primary ms-2" id="whitelistCount">0</span>
                                                            </span>
                                                        </div>
                                                        <div class="whitelist-container" style="height: 300px; overflow-y: auto;">
                                                            <table class="table table-hover table-sm mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: 40px"></th>
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
    }

    // Load users and whitelist data
    async loadUsersAndWhitelist(formId) {
        await Promise.all([
            this.loadAvailableUsers(formId),
            this.loadWhitelistedUsers(formId)
        ]);
    }

    async updateFormStatus(formId, status, privacy) {
        try {
            const result = await callApi(`/admin/form/status/${formId}`, 'PUT', {status, privacy});

            if (!result.status) {
                this.showToast('error', result.message || 'Không thể cập nhật trạng thái biểu mẫu');
                return;
            }

            // Success message
            this.showToast('success', 'Đã cập nhật trạng thái biểu mẫu');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('formSettingsModal'));
            modal.hide();

            // Reload the page or update the UI as needed
            // window.location.reload();
        } catch (error) {
            console.error("Error updating form status:", error);
            this.showToast('error', 'Lỗi khi cập nhật trạng thái biểu mẫu');
        }

    }

    // Load available users
    async loadAvailableUsers(formId) {
        try {
            const availableUsersList = document.getElementById('availableUsersList');
            availableUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Loading...</td></tr>';

            const data = await callApi(`/userWithoutWhitelist/${formId}`);
            const users = Array.isArray(data.data) ? data.data : [];

            // Render users
            if (users.length === 0) {
                availableUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3">Không tìm thấy người dùng nào</td></tr>';
            } else {
                availableUsersList.innerHTML = '';
                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.dataset.position = user.position; // Add role data attribute
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
    async loadWhitelistedUsers(formId) {
        try {
            const whitelistedUsersList = document.getElementById('whitelistedUsersList');
            whitelistedUsersList.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Loading...</td></tr>';

            const data = await callApi(`/forms/${formId}/whitelist`);
            let whitelist = [];
            if (data.status){
                whitelist = data['data'];
            }

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
                            <input type="checkbox" class="form-check-input whitelist-checkbox" value="${item.UID}"
                            data-email="${item.UID}">
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

    async setupHandlers(formId) {
        await this.loadPositionsForSelect();
        // Form settings handlers
        document.getElementById('saveStatusBtn').addEventListener('click', async () => {
            const status = document.getElementById('formStatusSelect').value;
            const privacy = document.getElementById('formPrivacySelect').value;
            await this.updateFormStatus(formId, status,privacy);
        });

        document.getElementById('deleteFormBtn').addEventListener('click', async () => {
            await this.confirmDeleteForm(formId);
        });

        document.getElementById('duplicateFormBtn').addEventListener('click', async () => {
            await this.duplicateForm(formId);
        });

        // Whitelist handlers
        this.setupWhitelistHandlers(formId);
    }

    setupWhitelistHandlers(formId) {
        // Role filter handler
        document.getElementById('userPositionFilter').addEventListener('change', () => {
            this.filterUsersByRoleAndText();
        });

        // Reset filters
        document.getElementById('refresh').addEventListener('click', async () => {
            document.getElementById('userSearchInput').value = '';
            document.getElementById('userPositionFilter').selectedIndex = 0;
            await this.loadAvailableUsers(formId);
            await this.loadWhitelistedUsers(formId);
        });

        // Search input for users list
        document.getElementById('userSearchInput').addEventListener('input', () => {
            this.filterUsersByRoleAndText();
        });

        // Search input for whitelist
        document.getElementById('whitelistSearchInput').addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const rows = document.querySelectorAll('#whitelistedUsersList tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        });

        // Select all available users
        document.getElementById('selectAllUsers').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#availableUsersList tr:not([style*="display: none"]) .user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

        // Select all whitelisted users
        document.getElementById('selectAllWhitelist').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#whitelistedUsersList tr:not([style*="display: none"]) .whitelist-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

        // Add selected users to whitelist
        document.getElementById('addToWhitelistBtn').addEventListener('click', async () => {
            const selectedUsers = Array.from(document.querySelectorAll('#availableUsersList .user-checkbox:checked'))
                .map(checkbox => ({
                    email: checkbox.dataset.email,
                    name: checkbox.dataset.name
                }));

            if (selectedUsers.length === 0) {
                this.showToast('warning', 'Vui lòng chọn ít nhất một người dùng');
                return;
            }

            await this.addMultipleToWhitelist(formId, selectedUsers);
        });

        // Remove selected users from whitelist
        document.getElementById('removeFromWhitelistBtn').addEventListener('click', async () => {
            const selectedUsers = Array.from(document.querySelectorAll('#whitelistedUsersList .whitelist-checkbox:checked'))
                .map(checkbox => ({
                    email: checkbox.dataset.email
                }));

            if (selectedUsers.length === 0) {
                this.showToast('warning', 'Vui lòng chọn ít nhất một người dùng');
                return;
            }

            await this.removeMultipleFromWhitelist(formId, selectedUsers);
        });

        // Import Excel file
        document.getElementById('importExcel').addEventListener('click', async () => {
            console.log("Import Excel button clicked");
            // Reference the modal and get instance
            const modalElement = document.getElementById('formSettingsModal');
            const formSettingsModal = bootstrap.Modal.getInstance(modalElement);

            // Initialize import modal
            const importExcelModal = new ImportExcelModal(this.config);

            // Hide settings modal
            formSettingsModal.hide();

            // Clean up any stray backdrops
            cleanupModalBackdrops();

            // Store this instance for reference
            document.getElementById('formSettingsModal').__settingsInstance = this;

            // Open import modal after a short delay
            setTimeout(() => {
                importExcelModal.open(formId, 'formSettingsModal');
            }, 50);
        });
     document.getElementById('sendMailBtn').addEventListener('click', async () => {
         console.log("Send mail button clicked");
            // Reference the modal and get instance
            const modalElement = document.getElementById('formSettingsModal');
            const formSettingsModal = bootstrap.Modal.getInstance(modalElement);

            // Initialize email modal
            const sendMailModal = new EmailSendModal(this.config);

            // Hide settings modal
            formSettingsModal.hide();

            // Clean up any stray backdrops
            cleanupModalBackdrops();

            // Store this instance for reference
            document.getElementById('formSettingsModal').__settingsInstance = this;

            // Open email modal after a short delay (consistent with ImportExcelModal)
            setTimeout(() => {
                sendMailModal.open(formId, 'formSettingsModal');
            }, 50);
        });


        // Handle shift+click for range selection on available users
        document.querySelector('#availableUsersList').addEventListener('click', (e) => {
            if (e.target && e.target.type === 'checkbox') {
                const checkbox = e.target;

                if (e.shiftKey && this.lastCheckedUser) {
                    // Get all checkboxes
                    const checkboxes = Array.from(document.querySelectorAll('#availableUsersList .user-checkbox'));

                    // Find indices
                    const currentIdx = checkboxes.indexOf(checkbox);
                    const lastIdx = checkboxes.indexOf(this.lastCheckedUser);

                    // Select range
                    const start = Math.min(currentIdx, lastIdx);
                    const end = Math.max(currentIdx, lastIdx);

                    for (let i = start; i <= end; i++) {
                        checkboxes[i].checked = checkbox.checked;
                    }
                }

                this.lastCheckedUser = checkbox;
            }
        });

        // Handle shift+click for range selection on whitelisted users
        document.querySelector('#whitelistedUsersList').addEventListener('click', (e) => {
            if (e.target && e.target.type === 'checkbox') {
                const checkbox = e.target;

                if (e.shiftKey && this.lastCheckedWhitelist) {
                    // Get all checkboxes
                    const checkboxes = Array.from(document.querySelectorAll('#whitelistedUsersList .whitelist-checkbox'));

                    // Find indices
                    const currentIdx = checkboxes.indexOf(checkbox);
                    const lastIdx = checkboxes.indexOf(this.lastCheckedWhitelist);

                    // Select range
                    const start = Math.min(currentIdx, lastIdx);
                    const end = Math.max(currentIdx, lastIdx);

                    for (let i = start; i <= end; i++) {
                        checkboxes[i].checked = checkbox.checked;
                    }
                }

                this.lastCheckedWhitelist = checkbox;
            }
        });

        // Reset tracked checkboxes when modal is hidden
        document.getElementById('formSettingsModal').addEventListener('hidden.bs.modal', () => {
            this.lastCheckedUser = null;
            this.lastCheckedWhitelist = null;
        });
    }

    // Filter by role and text
    filterUsersByRoleAndText() {
        const searchText = document.getElementById('userSearchInput').value.toLowerCase();
        const selectedRole = document.getElementById('userPositionFilter').value;

        const rows = document.querySelectorAll('#availableUsersList tr');

        rows.forEach(row => {
            const userData = row.textContent.toLowerCase();
            const userRole = row.dataset.position || '';

            const matchesSearch = !searchText || userData.includes(searchText);
            const matchesRole = !selectedRole || userRole === selectedRole;

            row.style.display = (matchesSearch && matchesRole) ? '' : 'none';
        });
    }


    // Add multiple users to whitelist
    async addMultipleToWhitelist(formId, users) {
        try {
            this.showToast('info', 'Đang thêm người dùng vào danh sách...');

            const result = await callApi(`/forms/${formId}/whitelist`, 'POST', {users});

            console.log(result);

            if (!result.status) {
                this.showToast('error', result.message || 'Không thể thêm người dùng vào danh sách');
                return;
            }

            // Success message
            this.showToast('success', `Đã thêm ${users.length} người dùng vào danh sách truy cập`);

            // Reload data
            await this.loadWhitelistedUsers(formId);
            await this.loadAvailableUsers(formId);

            // Uncheck "select all"
            document.getElementById('selectAllUsers').checked = false;
        } catch (error) {
            console.error("Error adding to whitelist:", error);
            this.showToast('error', 'Lỗi khi thêm người dùng vào danh sách');
        }
    }

    // Remove multiple users from whitelist
    async removeMultipleFromWhitelist(formId, users) {
        try {
            this.showToast('info', 'Đang xóa người dùng khỏi danh sách...');

            const result = await callApi(`/forms/${formId}/whitelist`, 'DELETE', {users});


            if (!result.status) {
                this.showToast('error', result.message || 'Không thể xóa người dùng khỏi danh sách');
                return;
            }

            // Success message
            this.showToast('success', `Đã xóa ${users.length} người dùng khỏi danh sách truy cập`);

            // Reload data
            await this.loadWhitelistedUsers(formId);
            await this.loadAvailableUsers(formId);

            // Uncheck "select all"
            document.getElementById('selectAllWhitelist').checked = false;
        } catch (error) {
            console.error("Error removing from whitelist:", error);
            this.showToast('error', 'Lỗi khi xóa người dùng khỏi danh sách');
        }
    }
    async loadPositionsForSelect() {
        try {
            const result = await callApi("/position", "GET");

            if (!result.status || !result.data) {
                this.showToast('error', 'Không thể tải danh sách vị trí');
                return;
            }


            // Get the select element
            const positionSelect = document.getElementById('userPositionFilter');

            // Clear existing options
            positionSelect.innerHTML = '';
            positionSelect.appendChild(new Option('-- Tất cả chức vụ --', ''));



            // Add positions to dropdown
            result.data.forEach(position => {
                const option = document.createElement('option');
                option.value = position.PositionID;
                option.textContent = position.PositionName;
                positionSelect.appendChild(option);
            });



        } catch (error) {
            console.error("Error loading positions:", error);
            this.showToast('error', 'Không thể tải danh sách vị trí');
        }
    }

    async confirmDeleteForm(formId){
        const result = await Swal.fire({
            title: 'Xóa biểu mẫu',
            text: "Bạn có chắc chắn muốn xóa biểu mẫu này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await this.deleteForm(formId);
            console.log("Confirmed delete form:", formId);
        }
    }

    async duplicateForm(formId){
        const result = await Swal.fire({
            title: 'Nhân bản biểu mẫu',
            text: "Bạn có chắc chắn muốn nhân bản biểu mẫu này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Nhân bản',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await this.duplicate(   formId);
            console.log("Confirmed duplicate form:", formId);
        }
    }



    // Helper method to show toast notifications
    showToast(type, message) {
        Swal.fire({
            icon: type,
            title: type === 'success' ? 'Thành công' : type === 'info' ? 'Thông báo' : type === 'warning' ? 'Cảnh báo' : 'Lỗi',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    async deleteForm(formId) {

        try {

            const result = await callApi(`/admin/form/${formId}`, 'DELETE');

            if (!result.status) {
                this.showToast('error', result.message || 'Không thể xóa biểu mẫu');
                return;
            }

            // Success message
            this.showToast('success', 'Đã xóa biểu mẫu thành công');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('formSettingsModal'));
            modal.hide();

            // Reload the page or update the UI as needed
            // window.location.reload();
            if (this.page === 'formManager') {
                const formsManagerModule = await import('../formsManager.js');
                await formsManagerModule.loadSurveyFromAPI(0, 10); // Reload first page with default limit
            }else {
                //Chuyển hướng về admin
                localStorage.setItem('triggerAction', 'clickButton');
                localStorage.setItem('targetSection', 'surveys'); // Set the section you want to load

                setTimeout(() => {
                    history.replaceState(null, '', '/admin');
                    window.location.href = '/admin';
                    }, 1000);
            }

            // Show success message
            this.showToast('success', 'Đã cập nhật danh sách biểu mẫu');
        } catch (error) {
            console.error("Error deleting form:", error);
            this.showToast('error', 'Lỗi khi xóa biểu mẫu');
        }

    }

    async duplicate(formId) {
        try {
            const result = await callApi(`/admin/form/${formId}/duplicate`, 'POST');

            if (!result.status) {
                this.showToast('error', result.message || 'Không thể nhân bản biểu mẫu');
                return;
            }

            // Success message
            this.showToast('success', 'Đã nhân bản biểu mẫu thành công');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('formSettingsModal'));
            modal.hide();
            const action = await Swal.fire({
                title: 'Nhân bản thành công!',
                text: 'Biểu mẫu đã được nhân bản thành công',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Đi đến biểu mẫu mới',
                cancelButtonText: 'Ở lại trang hiện tại'
            });

            // Handle user's choice
            if (action.isConfirmed && result.data && result.data.formId) {
                // Navigate to the new form
                window.location.href = `${this.config.Url}/admin/form/${result.data.formId}/edit?status=draft`;
            } else {
                // Reload the table to show the new form in the list

                this.showToast('success', 'Đã cập nhật danh sách biểu mẫu');
            }
            // Reload the page or update the UI as needed

        } catch (error) {
            console.error("Error duplicating form:", error);
            this.showToast('error', 'Lỗi khi nhân bản biểu mẫu');
        }

    }
}
