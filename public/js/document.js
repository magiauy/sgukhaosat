import PaginationComponent from "./component/pagination.js";
import {callApi} from "./apiService.js";

let currentOffset = 0;
let itemsPerPage = 5;
let editingDocumentId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadDocuments(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadDocuments(offset, limit);
    }
})



async function initDocument() {
    await setupHandlers();
    await loadDocuments();

}
async function setupHandlers() {
    document.getElementById('documentAddBtn').addEventListener('click', loadDocumentAdd);
    document.getElementById('documentSearchBtn').addEventListener('click', loadFilteredDocuments);
    document.getElementById('documentDeleteBtn').addEventListener('click', deleteSelectedDocuments);
    document.getElementById('documentKeyword').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFilteredDocuments();
        }
    });
    document.addEventListener("DOMContentLoaded", function () {
        document.addEventListener('hide.bs.modal', function (event) {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        });
    });
}
async function renderDocument(mode, documentData = null) {
    let modalElement = document.getElementById('documentModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="documentModal" tabindex="-1" aria-labelledby="documentModalLabel">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalDocumentTitle">Thêm tài liệu</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <!-- Left: Document Info -->
                                <div class="col-md-4">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label for="documentTitle" class="form-label">Tên tài liệu</label>
                                                <input type="text" class="form-control" id="documentTitle" placeholder="Nhập tên tài liệu">
                                            </div>
                                            <div class="mb-3">
                                                <label for="documentType" class="form-label">Loại tài liệu</label>
                                                <select class="form-select" id="documentType">
                                                    <option value="quy_trinh_cap_nhat_chuan_dau_ra">Quy trình cập nhật chuẩn đầu ra</option>
                                                    <option value="danh_sach_quy_trinh_cac_chu_ky">Danh sách các quy trình ở các chu kỳ</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label for="fileUrlInput" class="form-label">Đường dẫn Google Drive</label>
                                                <input type="text" class="form-control" id="fileUrlInput" placeholder="Dán link Google Drive tại đây">
                                            </div>
                                            <div class="mb-3">
                                                <label for="majorSelect" class="form-label">Ngành</label>
                                                <select class="form-select" id="majorSelect">
                                                    <option value="">-- Chọn ngành --</option>
                                                </select>
                                            </div>
                                            <div class="d-grid">
                                                <button type="button" class="btn btn-outline-primary" id="addFileBtn">
                                                    <i class="bi bi-plus-circle me-1"></i> Thêm file vào danh sách
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right: File Table -->
                                <div class="col-md-8">
                                    <div class="card h-100">
                                        <div class="card-header">
                                            Danh sách liên kết tài liệu đã thêm
                                        </div>
                                        <div class="card-body table-responsive p-0">
                                            <table class="table table-striped mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Link Google Drive</th>
                                                        <th>Ngành</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="fileListTableBody">
                                                    <tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="documentActionBtn">Lưu tài liệu</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('documentModal');

        // Thêm sự kiện khi bấm nút "Thêm file vào danh sách"
        document.getElementById('addFileBtn').addEventListener('click', () => {
            const fileUrl = document.getElementById('fileUrlInput').value.trim();
            const majorId = document.getElementById('majorSelect').value;
            const majorText = document.getElementById('majorSelect').selectedOptions[0]?.textContent.trim();

            if (!fileUrl || !majorId) {
                alert("Vui lòng nhập đường dẫn và chọn ngành.");
                return;
            }

            const tbody = document.getElementById('fileListTableBody');
            if (tbody.querySelector('tr td[colspan]')) tbody.innerHTML = '';

            const index = tbody.children.length + 1;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index}</td>
                <td><a href="${fileUrl}" target="_blank">${fileUrl}</a></td>
                <td>${majorText}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-remove-file">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            row.querySelector('.btn-remove-file').addEventListener('click', () => {
                row.remove();
                if (tbody.children.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>';
                }
            });

            tbody.appendChild(row);

            // Clear inputs
            document.getElementById('fileUrlInput').value = '';
            document.getElementById('majorSelect').selectedIndex = 0;
        });

        await loadMajorOptions(); // Tải danh sách ngành
    }

    const modalTitle = document.getElementById("modalDocumentTitle");
    const nameInput = document.getElementById("documentTitle");
    const typeSelect = document.getElementById("documentType");
    const actionBtn = document.getElementById("documentActionBtn");

    if (mode === "add") {
        nameInput.value = '';
        typeSelect.value = 'quy_trinh_cap_nhat_chuan_dau_ra';
        modalTitle.textContent = "Thêm tài liệu";
        actionBtn.textContent = "Lưu";
        actionBtn.onclick = () => addDocument(); // bạn cần cập nhật hàm này để xử lý danh sách file
        document.getElementById('fileListTableBody').innerHTML = '<tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>';
    } else if (mode === "edit" && documentData) {
        nameInput.value = documentData.documentTitle || '';
        typeSelect.value = documentData.type || '';

        // Render file vào bảng nếu có
        const tbody = document.getElementById('fileListTableBody');
        tbody.innerHTML = ''; // xóa trống bảng trước

        if (documentData.files?.length > 0) {
            documentData.files.forEach((file, index) => {
                const row = document.createElement('tr');
                const majorText = document.querySelector(`#majorSelect option[value="${file.id_major}"]`)?.textContent || 'Không xác định';

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><a href="${file.path_folder_url}" target="_blank">${file.path_folder_url}</a></td>
                    <td>${majorText}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-remove-file">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

                row.querySelector('.btn-remove-file').addEventListener('click', () => {
                    row.remove();
                    if (tbody.children.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>';
                    }
                });

                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>';
        }

        actionBtn.textContent = "Lưu thay đổi";
        actionBtn.onclick = () => updateDocument();
    }


    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });
    modalElement.setAttribute('aria-hidden', 'false');
    modal.show();
}

