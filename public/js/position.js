import PaginationComponent from "./component/pagination.js";

let currentOffset = 0;
let itemsPerPage = 5;
let editingPositionId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadPositions(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadPositions(offset, limit);
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
        document.addEventListener('hide.bs.modal', function (event) {
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
            const response = await fetch('/api/position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    PositionName: positionName
                })
            });

            const result = await response.json();

            if (!response.ok) { 
                if (response.status === 400) {
                    toastMessage.innerText = result.message || 'Mã chức vụ đã tồn tại';
                    document.getElementById('positionToast').classList.remove('text-bg-success');
                    document.getElementById('positionToast').classList.add('text-bg-danger');
                    toastElement.show();
                    return;
                }
 
                toastMessage.innerText = result.message || 'Thêm chức vụ học thất bại';
                document.getElementById('positionToast').classList.remove('text-bg-success');
                document.getElementById('positionToast').classList.add('text-bg-danger');
                toastElement.show();
                return;
            }

            if (response.status === 201) {
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
    const response = await fetch(`/api/position/${id}`);
    const result = await response.json();
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
        const response = await fetch(`/api/position/${editingPositionId}`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                PositionName: positionName
            })
        });

        const result = await response.json();

        if (response.ok) {
            toastMessage.innerText = 'Cập nhật chức vụ thành công';
            document.getElementById('positionToast').classList.remove('text-bg-danger');
            document.getElementById('positionToast').classList.add('text-bg-success');
            toastElement.show();
            loadPositions(currentOffset, itemsPerPage);

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
    document.getElementById('positionKeyword').value = '';
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

        const url = `/api/position/search?${queryParams.toString()}`;
        const response = await fetch(url);
        const result = await response.json();

        console.log(result);
        console.log(result.data['position']);
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
        document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

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

    if (positions && positions.length > 0) {
        positions.forEach((position) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="positionCheckbox" value="${position.PositionID}"></td> 
                <td class="idPosition">${position.PositionID}</td>
                <td>${position.PositionName}</td>
                <td>
                    <button class="btn btn-outline-primary" id="editPositionBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                </td>
                <td>
                    <button class="btn btn-outline-danger" id="deletePositionBtn">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listener for "select all" checkbox
        document.getElementById('selectAll').addEventListener('change', function () {
            const isChecked = this.checked;
            document.querySelectorAll('.positionCheckbox').forEach(cb => {
                cb.checked = isChecked;
            });
        });
        document.querySelectorAll('#positionTableBody .btn').forEach(button => {
            button.addEventListener('click', async function () {
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
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }
}

//Xóa chức vụ
async function deletePosition(id) {
    try {
        const response = await fetch(`/api/position/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const textResponse = await response.text();

        let result;
        try {
            result = JSON.parse(textResponse);
        } catch (e) {
            return { success: false, message: 'Xóa chức vụ thất bại (phản hồi không hợp lệ)' };
        }

        if (response.ok) {
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
            loadPositions(currentOffset, itemsPerPage);
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

        loadPositions(currentOffset, itemsPerPage);
    }
}

export {initPosition};