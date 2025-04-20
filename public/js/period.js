let editingPeriodId = null;
let currentPeriodPage = 1;
let totalPeriodPages = 1; 


async function renderPeriod(mode, periodData = null) {
    await loadContentPeriodForm();

    const title = document.getElementById("periodTitle");
    const startYearInput = document.getElementById("startYearInput");
    const endYearInput = document.getElementById("endYearInput");
    const actionBtn = document.getElementById("periodActionBtn");

    if (mode === "add") {
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
    await loadPeriods(1, searchKeyword);
}


async function loadPeriods(page = 1, keyword = '') {
    try {
        currentPeriodPage = page;

        const startYearTemp = document.getElementById('startYearFilter');
        const endYearTemp = document.getElementById('endYearFilter');

        const startYear = startYearTemp ? startYearTemp.value.trim() : '';
        const endYear = endYearTemp ? endYearTemp.value.trim() : '';

        const itemsPerPage = parseInt(document.getElementById('itemsPerPageSelect')?.value || '10');

        const queryParams = new URLSearchParams({
            page,
            limit: itemsPerPage,
            search: keyword || '',
            startYear: startYear || '',
            endYear: endYear || ''
        });

        const url = `/api/period/search?${queryParams.toString()}`;
        const response = await fetch(url);
        const result = await response.json();

        const tbody = document.getElementById('periodTableBody');
        const infoText = document.getElementById('tableInfoText');
        const totalCount = result.totalCount || 0;
        document.querySelector('.card-stats h5').innerText = totalCount;

        tbody.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach((period, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="periodCheckbox" value="${period.periodID}"></td> 
                    <td>${(page - 1) * itemsPerPage + index + 1}</td>
                    <td>${period.startYear}</td>
                    <td>${period.endYear}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="loadPeriodEdit(${period.periodID})">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-outline-danger" onclick="handleDeletePeriod(${period.periodID})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Cập nhật chỉ số hiển thị
            const from = (page - 1) * itemsPerPage + 1;
            const to = Math.min(page * itemsPerPage, totalCount);
            infoText.innerText = `${from}–${to} của ${totalCount}`;

            totalPeriodPages = Math.ceil(totalCount / itemsPerPage);

        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
            infoText.innerText = '0–0 của 0';
            totalPeriodPages = 1;
        }

        // Reset lại checkbox tổng
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.addEventListener('change', function () {
                const isChecked = this.checked;
                document.querySelectorAll('.periodCheckbox').forEach(cb => {
                    cb.checked = isChecked;
                });
            });
        }

    } catch (error) {
        console.error('Lỗi tải chu kỳ:', error);
    }
}

function goToPeriodPage(action) {
    const searchKeyword = document.getElementById('periodKeyword').value.trim();
    switch (action) {
        case 'first':
            if (currentPeriodPage > 1) loadPeriods(1, searchKeyword);
            break;
        case 'prev':
            if (currentPeriodPage > 1) loadPeriods(currentPeriodPage - 1, searchKeyword);
            break;
        case 'next':
            if (currentPeriodPage < totalPeriodPages) loadPeriods(currentPeriodPage + 1, searchKeyword);
            break;
        case 'last':
            if (currentPeriodPage < totalPeriodPages) loadPeriods(totalPeriodPages, searchKeyword);
            break;
    }
}




function formatDate(dateStr) {
    if (!dateStr.includes('-')) return dateStr; 
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${
             (date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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
            loadPeriods(currentPeriodPage);
        }
    }
}


async function deleteSelectedPeriods() {
    const selected = Array.from(document.querySelectorAll('.periodCheckbox:checked'))
                          .map(cb => parseInt(cb.value));

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

        loadPeriods(currentPeriodPage);
    }
}

//reset bộ lọc

function resetFilteredPeriods() {
    document.getElementById("startYearFilter").value = "";
    document.getElementById("endYearFilter").value = "";
    document.getElementById("periodKeyword").value = "";
    loadPeriods(1, "");
}