async function loadMajorOptions() {
    const majorSelect = document.getElementById('majorSelect');
    try {
        const data = await callApi('/major');

        (data?.data || []).forEach(major => {
            const opt = document.createElement('option');
            opt.value = major.MajorID;
            opt.textContent = major.MajorName;
            majorSelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Không tải được danh sách ngành:", error);
    }
}


//Thêm tài liệu 
async function loadDocumentAdd() {
    await renderDocument("add");
}
async function addDocument() {
    const documentTitle = document.getElementById('documentTitle').value.trim();
    const documentType = document.getElementById('documentType').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('documentToast'));

    if (!documentTitle || !documentType) {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        showToast(false);
        return;
    }
    let documentID;
    try {
        const docResult = await callApi('/document', 'POST', {
            DocumentTitle: documentTitle,
            type: documentType
        });

        if (!docResult.status) {
            toastMessage.innerText = docResult.message || 'Không thể tạo tài liệu';
            showToast(false);
            return;
        }

        documentID = docResult.data.DocumentID;
    } catch (error) {
        toastMessage.innerText = 'Lỗi khi tạo tài liệu: ' + error.message;
        showToast(false);
        return;
    }

    // 2. Gửi files (nếu có)
    const rows = document.querySelectorAll('#fileListTableBody tr');
    const files = [];

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;

        const fileUrl = cells[1]?.querySelector('a')?.href;
        const major = cells[2]?.innerText.trim();
        const option = Array.from(document.querySelectorAll('#majorSelect option'))
                            .find(opt => opt.textContent.trim() === major);
        const id_major = option?.value || null;

        if (fileUrl && id_major) {
            files.push({ path_folder_url: fileUrl, id_major, id_Doc: documentID });
        }
    }

    if (files.length > 0) {
        try {
            const fileResult = await callApi('/file', 'POST', { files });

            if (!fileResult.status) {
                toastMessage.innerText = fileResult.message || 'Tạo file thất bại';
                showToast(false);
                return;
            }
        } catch (error) {
            console.error("Lỗi khi fetch file:", error);
            toastMessage.innerText = 'Lỗi khi tạo file: ' + error.message;
            showToast(false);
            return;
        }
    }


    toastMessage.innerText = 'Tạo tài liệu thành công';
    showToast(true);

    // Reset form
    document.getElementById('documentTitle').value = '';
    document.getElementById('documentType').selectedIndex = 0;
    document.getElementById('fileListTableBody').innerHTML = `
        <tr><td colspan="4" class="text-muted text-center">Chưa có liên kết nào</td></tr>
    `;
    await loadDocuments(currentOffset, itemsPerPage);

    function showToast(success) {
        const toast = document.getElementById('documentToast');
        toast.classList.remove('text-bg-success', 'text-bg-danger');
        toast.classList.add(success ? 'text-bg-success' : 'text-bg-danger');
        toastElement.show();
    }
}



//Sửa tài liệu
async function loadDocumentEdit(id) {
    editingDocumentId = id;

    const docRes = await callApi(`/document/${id}`);
    const documentData = docRes.data;

    const fileRes = await callApi(`/file?id_Doc=${id}`);
    const files = fileRes.data || [];

    await renderDocument("edit", {
        documentTitle: documentData.DocumentTitle,
        type: documentData.type,
        files
    });
}


