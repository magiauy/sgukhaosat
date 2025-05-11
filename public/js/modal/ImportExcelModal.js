// Import Excel Modal Class
import { cleanupModalBackdrops } from "../formsManager.js";
import {callApi} from "../apiService.js";

export default class ImportExcelModal {
    constructor(config) {
        this.config = config;
        this.formId = null;
        this.parentModal = null;
        this.existingEmails = [];
        this.newEmails = [];
        this.allEmails = [];
    }

        // In ImportExcelModal.js, update the open method
        async open(formId, parentModal) {
            this.formId = formId;
            this.parentModal = parentModal;

            // Create modal if it doesn't exist
            let modalElement = document.getElementById('importExcelModal');
            if (!modalElement) {
                document.body.insertAdjacentHTML('beforeend', this.getModalHTML());
                modalElement = document.getElementById('importExcelModal');
            }

            // Reset data
            this.existingEmails = [];
            this.newEmails = [];
            this.allEmails = [];

            // Setup handlers
            this.setupHandlers();

            // If we have a parent modal, hide it
            if (this.parentModal) {
                const parentModalElement = document.getElementById(this.parentModal);
                if (parentModalElement) {
                    const parentModalInstance = bootstrap.Modal.getInstance(parentModalElement);
                    if (parentModalInstance) {
                        parentModalInstance.hide();
                        // Remove backdrop from parent modal
                        cleanupModalBackdrops();
                    }
                }
            }

            // Show the modal after a short delay to allow backdrop cleanup
            setTimeout(() => {
                const modal = new bootstrap.Modal(modalElement, {
                    keyboard: false
                });
                modal.show();
            }, 50);

            // When this modal is hidden, show parent modal again and clean up
            modalElement.addEventListener('hidden.bs.modal', () => {
                cleanupModalBackdrops();

                if (this.parentModal) {
                    setTimeout(() => {
                        const parentModalElement = document.getElementById(this.parentModal);
                        if (parentModalElement) {
                            const parentModalInstance = bootstrap.Modal.getInstance(parentModalElement);
                            // If instance exists, show it, otherwise create a new one
                            if (parentModalInstance) {
                                parentModalInstance.show();
                            } else if (parentModalElement.__settingsInstance) {
                                // If we have a stored reference to the settings instance
                                parentModalElement.__settingsInstance.open(
                                    this.formId,
                                    parentModalElement.__settingsInstance.form
                                );
                            }
                        }
                    }, 50);
                }
            }, { once: true });
        }

