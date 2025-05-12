import PaginationComponent from "./component/pagination.js";

let currentOffset = 0;
let itemsPerPeriodPage = 5;
let editingPeriodId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadPeriods(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadPeriods(offset, limit);
    }
})


async function initPeriod() {
    await setupHandlers();
    await loadPeriods();

}

async function setupHandlers() {
    document.getElementById('periodAddBtn').addEventListener('click', loadPeriodAdd);
    document.getElementById('periodSearchBtn').addEventListener('click', loadFilteredPeriods);
    document.getElementById('periodDeleteBtn').addEventListener('click', deleteSelectedPeriods);
    document.getElementById('periodKeyword').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFilteredPeriods();
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



async function renderPeriod(mode, periodData = null) {
    // Create modal if it doesn't exist yet
    let modalElement = document.getElementById('periodModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="periodModal" tabindex="-1" aria-labelledby="periodModalLabel">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="periodTitle">Thêm chu kỳ</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                            <label for="startYearInput" class="form-label">Năm bắt đầu</label>
                            <input type="number" class="form-control" id="startYearInput" placeholder="Năm bắt đầu">
                        </div>

                        <div class="mb-3">
                            <label for="endYearInput" class="form-label">Năm kết thúc</label>
                            <input type="number" class="form-control" id="endYearInput" placeholder="Năm kết thúc">
                        </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="periodActionBtn">Thêm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('periodModal');

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
    const title = document.getElementById("periodTitle");
    const startYearInput = document.getElementById("startYearInput");
    const endYearInput = document.getElementById("endYearInput");
    const actionBtn = document.getElementById("periodActionBtn");

    if (mode === "add") {
        document.getElementById("startYearInput").value = '';
        document.getElementById("endYearInput").value = '';
        title.textContent = "Thêm chu kỳ";
        actionBtn.textContent = "Thêm";
        actionBtn.onclick = () => addPeriod();
    } else if (mode === "edit") {
        title.textContent = "Sửa chu kỳ";
        actionBtn.textContent = "Lưu thay đổi";
        actionBtn.onclick = () => updatePeriod();
        if (periodData) {
            startYearInput.value = periodData.startYear || "";
            endYearInput.value = periodData.endYear || "";
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

//Thêm chu kỳ

async function loadPeriodAdd() {
    await renderPeriod("add");
}

async function addPeriod() {
    const startYear = document.getElementById("startYearInput").value;
    const endYear = document.getElementById("endYearInput").value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('periodToast'));

    if (startYear && endYear) {
        if (parseInt(startYear) >= parseInt(endYear)) {
            toastMessage.innerText = 'Năm bắt đầu phải nhỏ hơn năm kết thúc';
            document.getElementById('periodToast').classList.remove('text-bg-success');
            document.getElementById('periodToast').classList.add('text-bg-danger');
            toastElement.show();
            return;
        }

        try {
            const response = await fetch('/api/period', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startYear: startYear,
                    endYear: endYear
                })
            });

            const result = await response.json();
            if (response.status === 201) {
                toastMessage.innerText = 'Chu kỳ đã được thêm thành công';
                document.getElementById('startYearInput').value = '';
                document.getElementById('endYearInput').value = '';
                document.getElementById('periodToast').classList.remove('text-bg-danger');
                document.getElementById('periodToast').classList.add('text-bg-success');
            } else {
                toastMessage.innerText = result.message || 'Thêm chu kỳ thất bại';
                document.getElementById('periodToast').classList.remove('text-bg-success');
                document.getElementById('periodToast').classList.add('text-bg-danger');
            }

            toastElement.show();
            loadPeriods(currentOffset, itemsPerPeriodPage);

        } catch (error) {
            toastMessage.innerText = 'Lỗi: ' + error.message;
            document.getElementById('periodToast').classList.remove('text-bg-success');
            document.getElementById('periodToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('periodToast').classList.remove('text-bg-success');
        document.getElementById('periodToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}

//Sửa chu kỳ

async function loadPeriodEdit(id) {
    editingPeriodId = id;
    const response = await fetch(`/api/period/${id}`);
    const result = await response.json();
    const period = result.data;

    await renderPeriod("edit", {
        startYear: period.startYear,
        endYear: period.endYear,
    });
}


async function updatePeriod() {
    const startYear = document.getElementById('startYearInput').value;
    const endYear = document.getElementById('endYearInput').value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('periodToast'));

    if (!startYear || !endYear) {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('periodToast').classList.remove('text-bg-success');
        document.getElementById('periodToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    if (parseInt(startYear) >= parseInt(endYear)) {
        toastMessage.innerText = 'Năm bắt đầu phải nhỏ hơn năm kết thúc';
        document.getElementById('periodToast').classList.remove('text-bg-success');
        document.getElementById('periodToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        const response = await fetch(`/api/period/${editingPeriodId}`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startYear,
                endYear
            })
        });

        const result = await response.json();

        if (response.ok) {
            toastMessage.innerText = 'Cập nhật chu kỳ thành công';
            document.getElementById('periodToast').classList.remove('text-bg-danger');
            document.getElementById('periodToast').classList.add('text-bg-success');
            toastElement.show();
            loadPeriods(currentOffset, itemsPerPeriodPage);

        } else {
            toastMessage.innerText = result.message || 'Cập nhật thất bại';
            document.getElementById('periodToast').classList.remove('text-bg-success');
            document.getElementById('periodToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } catch (error) {
        toastMessage.innerText = 'Lỗi: ' + error.message;
        document.getElementById('periodToast').classList.remove('text-bg-success');
        document.getElementById('periodToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}

//Tìm kiếm chu kỳ
async function loadFilteredPeriods() {
    const searchKeyword = document.getElementById('periodKeyword').value.trim();
    // document.getElementById('periodKeyword').value = '';
    await loadPeriods(0, itemsPerPeriodPage, searchKeyword,true);
}


async function loadPeriods(offset = 0,limit = 10, keyword = '', isSearch = false) {
    try {
        // const startYear = document.getElementById('startYearFilter').value.trim();
        // const endYear = document.getElementById('endYearFilter').value.trim();
        //
        // document.getElementById('startYearFilter').value = '';
        // document.getElementById('endYearFilter').value = '';

        const queryParams = new URLSearchParams({
            offset: offset,
            limit: limit,
            search: keyword || '',
            // startYear: startYear || '',
            // endYear: endYear || ''
        });

        const url = `/api/period/search?${queryParams.toString()}`;

        const response = await fetch(url);
        const result = await response.json();
        console.log(result);
        console.log(result.data['period']);

        if (isSearch) {
            //Thông báo
            const toastMessage = document.getElementById('toastMessage');
            const toastElement = new bootstrap.Toast(document.getElementById('periodToast'));
            if (result.data['totalCount'] === 0) {
                toastMessage.innerText = 'Không tìm thấy chu kỳ nào';
                document.getElementById('periodToast').classList.remove('text-bg-success');
                document.getElementById('periodToast').classList.add('text-bg-danger');
            } else {
                toastMessage.innerText = `Tìm thấy ${result.data['totalCount']} ngành`;
                document.getElementById('periodToast').classList.remove('text-bg-danger');
                document.getElementById('periodToast').classList.add('text-bg-success');
            }
            toastElement.show();
        }

        // Update the count display
        // document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

        // Call separated functions for rendering table and pagination
        renderPeriodTable(result.data['period'] || []);
        pagination.render({
            currentPage: result.data['currentPage'],
            totalPages: result.data['totalPages'],
            limit: limit,
            totalItems: result.data['totalCount']
        })
        currentOffset = offset;
        itemsPerPeriodPage = limit;
        // Reset select all checkbox
        document.getElementById('selectAll').checked = false;
    } catch (error) {
        console.error('Lỗi tải chu kỳ:', error);
    }
}


function renderPeriodTable(periods) {
    const tbody = document.getElementById('periodTableBody');
    tbody.innerHTML = '';

    if (periods && periods.length > 0) {
        periods.forEach((period) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input periodCheckbox" value="${period.periodID}">
                    </div>
                </td>
                <td class="idPeriod">${period.periodID}</td>
                <td>${period.startYear}</td>
                <td>${period.endYear}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-primary" id="editPeriodBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                    <button class="btn btn-outline-danger" id="deletePeriodBtn">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        logicCheckboxPeriod();
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }
}
// Store selected period IDs in a Set for efficient tracking
const selectedPeriodIDs = new Set();

function logicCheckboxPeriod() {
    // Get elements
    const selectAllCheckbox = document.getElementById('selectAll');
    const periodCheckboxes = document.querySelectorAll('.periodCheckbox');
    const selectedCountElem = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('periodDeleteBtn');

    // Function to update count and button visibility
    function updateSelectedCount() {
        const checkedBoxes = document.querySelectorAll('.periodCheckbox:checked');
        selectedCountElem.textContent = checkedBoxes.length;

        // Show/hide bulk delete button
        if (checkedBoxes.length > 0) {
            deleteSelectedBtn.classList.remove('d-none');
        } else {
            deleteSelectedBtn.classList.add('d-none');
        }

        // Update "select all" checkbox state
        if (checkedBoxes.length === periodCheckboxes.length && periodCheckboxes.length > 0) {
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
        periodCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;

            // Update Set of selected IDs
            const periodID = checkbox.getAttribute('value');
            if (this.checked) {
                selectedPeriodIDs.add(periodID);
            } else {
                selectedPeriodIDs.delete(periodID);
            }
        });
        updateSelectedCount();
    };

    // Handle individual checkbox changes
    periodCheckboxes.forEach(checkbox => {
        checkbox.onchange = function() {
            const periodID = this.getAttribute('value');

            // Update Set of selected IDs
            if (this.checked) {
                selectedPeriodIDs.add(periodID);
            } else {
                selectedPeriodIDs.delete(periodID);
            }

            updateSelectedCount();
        };
    });

    // Restore checkbox states from selectedPeriodIDs
    periodCheckboxes.forEach(checkbox => {
        const periodID = checkbox.getAttribute('value');
        if (selectedPeriodIDs.has(periodID)) {
            checkbox.checked = true;
        }
    });

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('#periodTableBody .btn').forEach(button => {
        button.addEventListener('click', async function() {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('.idPeriod');
            if (firstTd) {
                const action = this.id;
                const id = firstTd.textContent.trim();
                if (action === "editPeriodBtn") {
                    await loadPeriodEdit(id);
                } else if (action === "deletePeriodBtn") {
                    await handleDeletePeriod(id);
                }
            }
        });
    });

    // Initialize initial state
    updateSelectedCount();
}

// Function to clear selections (can be called after operations like bulk delete)
function clearSelectedPeriods() {
    selectedPeriodIDs.clear();
    const selectedCountElem = document.getElementById('selected-count');
    if (selectedCountElem) {
        selectedCountElem.textContent = "0";
    }

    const deleteSelectedBtn = document.getElementById('periodDeleteBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.classList.add('d-none');
    }

    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}
//Xóa chu kỳ

async function deletePeriod(id) {
    try {
        const response = await fetch(`/api/period/${id}`, {
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
            return { success: false, message: 'Xóa chu kỳ thất bại (phản hồi không hợp lệ)' };
        }

        if (response.ok) {
            return { success: true, message: 'Xóa chu kỳ thành công' };
        } else {
            return { success: false, message: result?.message || 'Xóa chu kỳ thất bại' };
        }
    } catch (error) {
        return { success: false, message: 'Lỗi: ' + error.message };
    }
}

async function handleDeletePeriod(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa chu kỳ này?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        const res = await deletePeriod(id);

        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: res.success ? 'Thành công' : 'Thất bại',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
        });

        if (res.success) {
            loadPeriods(currentOffset, itemsPerPeriodPage);
        }
    }
}


async function deleteSelectedPeriods() {
    const selected = Array.from(document.querySelectorAll('.periodCheckbox:checked'))
                          .map(cb => cb.value);

    if (selected.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn chu kỳ nào',
            text: 'Vui lòng chọn ít nhất một chu kỳ để xóa.',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${selected.length} chu kỳ?`,
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
            const res = await deletePeriod(id);
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

        loadPeriods(currentOffset, itemsPerPeriodPage);
    }
}

export {initPeriod};