async function updateDocument() {
    const documentTitle = document.getElementById('documentTitle').value.trim();
    const documentType = document.getElementById('documentType').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('documentToast'));

    if (!documentTitle) {
        toastMessage.innerText = 'Vui lòng nhập tên tài liệu';
        toastMessage.classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        // 1. Cập nhật tài liệu
        const result = await callApi(`/document/${editingDocumentId}`, 'PUT', {
            DocumentTitle: documentTitle,
            type: documentType
        });

        if (!result.status) {
            toastMessage.innerText = result.message || 'Cập nhật thất bại';
            toastMessage.classList.add('text-bg-danger');
            toastElement.show();
            return;
        }

        // 2. Xóa tất cả các file cũ (soft-delete)
        await callApi(`/file/${editingDocumentId}`, 'DELETE');


        // 3. Gửi danh sách file mới
        const rows = document.querySelectorAll('#fileListTableBody tr');
        const files = [];

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) continue;

            const fileUrl = cells[1]?.querySelector('a')?.href;
            const major = cells[2]?.innerText.trim();
            const option = Array.from(document.querySelectorAll('#majorSelect option'))
                .find(opt => opt.textContent.trim() === major);
            const id_major = option?.value || null;

            if (fileUrl && id_major) {
                files.push({
                    path_folder_url: fileUrl,
                    id_major: id_major,
                    id_Doc: editingDocumentId
                });
            }
        }

        if (files.length > 0) {
            const fileResult = await callApi('/file', 'POST', { files });


            if (!fileResult.ok || !fileResult.status) {
                toastMessage.innerText = fileResult.message || 'Cập nhật file thất bại';
                toastMessage.classList.add('text-bg-danger');
                toastElement.show();
                return;
            }
        }

        toastMessage.innerText = 'Cập nhật tài liệu thành công';
        toastMessage.classList.remove('text-bg-danger');
        toastMessage.classList.add('text-bg-success');
        toastElement.show();
        await loadDocuments(currentOffset, itemsPerPage);

    } catch (error) {
        toastMessage.innerText = 'Lỗi: ' + error.message;
        toastMessage.classList.add('text-bg-danger');
        toastElement.show();
    }
}


//Tìm kiếm tài liệu
async function loadFilteredDocuments() {
    const searchKeyword = document.getElementById('documentKeyword').value.trim();
    // document.getElementById('documentKeyword').value = '';
    await loadDocuments(0, itemsPerPage, searchKeyword,true);
}


// Main loadDocuments function - now orchestrates separate rendering functions
async function loadDocuments(offset = 0,limit = 10, keyword = '', isSearch = false) {
    try {
        const queryParams = new URLSearchParams({
            offset: offset,
            limit: limit,
            search: keyword || '',
        });

        const url = `/document/search?${queryParams.toString()}`;
        const result = await callApi(url);

        if (isSearch) {
            //Thông báo
            const toastMessage = document.getElementById('toastMessage');
            const toastElement = new bootstrap.Toast(document.getElementById('documentToast'));
            if (result.data['totalCount'] === 0) {
                toastMessage.innerText = 'Không tìm thấy tài liệu nào';
                document.getElementById('documentToast').classList.remove('text-bg-success');
                document.getElementById('documentToast').classList.add('text-bg-danger');
            } else {
                toastMessage.innerText = `Tìm thấy ${result.data['totalCount']} tài liệu`;
                document.getElementById('documentToast').classList.remove('text-bg-danger');
                document.getElementById('documentToast').classList.add('text-bg-success');
            }
            toastElement.show();
        }

        // Update the count display
        // document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

        // Call separated functions for rendering table and pagination
        renderDocumentTable(result.data['document'] || []);
        pagination.render({
            currentPage: result.data['currentPage'],
            totalPages: result.data['totalPages'],
            limit: limit,
            totalItems: result.data['totalCount']
        })
        currentOffset = offset;
        itemsPerPage = limit;
        // Reset select all checkbox
        document.getElementById('selectAll').checked = false;
    } catch (error) {
        console.error('Lỗi tải tài liệu:', error);
    }
}

