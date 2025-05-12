import PaginationComponent from "./component/pagination.js";
import {callApi} from "./apiService.js";

let currentOffset = 0;
let itemsPerPage = 5;
let editingPositionId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: async (offset, limit) => {
        await loadPositions(offset, limit);
    },
    onLimitChange: async (offset, limit) => {
        await loadPositions(offset, limit);
    }
})



async function initPosition() {
    await setupHandlers();
    await loadPositions();

}
async function setupHandlers() {
    document.getElementById('positionAddBtn').addEventListener('click', loadPositionAdd);
    document.getElementById('positionSearchBtn').addEventListener('click', loadFilteredPositions);
    document.getElementById('positionDeleteBtn').addEventListener('click', deleteSelectedPositions);
    document.getElementById('positionKeyword').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFilteredPositions();
        }
    });
    document.addEventListener("DOMContentLoaded", function () {
        document.addEventListener('hide.bs.modal', function () {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        });
    });
}


async function renderPosition(mode, positionData = null) {
    // Create modal if it doesn't exist yet
    let modalElement = document.getElementById('positionModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="positionModal" tabindex="-1" aria-labelledby="positionModalLabel">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="positionTitle">Thêm chức vụ</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="positionName" class="form-label">Tên chức vụ</label>
                                <input type="text" class="form-control" id="positionName" placeholder="Nhập tên chức vụ">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="positionActionBtn">Thêm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('positionModal');

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
    const title = document.getElementById("positionTitle");
    const nameInput = document.getElementById("positionName");
    const actionBtn = document.getElementById("positionActionBtn");

    if (mode === "add") {
        nameInput.value = '';
        title.textContent = "Thêm chức vụ";
        actionBtn.textContent = "Thêm";
        actionBtn.onclick = () => addPosition();
    } else if (mode === "edit") {
        title.textContent = "Sửa chức vụ";
        actionBtn.textContent = "Lưu thay đổi";
        actionBtn.onclick = () => updatePosition();
        if (positionData) {
            nameInput.value = positionData.positionName || "";
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
//Thêm chức vụ 

async function loadPositionAdd() {
    await renderPosition("add");
}

async function addPosition() {
    const positionName = document.getElementById('positionName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('positionToast'));

    if ((positionName && positionName.trim() !== "")) {
        try {
            const result = await callApi('/position', 'POST',{
                PositionName: positionName
            });

            if (!result.status) {
                toastMessage.innerText = result.message || 'Mã chức vụ đã tồn tại';
                document.getElementById('positionToast').classList.remove('text-bg-success');
                document.getElementById('positionToast').classList.add('text-bg-danger');
                toastElement.show();
                return;
            } else{
                document.getElementById('positionName').value = '';
                toastMessage.innerText = 'Chức vụ học đã được thêm thành công';
                document.getElementById('positionToast').classList.remove('text-bg-danger');
                document.getElementById('positionToast').classList.add('text-bg-success');
            }

            toastElement.show();
            loadPositions(currentOffset, itemsPerPage);
        } catch (error) {
            console.error('Lỗi chi tiết:', error);
            const errorDetails = error.stack || error.message || 'Không có thông tin lỗi chi tiết';
            toastMessage.innerText = 'Lỗi: ' + errorDetails;
            document.getElementById('positionToast').classList.remove('text-bg-success');
            document.getElementById('positionToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('positionToast').classList.remove('text-bg-success');
        document.getElementById('positionToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}



//Sửa chức vụ

async function loadPositionEdit(id) {
    editingPositionId = id;
    const result = await callApi(`/position/${id}`);
    const position = result.data;

    await renderPosition("edit", {
        positionName: position.PositionName
    });
}

async function updatePosition() {
    const positionName = document.getElementById('positionName').value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('positionToast'));

    if (positionName && positionName.trim() === "") {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('positionToast').classList.remove('text-bg-success');
        document.getElementById('positionToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        const result = await callApi(`/position/${editingPositionId}`, 'PUT',{
            PositionName: positionName
        });

        if (result.status) {
            toastMessage.innerText = 'Cập nhật chức vụ thành công';
            document.getElementById('positionToast').classList.remove('text-bg-danger');
            document.getElementById('positionToast').classList.add('text-bg-success');
            toastElement.show();
            await loadPositions(currentOffset, itemsPerPage);

        } else {
            toastMessage.innerText = result.message || 'Cập nhật thất bại';
            document.getElementById('positionToast').classList.remove('text-bg-success');
            document.getElementById('positionToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } catch (error) {
        toastMessage.innerText = 'Lỗi: ' + error.message;
        document.getElementById('positionToast').classList.remove('text-bg-success');
        document.getElementById('positionToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}


//Tìm kiếm chức vụ
async function loadFilteredPositions() {
    const searchKeyword = document.getElementById('positionKeyword').value.trim();
    await loadPositions(0, itemsPerPage, searchKeyword,true);
}


// Main loadPositions function - now orchestrates separate rendering functions
async function loadPositions(offset = 0,limit = 10, keyword = '', isSearch = false) {
    try {
        const queryParams = new URLSearchParams({
            offset: offset,
            limit: limit,
            search: keyword || '',
        });

        const url = `/position/search?${queryParams.toString()}`;
        const result = await callApi(url);

        if (isSearch) {
            //Thông báo
            const toastMessage = document.getElementById('toastMessage');
            const toastElement = new bootstrap.Toast(document.getElementById('positionToast'));
            if (result.data['totalCount'] === 0) {
                toastMessage.innerText = 'Không tìm thấy chức vụ nào';
                document.getElementById('positionToast').classList.remove('text-bg-success');
                document.getElementById('positionToast').classList.add('text-bg-danger');
            } else {
                toastMessage.innerText = `Tìm thấy ${result.data['totalCount']} chức vụ`;
                document.getElementById('positionToast').classList.remove('text-bg-danger');
                document.getElementById('positionToast').classList.add('text-bg-success');
            }
            toastElement.show();
        }

        // Update the count display
        // document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

        // Call separated functions for rendering table and pagination
        renderPositionTable(result.data['position'] || []);
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
        console.error('Lỗi tải chức vụ:', error);
    }
}

// Separated function for rendering the positions table
function renderPositionTable(positions) {
    const tbody = document.getElementById('positionTableBody');
    tbody.innerHTML = '';
    let i = 0;
    if (positions && positions.length > 0) {
        positions.forEach((position) => {
            const row = document.createElement('tr');
            row.innerHTML = `
               <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input positionCheckbox" value="${position.PositionID}">
                    </div>
                </td>
                <td>${++i}</td> 
                <td class="idPosition">${position.PositionID}</td>
                <td>${position.PositionName}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-primary" id="editPositionBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                    <button class="btn btn-outline-danger" id="deletePositionBtn">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        logicCheckbox();
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }
}
const selectedPositionIDs = new Set();

function logicCheckbox() {
    selectedPositionIDs.clear();
    // Get elements
    const selectAllCheckbox = document.getElementById('selectAll');
    const positionCheckboxes = document.querySelectorAll('.positionCheckbox');
    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('positionDeleteBtn');

    // Function to update count and button visibility
    function updateSelectedCount() {
        const checkedBoxes = document.querySelectorAll('.positionCheckbox:checked');
        selectedCountElem.textContent = checkedBoxes.length;

        // Show/hide bulk delete button
        if (checkedBoxes.length > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }

        // Update "select all" checkbox state
        if (checkedBoxes.length === positionCheckboxes.length && positionCheckboxes.length > 0) {
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
        positionCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;

            // Update Set of selected IDs
            const positionId = checkbox.getAttribute('value');
            if (this.checked) {
                selectedPositionIDs.add(positionId);
            } else {
                selectedPositionIDs.delete(positionId);
            }
        });
        updateSelectedCount();
    };

    // Handle individual checkbox changes
    positionCheckboxes.forEach(checkbox => {
        checkbox.onchange = function() {
            const positionId = this.getAttribute('value');

            // Update Set of selected IDs
            if (this.checked) {
                selectedPositionIDs.add(positionId);
            } else {
                selectedPositionIDs.delete(positionId);
            }

            updateSelectedCount();
        };
    });

    // Restore checkbox states from selectedPositionIDs
    positionCheckboxes.forEach(checkbox => {
        const positionId = checkbox.getAttribute('value');
        if (selectedPositionIDs.has(positionId)) {
            checkbox.checked = true;
        }
    });

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('#positionTableBody .btn').forEach(button => {
        button.addEventListener('click', async function() {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('.idPosition');
            if (firstTd) {
                const action = this.id;
                const id = firstTd.textContent.trim();
                if (action === "editPositionBtn") {
                    await loadPositionEdit(id);
                } else if (action === "deletePositionBtn") {
                    await handleDeletePosition(id);
                }
            }
        });
    });

    // Initialize initial state
    updateSelectedCount();
}

//Xóa chức vụ
async function deletePosition(id) {
    try {
        const result = await callApi(`/position/${id}`, 'DELETE');

        if (result.status) {
            return { success: true, message: 'Xóa chức vụ thành công' };
        } else {
            return { success: false, message: result?.message || 'Xóa chức vụ thất bại' };
        }
    } catch (error) {
        return { success: false, message: 'Lỗi: ' + error.message };
    }
}

async function handleDeletePosition(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa chức vụ này?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        const res = await deletePosition(id);

        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: res.success ? 'Thành công' : 'Thất bại',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
        });

        if (res.success) {
            await loadPositions(currentOffset, itemsPerPage);
        }
    }
}


async function deleteSelectedPositions() {
    const selected = Array.from(document.querySelectorAll('.positionCheckbox:checked'))
                          .map(cb => cb.value);

    if (selected.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn chức vụ nào',
            text: 'Vui lòng chọn ít nhất một chức vụ để xóa.',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${selected.length} chức vụ?`,
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
            const res = await deletePosition(id);
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

        await loadPositions(currentOffset, itemsPerPage);
    }
}

export {initPosition};