    getModalHTML() {
        return `
            <div class="modal fade" id="importExcelModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width: 95%; width: 1400px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nhập danh sách từ Excel</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- File upload section -->
                            <div class="mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-title">1. Chọn file Excel</h6>
                                            <div class="file-upload-wrapper">
                                              <div class="file-upload-area" id="dropZone">
                                                <i class="bi bi-cloud-arrow-up fs-2 mb-2"></i>
                                                <p class="mb-1">Kéo thả file Excel vào đây hoặc</p>
                                                <label for="excelFileInput" class="btn btn-outline-primary btn-sm">
                                                  <i class="bi bi-folder me-1"></i>Chọn file
                                                </label>
                                                <input type="file" class="d-none" id="excelFileInput" accept=".xlsx,.xls,.csv" />
                                                <p class="small text-muted mt-1">Hỗ trợ .xlsx, .xls, .csv</p>
                                              </div>
                                              <div class="selected-file d-none" id="selectedFileInfo">
                                                <div class="d-flex align-items-center gap-2">
                                                  <i class="bi bi-file-earmark-excel text-success fs-4"></i>
                                                  <div class="file-details">
                                                    <span class="file-name fw-medium" id="selectedFileName">filename.xlsx</span>
                                                    <small class="file-size text-muted d-block" id="selectedFileSize">0 KB</small>
                                                  </div>
                                                  <button class="btn btn-sm btn-link text-danger ms-auto" id="removeFileBtn">
                                                    <i class="bi bi-x-lg"></i>
                                                  </button>
                                                </div>
                                                <button class="btn btn-primary w-100 mt-2" id="parseExcelBtn">
                                                  <i class="bi bi-upload me-1"></i>Tải lên và xử lý
                                                </button>
                                              </div>
                                            </div>
                                        <small class="text-muted mt-2 d-block">
                                            File Excel phải có cột chứa địa chỉ email
                                        </small>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Results section - initially hidden -->
                            <div id="resultsSection" class="d-none">
                                <div class="row">
                                    <!-- Existing emails -->
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header d-flex justify-content-between align-items-center bg-light">
                                                <h6 class="m-0">Email đã tồn tại</h6>
                                                <span class="badge bg-primary" id="existingEmailCount">0</span>
                                            </div>
                                            <div class="card-body p-0">
                                                <div class="existing-emails-container" style="height: 250px; overflow-y: auto;">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th style="width: 70%">Email</th>
                                                                <!--<th>Tên</th>-->
                                                                <th style="width: 30%">Vai trò</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="existingEmailsList">
                                                            <!-- Existing emails will appear here -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- New emails -->
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header d-flex justify-content-between align-items-center bg-light">
                                                <h6 class="m-0">Email chưa tồn tại</h6>
                                                <span class="badge bg-warning" id="newEmailCount">0</span>
                                            </div>
                                           <div class="card-body p-0">
                                                  <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
                                                    <div class="d-flex align-items-center gap-2" style="width: 50%;">
                                                      <label class="form-label mb-0 text-nowrap">Vai trò:</label>
                                                      <select class="form-select form-select-sm" id="bulkPositionSelect">
                                                      </select>
                                                    </div>
                                                    <button class="btn btn-success btn-sm ms-2" id="createAccountsBtn">
                                                      <i class="bi bi-person-plus me-1"></i>Tạo tài khoản
                                                    </button>
                                                  </div>
                                                <div class="new-emails-container" style="height: 220px; overflow-y: auto;">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Email</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="newEmailsList">
                                                            <!-- New emails will appear here -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary d-none" id="addExcelToWhitelistBtn">
                                <i class="bi bi-check2-circle me-1"></i>Thêm tất cả vào danh sách truy cập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    async setupHandlers() {
        await this.loadPositionsForSelect();

        // Parse Excel button handler
        document.getElementById('parseExcelBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('excelFileInput');
            if (!fileInput.files || !fileInput.files[0]) {
                this.showToast('warning', 'Vui lòng chọn file Excel');
                return;
            }

            this.processExcelFile(fileInput.files[0]);
        });

        // Create accounts button handler
        document.getElementById('createAccountsBtn').addEventListener('click', async () => {
            await this.createBulkAccounts();
        });

        // Add to whitelist button handler
        document.getElementById('addExcelToWhitelistBtn').addEventListener('click', async () => {
            await this.addAllToWhitelist();
        });
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('excelFileInput');
        const selectedFileInfo = document.getElementById('selectedFileInfo');
        const selectedFileName = document.getElementById('selectedFileName');
        const selectedFileSize = document.getElementById('selectedFileSize');
        const removeFileBtn = document.getElementById('removeFileBtn');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone when file is dragged over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            handleFile(file);
        }, false);

        // Handle selected file from input
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                handleFile(fileInput.files[0]);
            }
        });

        // Click on drop zone should open file dialog
        dropZone.addEventListener('click', (e) => {
            if (e.target !== fileInput) {
                fileInput.click();
            }
        });

        // Remove selected file
        removeFileBtn.addEventListener('click', () => {
            fileInput.value = '';
            dropZone.classList.remove('d-none');
            selectedFileInfo.classList.add('d-none');
        });

        // Handle file selection
        function handleFile(file) {
            if (file && file.name.match(/\.(xlsx|xls|csv)$/)) {
                selectedFileName.textContent = file.name;
                selectedFileSize.textContent = formatFileSize(file.size);
                dropZone.classList.add('d-none');
                selectedFileInfo.classList.remove('d-none');

                // Set the file in the input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            } else {
                this.showToast('error', 'Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV');
            }
        }

        // Format file size to human-readable format
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }

    async processExcelFile(file) {
        try {
            this.showToast('info', 'Đang xử lý file Excel...');

            const formData = new FormData();
            formData.append('excelFile', file);

            const result = await callApi(`/excel/parse-emails`, 'POST',null,formData);
            if (!result.status) {
                this.showToast('error', result.message || 'Không thể xử lý file Excel');
                return;
            }

            // Store extracted data
            this.existingEmails = result.data.existingUsers || [];
            this.newEmails = result.data.newEmails || [];
            this.allEmails = [...this.existingEmails.map(u => u.email), ...this.newEmails];

            // Display the results
            this.displayResults();

            // Show results section and whitelist button
            document.getElementById('resultsSection').classList.remove('d-none');
            document.getElementById('addExcelToWhitelistBtn').classList.remove('d-none');

            this.showToast('success', `Đã phân tích ${this.allEmails.length} email từ file Excel`);
        } catch (error) {
            console.error("Error processing Excel file:", error);
            this.showToast('error', 'Lỗi khi xử lý file Excel');
        }
    }

    displayResults() {
        // Update counts
        document.getElementById('existingEmailCount').textContent = this.existingEmails.length;
        document.getElementById('newEmailCount').textContent = this.newEmails.length;

        // Display existing users
        const existingList = document.getElementById('existingEmailsList');
        existingList.innerHTML = '';

        if (this.existingEmails.length === 0) {
            existingList.innerHTML = '<tr><td colspan="3" class="text-center py-3">Không có email nào đã tồn tại</td></tr>';
        } else {
            this.existingEmails.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.email}</td>
<!--                    <td>${user.name || '-'}</td>-->
                    <td>${(user.positionName) || '-'}</td>
                `;
                existingList.appendChild(row);
            });
        }

        // Display new emails
        const newList = document.getElementById('newEmailsList');
        newList.innerHTML = '';

        if (this.newEmails.length === 0) {
            newList.innerHTML = '<tr><td class="text-center py-3">Không có email mới nào</td></tr>';
            document.getElementById('createAccountsBtn').disabled = true;
        } else {
            this.newEmails.forEach(email => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${email}</td>`;
                newList.appendChild(row);
            });
            document.getElementById('createAccountsBtn').disabled = false;
        }
    }

    async createBulkAccounts() {
        try {
            if (this.newEmails.length === 0) {
                this.showToast('warning', 'Không có email mới để tạo tài khoản');
                return;
            }

            const position = document.getElementById('bulkPositionSelect').value;
            this.showToast('info', 'Đang tạo tài khoản...');

            const result = await callApi(`/users/bulk-create`,'POST', {
                emails: this.newEmails,
                position: position
            });


            if (!result.status) {
                this.showToast('error', result.message || 'Không thể tạo tài khoản');
                return;
            }

            // Update lists after creating accounts
            this.existingEmails = [...this.existingEmails, ...result.data.createdUsers];
            this.newEmails = [];

            // Update display
            this.displayResults();

            this.showToast('success', `Đã tạo ${result.data.createdUsers.length} tài khoản thành công`);
        } catch (error) {
            console.error("Error creating accounts:", error);
            this.showToast('error', 'Lỗi khi tạo tài khoản');
        }
    }

    async addAllToWhitelist() {
        try {
            if (this.allEmails.length === 0) {
                this.showToast('warning', 'Không có email nào để thêm vào danh sách');
                return;
            }

            this.showToast('info', 'Đang thêm vào danh sách truy cập...');

            const users = this.allEmails.map(email => ({ email }));

            const result = await callApi(`/forms/${this.formId}/whitelist`,'POST', {users});

            if (!result.status) {
                this.showToast('error', result.message || 'Không thể thêm vào danh sách truy cập');
                return;
            }

            this.showToast('success', `Đã thêm ${result['data']} email vào danh sách truy cập`);

            // Close this modal
            bootstrap.Modal.getInstance(document.getElementById('importExcelModal')).hide();

            // Return to form settings modal and refresh data
            if (this.parentModal === 'formSettingsModal') {
                const settingsModal = document.getElementById('formSettingsModal');
                if (settingsModal) {
                    const instance = settingsModal.__settingsInstance;
                    if (instance && typeof instance.loadUsersAndWhitelist === 'function') {
                        await instance.loadAvailableUsers(this.formId);
                        await instance.loadUsersAndWhitelist(this.formId);
                    }
                }
            }
        } catch (error) {
            console.error("Error adding to whitelist:", error);
            this.showToast('error', 'Lỗi khi thêm vào danh sách truy cập');
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
            const positionSelect = document.getElementById('bulkPositionSelect');

            // Clear existing options
            positionSelect.innerHTML = '';

            console.log(result.data);
            // Add positions to dropdown
            result.data.forEach(position => {
                const option = document.createElement('option');
                option.value = position.PositionID;
                option.textContent = position.PositionName;
                positionSelect.appendChild(option);
            });
            // Select first position as default if available
            if (result.data.length > 0) {
                positionSelect.value = result.data[0].PositionID;
            }
        } catch (error) {
            console.error("Error loading positions:", error);
            this.showToast('error', 'Không thể tải danh sách vị trí');
        }
    }

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
}