// Separated function for rendering the documents table
function renderDocumentTable(documents) {
    const tbody = document.getElementById('documentTableBody');
    tbody.innerHTML = '';
    let i=0;

    if (documents && documents.length > 0) {
        documents.forEach((doc) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input documentCheckbox" value="${doc.DocumentID}">
                    </div>
                </td>
                <td>${++i}</td>

                <td class="idDocument">${doc.DocumentID}</td>
                <td>${doc.DocumentTitle}</td>
                <td>${doc.type}</td>
                <td>${doc.createAt}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-primary" id="editDocumentBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                                        <button class="btn btn-outline-danger" id="deleteDocumentBtn">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        logicCheckbox()
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }
}

const selectedDocumentIDs = new Set();
function logicCheckbox() {
    selectedDocumentIDs.clear();

    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('documentDeleteBtn');

    // Function to update count and button visibility
    function updateSelectedCount() {
        const documentCheckbox = document.querySelectorAll('.documentCheckbox');
        const checkedBoxes = document.querySelectorAll('.documentCheckbox:checked');
        const selectAllCheckbox = document.getElementById('selectAll');

        selectedCountElem.textContent = checkedBoxes.length;

        // Show/hide bulk delete button
        if (checkedBoxes.length > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }

        // Update "select all" checkbox state
        if (checkedBoxes.length === documentCheckbox.length && documentCheckbox.length > 0) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // Add event listener for "select all"
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.onchange = function () {
        const documentCheckbox = document.querySelectorAll('.documentCheckbox');
        documentCheckbox.forEach(checkbox => {
            checkbox.checked = this.checked;
            const id = checkbox.getAttribute('value');
            if (this.checked) {
                selectedDocumentIDs.add(id);
            } else {
                selectedDocumentIDs.delete(id);
            }
        });
        updateSelectedCount();
    };

    // Add listener for each individual checkbox
    const documentCheckbox = document.querySelectorAll('.documentCheckbox');
    documentCheckbox.forEach(checkbox => {
        checkbox.onchange = function () {
            const id = this.getAttribute('value');
            if (this.checked) {
                selectedDocumentIDs.add(id);
            } else {
                selectedDocumentIDs.delete(id);
            }
            updateSelectedCount();
        };
    });

    // Initialize checkbox state
    updateSelectedCount();

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('#table-document .btn').forEach(button => {
        button.addEventListener('click', async function () {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('.idDocument');
            if (firstTd) {
                const action = this.id;
                const id = firstTd.textContent.trim();
                if (action === "editDocumentBtn") {
                    await loadDocumentEdit(id);
                } else if (action === "deleteDocumentBtn") {
                    await handleDeleteDocument(id);
                }
            }
        });
    });
}

//Xóa tài liệu
async function deleteDocument(id) {
    try {
        const result = await callApi(`/document/${id}`, 'DELETE');

        if (result.status) {
            return { success: true, message: 'Xóa tài liệu thành công' };
        } else {
            return { success: false, message: result?.message || 'Xóa tài liệu thất bại' };
        }
    } catch (error) {
        return { success: false, message: 'Lỗi: ' + error.message };
    }
}

async function handleDeleteDocument(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa tài liệu này?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        
        
        await callApi(`/file/${id}`, 'DELETE');

        const res = await deleteDocument(id);


        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: res.success ? 'Thành công' : 'Thất bại',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
        });

        if (res.success) {
            loadDocuments(currentOffset, itemsPerPage);
        }
    }
}


async function deleteSelectedDocuments() {
    const selected = Array.from(document.querySelectorAll('.documentCheckbox:checked'))
                          .map(cb => cb.value);

    if (selected.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn tài liệu nào',
            text: 'Vui lòng chọn ít nhất một tài liệu để xóa.',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${selected.length} tài liệu?`,
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        let successCount = 0;
        let failedCount = 0;
        let failedMessages = [];


        for (const id of selected) {
            try {
                await callApi(`/file/${id}`, 'DELETE');

                const res = await deleteDocument(id);
                if (res.success) {
                    successCount++;
                } else {
                    failedCount++;
                    failedMessages.push(`ID ${id}: ${res.message}`);
                }
            } catch (error) {
                failedCount++;
                failedMessages.push(`ID ${id}: Lỗi khi xóa - ${error.message}`);
            }
        }



        let summary = `✅ Đã xóa: ${successCount}\n❌ Lỗi: ${failedCount}`;
        if (failedCount > 0) {
            summary += `\n\nChi tiết lỗi:\n` + failedMessages.join('\n');
        }

        Swal.fire({
            icon: failedCount === 0 ? 'success' : 'warning',
            title: 'Kết quả xóa',
            html: `<pre style="text-align:left">${summary}</pre>`,
            confirmButtonText: 'Đóng'
        });

        loadDocuments(currentOffset, itemsPerPage);
    }
}

export {initDocument};