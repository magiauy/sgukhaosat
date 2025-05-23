import PaginationComponent from "./component/pagination.js";
import {callApi} from "./apiService.js";

let currentOffset = 0;
let itemsPerPage = 5;
let editingMajorId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadMajors(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadMajors(offset, limit);
    }
})



async function initMajor() {
    await setupHandlers();
    await loadMajors();

}
async function setupHandlers() {
    document.getElementById('majorAddBtn').addEventListener('click', loadMajorAdd);
    document.getElementById('majorSearchBtn').addEventListener('click', loadFilteredMajors);
    document.getElementById('majorDeleteBtn').addEventListener('click', deleteSelectedMajors);
    document.getElementById('majorKeyword').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFilteredMajors();
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


async function renderMajor(mode, majorData = null) {
    // Create modal if it doesn't exist yet
    let modalElement = document.getElementById('majorModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="majorModal" tabindex="-1" aria-labelledby="majorModalLabel">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="majorTitle">Thêm ngành</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3" id="majorIDGroup">
                                <label for="majorID" class="form-label">Mã ngành</label>
                                <input type="text" class="form-control" id="majorID" placeholder="Nhập mã ngành">
                            </div>
                            <div class="mb-3">
                                <label for="majorName" class="form-label">Tên ngành</label>
                                <input type="text" class="form-control" id="majorName" placeholder="Nhập tên ngành">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="majorActionBtn">Thêm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('majorModal');

        // Xử lý sự kiện khi modal được hiển thị
        modalElement.addEventListener('show.bs.modal', function() {
            // Đặt aria-hidden thành false TRƯỚC KHI modal được hiển thị
            this.setAttribute('aria-hidden', 'false');
        });

        // Xử lý khi modal đã được hiển thị hoàn toàn
        modalElement.addEventListener('shown.bs.modal', function() {
            // Đảm bảo aria-hidden vẫn là false sau khi hiển thị
            this.setAttribute('aria-hidden', 'false');

            // Tự động focus vào input đầu tiên
            const firstInput = this.querySelector('input:not([disabled])');
            if (firstInput) {
                firstInput.focus();
            }
        });

        // Xử lý khi modal đang bắt đầu đóng
        modalElement.addEventListener('hide.bs.modal', function() {
            // Chuyển focus ra khỏi các phần tử trong modal trước khi đóng
            document.activeElement.blur();
        });

        // Xử lý khi modal đã đóng hoàn toàn
        modalElement.addEventListener('hidden.bs.modal', function() {
            // Đặt lại aria-hidden="true" khi modal đã đóng hoàn toàn
            this.setAttribute('aria-hidden', 'true');
        });
    }

    // Configure modal based on mode
    const title = document.getElementById("majorTitle");
    const idGroup = document.getElementById("majorIDGroup");
    const nameInput = document.getElementById("majorName");
    const actionBtn = document.getElementById("majorActionBtn");

    if (mode === "add") {
        document.getElementById('majorID').value = '';
        nameInput.value = '';
        title.textContent = "Thêm ngành";
        idGroup.style.display = "block";
        actionBtn.textContent = "Thêm";
        actionBtn.onclick = () => addMajor();
    } else if (mode === "edit") {
        title.textContent = "Sửa ngành";
        idGroup.style.display = "none";
        actionBtn.textContent = "Lưu thay đổi";
        actionBtn.onclick = () => updateMajor();
        if (majorData) {
            nameInput.value = majorData.majorName || "";
        }
    }
    // Show the modal
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });

    // Đặt aria-hidden thành false trước khi hiển thị
    modalElement.setAttribute('aria-hidden', 'false');
    modal.show();

}
//Thêm ngành 

async function loadMajorAdd() {
    await renderMajor("add");
}

