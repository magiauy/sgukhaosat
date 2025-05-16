import {callApi} from "../apiService.js";
import {cleanupModalBackdrops} from "../formsManager.js";

export default class EmailSendModal {
    constructor(config) {
        this.config = config;
        this.modalId = 'emailSendModal';
        this.formId = null;
        this.parentModal = null;
        this.initialized = false;
        this.queuedEmails = [];
        this.sentEmails = [];
        this.whitelistUsers = [];
        this.activeTab = 'compose'; // compose, queue, sent
        this.sendingInterval = null;
    }

    async open(formId, parentModal,page) {
        this.formId = formId;
        this.parentModal = parentModal;

        // Create modal if it doesn't exist or remove existing one
        let modalElement = document.getElementById(this.modalId);
        if (modalElement) {
            // If modal exists, dispose the old instance first
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.dispose();
            }
            modalElement.remove();
        }

        // Create new modal
        document.body.insertAdjacentHTML('beforeend', this.getHTML());
        modalElement = document.getElementById(this.modalId);

        // Store form info
        modalElement.dataset.formId = formId;

        // Setup handlers
        this.setupHandlers();

        // Load initial data for the form
        await this.loadFormEmailData(formId);

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

            // Initialize active tab
            this.switchTab('compose');
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
                                parentModalElement.__settingsInstance.form,
                                page
                            );
                        }
                    }
                }, 50);
            }
        }, { once: true });

        this.initialized = true;
    }
    async loadFormEmailData(formId) {
        try {
            // Load whitelist users
            const whitelistData = await callApi(`/forms/${formId}/whitelist`);
            this.whitelistUsers = whitelistData.status ? whitelistData.data : [];

            // Load queued emails
            const queuedData = await callApi(`/forms/${formId}/email-queue?status=pending`);
            this.queuedEmails = queuedData.status ? queuedData.data : [];

            // Load sent emails
            const sentData = await callApi(`/forms/${formId}/email-queue?status=sent`);
            this.sentEmails = sentData.status ? sentData.data : [];

            // Update UI components
            this.updateRecipientCount();
            this.updateQueueTable();
            this.updateSentTable();

        } catch (error) {
            console.error("Error loading email data:", error);
            this.showToast('error', 'Lỗi khi tải dữ liệu email');
        }
    }

    updateRecipientCount() {
        const totalUsers = this.whitelistUsers.length;
        const queuedCount = this.queuedEmails.length;
        const notQueuedCount = totalUsers - queuedCount;

        document.getElementById('totalRecipientCount').textContent = totalUsers;
        document.getElementById('queuedRecipientCount').textContent = queuedCount;
        document.getElementById('notQueuedRecipientCount').textContent = notQueuedCount;
    }

    updateQueueTable() {
        const tableBody = document.getElementById('queueTableBody');
        tableBody.innerHTML = '';

        if (this.queuedEmails.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3">Chưa có email nào trong hàng đợi</td>
                </tr>
            `;
            return;
        }

        this.queuedEmails.forEach((email, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${email.fullName || ''}</td>
                <td>${email.email}</td>
                <td>
                    <span class="badge bg-secondary">Đang chờ</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateSentTable() {
        const tableBody = document.getElementById('sentTableBody');
        tableBody.innerHTML = '';

        if (this.sentEmails.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">Chưa có email nào được gửi</td>
                </tr>
            `;
            return;
        }

        this.sentEmails.forEach((email, index) => {
            const statusBadge = email.status === 'sent'
                ? '<span class="badge bg-success">Thành công</span>'
                : '<span class="badge bg-danger">Thất bại</span>';

            const resendButton = email.status === 'failed'
                ? `<button class="btn btn-sm btn-warning resend-email" data-id="${email.id}">Gửi lại</button>`
                : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${email.fullName || ''}</td>
                <td>${email.email}</td>
                <td>${statusBadge}</td>
                <td>${resendButton}</td>
            `;
            tableBody.appendChild(row);
        });

        // Add resend event handlers
        document.querySelectorAll('.resend-email').forEach(btn => {
            btn.addEventListener('click', (e) => this.resendEmail(e.target.dataset.id));
        });
    }
    getHTML() {
        return `
        <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Quản lý gửi email thông báo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3">
                            <li class="nav-item">
                                <a class="nav-link active" id="compose-tab" href="#" data-tab="compose">
                                    <i class="bi bi-pencil"></i> Soạn email
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="queue-tab" href="#" data-tab="queue">
                                    <i class="bi bi-hourglass"></i> Hàng đợi
                                    <span class="badge bg-secondary" id="queueBadge">0</span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="sent-tab" href="#" data-tab="sent">
                                    <i class="bi bi-check-circle"></i> Đã gửi
                                    <span class="badge bg-secondary" id="sentBadge">0</span>
                                </a>
                            </li>
                        </ul>
                        
                        <!-- Tab content -->
                        <div id="compose-content" class="tab-content">
                            <div class="mb-3">
                                <div class="alert alert-info">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <div>
                                            Biểu mẫu: <span class="fw-bold" id="emailFormName"></span>
                                        </div>
                                    </div>
                                    <div class="mt-2 small">
                                        <div>Tổng số người nhận: <span class="fw-bold" id="totalRecipientCount">0</span></div>
                                        <div>Số email trong hàng đợi: <span class="fw-bold" id="queuedRecipientCount">0</span></div>
                                        <div>Số email chưa thêm vào hàng đợi: <span class="fw-bold" id="notQueuedRecipientCount">0</span></div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <button type="button" class="btn btn-secondary" id="previewEmailBtn">
                                    <i class="bi bi-eye"></i> Xem trước email
                                </button>
                            </div>
                        </div>
                        
                        <div id="queue-content" class="tab-content d-none">
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="30%">Người nhận</th>
                                            <th width="50%">Email</th>
                                            <th width="15%">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody id="queueTableBody">
                                        <tr>
                                            <td colspan="4" class="text-center py-3">Đang tải...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                               <div>
                            </div>                           
                        </div>
                        
                        <div id="sent-content" class="tab-content d-none">
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="25%">Người nhận</th>
                                            <th width="40%">Email</th>
                                            <th width="15%">Trạng thái</th>
                                            <th width="15%">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sentTableBody">
                                        <tr>
                                            <td colspan="5" class="text-center py-3">Đang tải...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <!-- Compose tab buttons -->
                        <div id="compose-buttons" class="d-flex flex-wrap justify-content-between w-100">
                            <div>
                                <button type="button" class="btn btn-secondary" id="backToSettingsBtn">
                                    <i class="bi bi-arrow-left"></i> Quay lại
                                </button>
                            </div>
                            
                            <div>
                                <button type="button" class="btn btn-success" id="addToQueueBtn">
                                    <i class="bi bi-plus-circle"></i> Thêm vào hàng đợi
                                </button>
                            </div>
                        </div>
                        
                        <!-- Queue tab buttons -->
                        <div id="queue-buttons" class="d-none d-flex flex-wrap justify-content-between w-100">
                            <div>
                                <button type="button" class="btn btn-secondary" id="backToComposeBtn">
                                    <i class="bi bi-arrow-left"></i> Trở lại soạn thảo
                                </button>
                                <button type="button" class="btn btn-danger" id="clearQueueBtn">
                                    <i class="bi bi-trash"></i> Xóa hàng đợi
                                </button>
                            </div>
                            
                            <div> 
                                <button type="button" class="btn btn-primary" id="autoSendEmailsBtn">
                                    <i class="bi bi-envelope"></i> Tự động gửi email mỗi phút
                                </button>
                                
                                <button type="button" class="btn btn-primary" id="sendEmailsBtn">
                                    <i class="bi bi-envelope"></i> Tiến hành gửi email
                                </button>
                            </div>
                        </div>
                        
                        <!-- Sent tab buttons -->
                        <div id="sent-buttons" class="d-none d-flex flex-wrap justify-content-between w-100">
                            <div>
                                <button type="button" class="btn btn-secondary" id="backToQueueFromSentBtn">
                                    <i class="bi bi-arrow-left"></i> Trở lại hàng đợi
                                </button>
                                <button type="button" class="btn btn-warning" id="resendFailedBtn">
                                    <i class="bi bi-arrow-repeat"></i> Gửi lại email thất bại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    setupHandlers() {
        // Tab switching
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            // Find the element with data-tab attribute (either the clicked element or its ancestor)
            const tabElement = e.target.closest('[data-tab]');
            if (tabElement) {
                this.switchTab(tabElement.getAttribute('data-tab'));
            } else {
                console.error('Could not find element with data-tab attribute');
            }
        });
    });


        // Navigation buttons
        document.getElementById('backToSettingsBtn').addEventListener('click', () => {
            this.backToSettings();
        });

        document.getElementById('backToComposeBtn').addEventListener('click', () => {
            this.switchTab('compose');
        });

        document.getElementById('backToQueueFromSentBtn').addEventListener('click', () => {
            this.switchTab('queue');
        });

        // Action buttons
        document.getElementById('previewEmailBtn').addEventListener('click', () => {
            this.previewEmail();
        });

        document.getElementById('addToQueueBtn').addEventListener('click', async () => {
            await this.addToQueue();
        });

        document.getElementById('clearQueueBtn').addEventListener('click', async () => {
            await this.clearQueue();
        });

        document.getElementById('sendEmailsBtn').addEventListener('click', async () => {
            await this.sendEmails();
        });

        document.getElementById('resendFailedBtn').addEventListener('click', async () => {
            await this.resendFailedEmails();
        });

        document.getElementById('autoSendEmailsBtn').addEventListener('click', async () => {
            const formId = document.getElementById(this.modalId).dataset.formId;
            const btn = document.getElementById('autoSendEmailsBtn');

            // If already running, stop it
            if (btn.getAttribute('data-status') === 'running') {
                this.stopAutoSend();
                return;
            }

            // Otherwise show confirmation and start
            const result = await Swal.fire({
                title: 'Tự động gửi email',
                text: `Bạn có chắc chắn muốn tự động gửi email mỗi phút?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Bật tự động gửi',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            this.autoSendEmails(formId);
        });

    }

     switchTab(tabName) {
         try {
             // First check if elements exist before manipulating them
             const tabContent = document.getElementById(`${tabName}-content`);
             const tabButton = document.getElementById(`${tabName}-tab`);
             const tabButtons = document.getElementById(`${tabName}-buttons`);

             if (!tabContent || !tabButton || !tabButtons) {
                 console.error(`Required elements for tab '${tabName}' not found in DOM`);
                 return;
             }

             // Hide all content
             document.querySelectorAll('.tab-content').forEach(content => {
                 content.classList.add('d-none');
             });

             // Show selected content
             tabContent.classList.remove('d-none');

             // Hide all button groups
             ['compose', 'queue', 'sent'].forEach(tab => {
                 const btnGroup = document.getElementById(`${tab}-buttons`);
                 if (btnGroup) btnGroup.classList.add('d-none');
             });

             // Show appropriate button group
             tabButtons.classList.remove('d-none');

             // Update active tab
             document.querySelectorAll('.nav-link').forEach(tab => {
                 if (tab) tab.classList.remove('active');
             });

             tabButton.classList.add('active');

             // Update badges - check if they exist first
             const queueBadge = document.getElementById('queueBadge');
             const sentBadge = document.getElementById('sentBadge');

             if (queueBadge) queueBadge.textContent = this.queuedEmails.length || 0;
             if (sentBadge) sentBadge.textContent = this.sentEmails.length || 0;

             this.activeTab = tabName;
         } catch (error) {
             console.error("Error switching tabs:", error);
             // Log more information to help with debugging
             console.log("Current tabName:", tabName);
             console.log("Elements:", {
                 content: document.getElementById(`${tabName}-content`),
                 tab: document.getElementById(`${tabName}-tab`),
                 buttons: document.getElementById(`${tabName}-buttons`)
             });
         }
     }

    async previewEmail() {
        const formId = document.getElementById(this.modalId).dataset.formId;
        const formName = document.getElementById(this.modalId).dataset.formName;

        // Create sample data for preview
        const sampleData = {
            name: "Nguyễn Văn A",
            position: "Giảng viên",
            FName: formName,
            major_name: "Công nghệ thông tin",
            period_name: "2023-2024",
            email: "example@email.com",
            password: "example@SGU2024",
            login_link: "",
            is_first_login: true
        };

        // Generate email content based on your template
        const previewHTML = `
        <!DOCTYPE html>
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Lời Mời Khảo Sát</title>
            <style type='text/css'>
                body, table, td, a { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333333 !important; 
                }
                
                .button {
                    display: inline-block !important;
                    width: auto !important;
                    padding: 10px 20px !important;
                    background-color: #FF0000 !important; 
                    color: #FFFFFF !important; 
                    text-decoration: none !important;
                    border-radius: 5px !important;
                    font-weight: bold !important;
                    text-transform: uppercase !important;
                    text-align: center !important;
                }
                
                .account-info {
                    background-color: #f9f9f9 !important;
                    border: 1px solid #e0e0e0 !important;
                    padding: 15px !important;
                    margin-top: 20px !important;
                    border-radius: 5px !important;
                }
            </style>
        </head>
        <body style='margin: 0; padding: 0; background-color: #F4F4F4;'>
            <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
                <tr>
                    <td align='center' style='padding: 20px 0;'>
                        <table class='container' role='presentation' border='0' cellpadding='0' cellspacing='0' width='600'>
                            <tr>
                                <td>
                                    <div class='header' style='background-color: #f4f4f4; padding: 10px; text-align: center;'>
                                        <h1 style='color: #333333; margin: 0;'>Lời Mời Khảo Sát</h1>
                                    </div>
                                    
                                    <div class='content' style='padding: 20px; background-color: #FFFFFF;'>
                                        <h2 style='color: #333333; margin-top: 0;'>Kính gửi ${sampleData.name},</h2>
                                        
                                        <p style='color: #333333; margin-bottom: 15px;'>Chúng tôi trân trọng kính mời Quý ${sampleData.position} tham gia đóng góp ý kiến thông qua một cuộc khảo sát quan trọng:</p>
                                        
                                        <p style='color: #333333; margin-bottom: 15px;'>
                                            <strong>Thông tin khảo sát:</strong><br>
                                            <strong>Đối tượng: ${sampleData.FName}</strong><br>
                                            <strong>Ngành: ${sampleData.major_name}</strong><br>
                                            <strong>Chu Kỳ: ${sampleData.period_name}</strong>
                                        </p>
                                        
                                        <p style='color: #333333; margin-bottom: 15px;'>Sự tham gia của Quý ${sampleData.position} là vô cùng quý báu. Những phản hồi của bạn sẽ giúp chúng tôi thu thập thông tin cần thiết để đánh giá và không ngừng nâng cao chất lượng.</p>
                                        
                                        <p style='color: #333333; margin-bottom: 15px;'>Chúng tôi chân thành cảm ơn sự hợp tác của bạn.</p>
                                        
                                        <table role='presentation' cellspacing='0' cellpadding='0' style='margin: 15px 0;'>
                                            <tr>
                                                <td>
                                                    <a class='button' style='display: inline-block; padding: 10px 20px; background-color: #FF0000; color: #FFFFFF !important; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; cursor:pointer'>Bắt Đầu Khảo Sát</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <div class='account-info' style='background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-top: 20px; border-radius: 5px;'>
                                            <h3 style='color: #333333; margin-top: 0;'>Thông Tin Tài Khoản</h3>
                                            <p style='color: #333333; margin: 10px 0;'><strong>Email đăng nhập:</strong> ${sampleData.email}</p>
                                            <p style='color: #333333; margin: 10px 0;'><strong>Mật khẩu:</strong> ${sampleData.password}</p>
                                            <p style='color: #333333; margin: 10px 0; font-style: italic;'>Lưu ý: Vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                                        </div>
                                        
                                        <p style='color: #333333; margin-top: 20px;'>Trân trọng,<br>Ban Quản Trị</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;

        Swal.fire({
            title: 'Xem trước email',
            html: `
                <div class="email-preview" style="max-height: 70vh; overflow-y: auto;">
                    <div class="email-subject p-2 bg-light rounded mb-2">
                        <strong>Tiêu đề:</strong> Lời mời tham gia khảo sát - ${formName}
                    </div>
                    <iframe srcdoc="${previewHTML.replace(/"/g, '&quot;')}" width="100%" height="500px" style="border: 1px solid #ddd; border-radius: 4px;"></iframe>
                </div>
            `,
            width: '800px',
            confirmButtonText: 'Đóng',
            customClass: {
                popup: 'swal-large-popup'
            }
        });
    }
    renderEmailContent(subject, content, data) {
        // Replace placeholders with actual data
        let parsedContent = content;
        for (const [key, value] of Object.entries(data)) {
            parsedContent = parsedContent.replace(new RegExp(`{${key}}`, 'g'), value);
        }

        // Convert newlines to <br> for HTML display
        parsedContent = parsedContent.replace(/\n/g, '<br>');

        return parsedContent;
    }

    async addToQueue() {
        try {
            const formId = document.getElementById(this.modalId).dataset.formId;

            const notQueuedCount = parseInt(document.getElementById('notQueuedRecipientCount').textContent);

            if (notQueuedCount === 0) {
                this.showToast('warning', 'Tất cả người dùng đã được thêm vào hàng đợi');
                return;
            }

            const result = await Swal.fire({
                title: 'Thêm vào hàng đợi',
                text: `Thêm ${notQueuedCount} email vào hàng đợi gửi?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Thêm vào hàng đợi',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            this.showToast('info', 'Đang thêm email vào hàng đợi...', false);

            const response = await callApi(`/forms/${formId}/add-to-queue`, 'POST');

            if (!response.status) {
                this.showToast('error', response.message || 'Không thể thêm email vào hàng đợi');
                return;
            }

            // Reload data to get updated queue
            await this.loadFormEmailData(formId);

            this.showToast('success', `Đã thêm ${response.data?.addedCount || 0} email vào hàng đợi thành công`);

            // Switch to queue tab
            this.switchTab('queue');
        } catch (error) {
            console.error("Error adding to queue:", error);
            this.showToast('error', 'Lỗi khi thêm email vào hàng đợi');
        }
    }

    async clearQueue() {
        try {
            const formId = document.getElementById(this.modalId).dataset.formId;

            if (this.queuedEmails.length === 0) {
                this.showToast('warning', 'Hàng đợi đã trống');
                return;
            }

            const result = await Swal.fire({
                title: 'Xóa hàng đợi',
                text: `Bạn có chắc chắn muốn xóa ${this.queuedEmails.length} email khỏi hàng đợi?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa hàng đợi',
                confirmButtonColor: '#dc3545',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            const response = await callApi(`/forms/${formId}/clear-queue`, 'POST');

            if (!response.status) {
                this.showToast('error', response.message || 'Không thể xóa hàng đợi');
                return;
            }

            // Reload data to get updated queue
            await this.loadFormEmailData(formId);

            this.showToast('success', 'Đã xóa hàng đợi thành công');
        } catch (error) {
            console.error("Error clearing queue:", error);
            this.showToast('error', 'Lỗi khi xóa hàng đợi');
        }
    }

    async sendEmails() {
        try {
            const formId = document.getElementById(this.modalId).dataset.formId;

            if (this.queuedEmails.length === 0) {
                this.showToast('warning', 'Không có email nào trong hàng đợi để gửi');
                return;
            }

            const result = await Swal.fire({
                title: 'Gửi email',
                text: `Bạn có chắc chắn muốn gửi ${this.queuedEmails.length} email?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Tiến hành gửi',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            // Show processing dialog
            const processingSwal = Swal.fire({
                title: 'Đang gửi email',
                html: `
                    <div class="mb-3">Đang xử lý <span id="processedCount">0</span>/${this.queuedEmails.length} email...</div>
                    <div class="progress" style="height: 25px;">
                        <div id="emailProgress" class="progress-bar progress-bar-striped progress-bar-animated" 
                             style="width: 0%"></div>
                    </div>
                `,
                allowOutsideClick: false,
                showConfirmButton: false
            });

            // Start sending process
            const response = await callApi(`/forms/${formId}/send-emails`, 'POST',{
                'formId': formId,
                'quantity': 1
            });

            if (!response.status) {
                Swal.close();
                this.showToast('error', response.message || 'Không thể gửi email');
                return;
            }

            // Process completed
            Swal.fire({
                title: 'Gửi email hoàn tất',
                html: `
                    <div class="d-flex justify-content-between mb-2">
                        <span>Tổng số email:</span>
                        <span>${response.data?.total || 0}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Email thành công:</span>
                        <span class="text-success">${response.data?.successful || 0}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Email thất bại:</span>
                        <span class="text-danger">${response.data?.failed || 0}</span>
                    </div>
                `,
                icon: 'success'
            });

            // Reload data
            await this.loadFormEmailData(formId);

            // Switch to sent tab
            this.switchTab('sent');
        } catch (error) {
            console.error("Error sending emails:", error);
            Swal.close();
            this.showToast('error', 'Lỗi khi gửi email');
        }
    }

    async resendFailedEmails() {
        try {
            const formId = document.getElementById(this.modalId).dataset.formId;
            const failedEmails = this.sentEmails.filter(email => email.status === 'failed');

            if (failedEmails.length === 0) {
                this.showToast('info', 'Không có email thất bại cần gửi lại');
                return;
            }

            const result = await Swal.fire({
                title: 'Gửi lại email thất bại',
                text: `Bạn có chắc chắn muốn gửi lại ${failedEmails.length} email thất bại?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Gửi lại',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            const loadingToast = this.showToast('info', 'Đang gửi lại email...', false);

            const response = await callApi(`/forms/${formId}/resend-failed`, 'POST');

            loadingToast.close();

            if (!response.status) {
                this.showToast('error', response.message || 'Không thể gửi lại email');
                return;
            }

            // Reload data
            await this.loadFormEmailData(formId);

            this.showToast('success', `Đã gửi lại ${response.data?.resentCount || 0} email thành công`);
        } catch (error) {
            console.error("Error resending emails:", error);
            this.showToast('error', 'Lỗi khi gửi lại email');
        }
    }

    async resendEmail(emailId) {
        try {
            const formId = document.getElementById(this.modalId).dataset.formId;

            const loadingToast = this.showToast('info', 'Đang gửi lại email...', false);

            const response = await callApi(`/forms/${formId}/resend-email/${emailId}`, 'POST');

            loadingToast.close();

            if (!response.status) {
                this.showToast('error', response.message || 'Không thể gửi lại email');
                return;
            }

            // Reload data
            await this.loadFormEmailData(formId);

            this.showToast('success', 'Đã gửi lại email thành công');
        } catch (error) {
            console.error("Error resending email:", error);
            this.showToast('error', 'Lỗi khi gửi lại email');
        }
    }

    backToSettings() {
        // Hide email modal
        const emailModal = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
        emailModal.hide();

        // Clean up backdrops
        // cleanupModalBackdrops();

        // Show settings modal again
        setTimeout(() => {
            const settingsModal = new bootstrap.Modal(document.getElementById('formSettingsModal'));
            // cleanupModalBackdrops();
            settingsModal.show();
        }, 100);
    }

    showToast(type, message) {
        Swal.fire({
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-end',
            customClass: {
                toast: 'toast-custom'
            }
        });
    }

   async autoSendEmails(formId) {
    // If already running, stop it
    if (this.sendingInterval) {
        this.stopAutoSend();
        return;
    }

    // Show initial toast
    this.showToast('info', 'Đã bắt đầu gửi email tự động mỗi 60 giây');

    // Update button text to indicate active status
    const autoSendBtn = document.getElementById('autoSendEmailsBtn');
    autoSendBtn.innerHTML = '<i class="bi bi-stop-circle"></i> Dừng tự động gửi';
    autoSendBtn.classList.remove('btn-primary');
    autoSendBtn.classList.add('btn-danger');

    // Instead of changing ID and adding a new listener, store original ID
    autoSendBtn.setAttribute('data-status', 'running');

    // Create countdown display
    if (!document.getElementById('countdownTimer')) {
        const queueContent = document.getElementById('queue-content');
        const countdownDiv = document.createElement('div');
        countdownDiv.className = 'mt-3 alert alert-info';
        countdownDiv.id = 'auto-send-countdown';
        countdownDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-clock-history me-2"></i>
                <div>Gửi email tiếp theo trong: <span id="countdownTimer">60</span> giây</div>
            </div>
        `;
        queueContent.appendChild(countdownDiv);
    }

    // Function to send emails
    const sendEmails = async () => {
        try {
            // First check if there are any emails in queue
            if (this.queuedEmails.length === 0) {
                this.showToast('info', 'Hàng đợi đã trống, dừng tự động gửi');
                this.stopAutoSend();
                return;
            }

            // Send a small batch of emails (1-5 emails per batch)
            const response = await callApi(`/forms/${formId}/send-emails`, 'POST', {
                'formId': formId,
                'quantity': 5
            });

            // Update UI with results
            if (response.status) {
                this.showToast('success', `Đã gửi ${response.data?.successful || 0} email thành công, ${response.data?.failed || 0} thất bại`);
            } else {
                this.showToast('error', response.message || 'Không thể gửi email');
            }

            // Reload data to refresh tables
            await this.loadFormEmailData(formId);

        } catch (error) {
            console.error("Error in auto sending emails:", error);
            this.showToast('error', 'Lỗi khi tự động gửi email');
        }
    };

    // Send first batch immediately
    sendEmails();

    // Set up countdown timer
    let countdown = 60;
    const updateCountdown = () => {
        const countdownElement = document.getElementById('countdownTimer');
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        countdown -= 1;
    };

    // Update countdown every second
    this.sendingInterval = setInterval(() => {
        updateCountdown();
        if (countdown < 0) {
            countdown = 60;
            sendEmails();
        }
    }, 1000);
}

// Define stopAutoSend as a class method instead of dynamically creating it
stopAutoSend() {
    if (this.sendingInterval) {
        clearInterval(this.sendingInterval);
        this.sendingInterval = null;

        // Reset button appearance
        const autoSendBtn = document.getElementById('autoSendEmailsBtn');
        if (autoSendBtn) {
            autoSendBtn.innerHTML = '<i class="bi bi-envelope"></i> Tự động gửi email mỗi phút';
            autoSendBtn.classList.remove('btn-danger');
            autoSendBtn.classList.add('btn-primary');
            autoSendBtn.removeAttribute('data-status');
        }

        // Remove countdown display
        const countdownDiv = document.getElementById('auto-send-countdown');
        if (countdownDiv) {
            countdownDiv.remove();
        }

        this.showToast('info', 'Đã dừng gửi email tự động');
    }
}

}