async function addMajor() {
    const majorID = document.getElementById('majorID').value;
    const majorName = document.getElementById('majorName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('majorToast'));

    if ((majorName && majorName.trim() !== "") || (majorID && majorID.trim() !== "")) {
        try {
            const result = await callApi('/major', 'POST',{
                MajorID: majorID,
                MajorName: majorName
            });


                if (!result.status) {
                    toastMessage.innerText = result.message || 'Mã ngành đã tồn tại';
                    document.getElementById('majorToast').classList.remove('text-bg-success');
                    document.getElementById('majorToast').classList.add('text-bg-danger');
                    toastElement.show();
                    return;
                } else{
                document.getElementById('majorID').value = '';
                document.getElementById('majorName').value = '';
                toastMessage.innerText = 'Ngành học đã được thêm thành công';
                document.getElementById('majorToast').classList.remove('text-bg-danger');
                document.getElementById('majorToast').classList.add('text-bg-success');
            }

            toastElement.show();
            await loadMajors(currentOffset, itemsPerPage);

        } catch (error) {
            console.error('Lỗi chi tiết:', error);
            const errorDetails = error.stack || error.message || 'Không có thông tin lỗi chi tiết';
            toastMessage.innerText = 'Lỗi: ' + errorDetails;
            document.getElementById('majorToast').classList.remove('text-bg-success');
            document.getElementById('majorToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('majorToast').classList.remove('text-bg-success');
        document.getElementById('majorToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}



//Sửa ngành

async function loadMajorEdit(id) {
    editingMajorId = id;
    const result = await callApi(`/major/${id}`);
    const major = result.data;

    await renderMajor("edit", {
        majorName: major.MajorName
    });
}

async function updateMajor() {
    const majorName = document.getElementById('majorName').value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('majorToast'));

    if (majorName && majorName.trim() === "") {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('majorToast').classList.remove('text-bg-success');
        document.getElementById('majorToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        const result = await callApi(`/major/${editingMajorId}`, 'PUT',{
            MajorName: majorName
        });
        if (result.status) {
            toastMessage.innerText = 'Cập nhật ngành thành công';
            document.getElementById('majorToast').classList.remove('text-bg-danger');
            document.getElementById('majorToast').classList.add('text-bg-success');
            toastElement.show();
            await loadMajors(currentOffset, itemsPerPage);
        } else {
            toastMessage.innerText = result.message || 'Cập nhật thất bại';
            document.getElementById('majorToast').classList.remove('text-bg-success');
            document.getElementById('majorToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } catch (error) {
        toastMessage.innerText = 'Lỗi: ' + error.message;
        document.getElementById('majorToast').classList.remove('text-bg-success');
        document.getElementById('majorToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}


//Tìm kiếm ngành
async function loadFilteredMajors() {
    const searchKeyword = document.getElementById('majorKeyword').value.trim();
    // document.getElementById('majorKeyword').value = '';
    await loadMajors(0, itemsPerPage, searchKeyword,true);
}


// Main loadMajors function - now orchestrates separate rendering functions
async function loadMajors(offset = 0,limit = 10, keyword = '', isSearch = false) {
    try {
        const queryParams = new URLSearchParams({
            offset: offset,
            limit: limit,
            search: keyword || '',
        });

        const url = `/major/search?${queryParams.toString()}`;
        const result = await callApi(url);

        if (isSearch) {
            //Thông báo
            const toastMessage = document.getElementById('toastMessage');
            const toastElement = new bootstrap.Toast(document.getElementById('majorToast'));
            if (result.data['totalCount'] === 0) {
                toastMessage.innerText = 'Không tìm thấy ngành nào';
                document.getElementById('majorToast').classList.remove('text-bg-success');
                document.getElementById('majorToast').classList.add('text-bg-danger');
            } else {
                toastMessage.innerText = `Tìm thấy ${result.data['totalCount']} ngành`;
                document.getElementById('majorToast').classList.remove('text-bg-danger');
                document.getElementById('majorToast').classList.add('text-bg-success');
            }
            toastElement.show();
        }

        // Update the count display
        // document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

        // Call separated functions for rendering table and pagination
        renderMajorTable(result.data['major'] || []);
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
        console.error('Lỗi tải ngành:', error);
    }
}

// Separated function for rendering the majors table
function renderMajorTable(majors) {
    const tbody = document.getElementById('majorTableBody');
    tbody.innerHTML = '';
    let i=0;

    if (majors && majors.length > 0) {
        majors.forEach((major) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input majorCheckbox" value="${major.MajorID}">
                    </div>
                </td>
                <td>${++i}</td>

                <td class="idMajor">${major.MajorID}</td>
                <td>${major.MajorName}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-primary" id="editMajorBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                                        <button class="btn btn-outline-danger" id="deleteMajorBtn">
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

const selectedMajorIDs = new Set();
function logicCheckbox() {
    selectedMajorIDs.clear();
    // Get elements
    const selectAllCheckbox = document.getElementById('selectAll');
    const majorCheckbox = document.querySelectorAll('.majorCheckbox');
    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('majorDeleteBtn');

    // Function to update count and button visibility
    function updateSelectedCount() {
        const checkedBoxes = document.querySelectorAll('.majorCheckbox:checked');
        selectedCountElem.textContent = checkedBoxes.length;


        // Show/hide bulk delete button
        if (checkedBoxes.length > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }

        // Update "select all" checkbox state
        if (checkedBoxes.length === majorCheckbox.length && majorCheckbox.length > 0) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // Handle "select all" checkbox changes
    selectAllCheckbox.onchange = function() {
        majorCheckbox.forEach(checkbox => {
            checkbox.checked = this.checked;

            // Update Set of selected IDs
            const majorId = checkbox.getAttribute('value');
            if (this.checked) {
                selectedMajorIDs.add(majorId);
            } else {
                selectedMajorIDs.delete(majorId);
            }
        });
        updateSelectedCount();
    };

    // Handle individual checkbox changes
    majorCheckbox.forEach(checkbox => {
        checkbox.onchange = function() {
            const periodID = this.getAttribute('value');

            // Update Set of selected IDs
            if (this.checked) {
                selectedMajorIDs.add(periodID);
            } else {
                selectedMajorIDs.delete(periodID);
            }

            updateSelectedCount();
        };
    });

    // Restore checkbox states from selectedPeriodIDs
    majorCheckbox.forEach(checkbox => {
        const majorID = checkbox.getAttribute('value');
        if (selectedMajorIDs.has(majorID)) {
            checkbox.checked = true;
        }
    });

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('#table-major .btn').forEach(button => {
        button.addEventListener('click', async function() {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('.idMajor');
            if (firstTd) {
                const action = this.id;
                const id = firstTd.textContent.trim();
                if (action === "editMajorBtn") {
                    await loadMajorEdit(id);
                } else if (action === "deleteMajorBtn") {
                    await handleDeleteMajor(id);
                }
            }
        });
    });

    // Initialize initial state
    updateSelectedCount();
}
//Xóa ngành
async function deleteMajor(id) {
    try {
        const result = await callApi(`/major/${id}`, 'DELETE');

        if (result.status) {
            return { success: true, message: 'Xóa ngành thành công' };
        } else {
            return { success: false, message: result?.message || 'Xóa ngành thất bại' };
        }
    } catch (error) {
        return { success: false, message: 'Lỗi: ' + error.message };
    }
}

async function handleDeleteMajor(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa ngành này?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        const res = await deleteMajor(id);

        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: res.success ? 'Thành công' : 'Thất bại',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
        });

        if (res.success) {
            loadMajors(currentOffset, itemsPerPage);
        }
    }
}


async function deleteSelectedMajors() {
    const selected = Array.from(document.querySelectorAll('.majorCheckbox:checked'))
                          .map(cb => cb.value);

    if (selected.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn ngành nào',
            text: 'Vui lòng chọn ít nhất một ngành để xóa.',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${selected.length} ngành?`,
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
            const res = await deleteMajor(id);
            if (res.success) {
                successCount++;
            } else {
                failedCount++;
                failedMessages.push(`ID ${id}: ${res.message}`);
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

        loadMajors(currentOffset, itemsPerPage);
    }
}

export {initMajor};