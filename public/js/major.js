let editingMajorId = null;
let currentMajorPage = 1;
let totalMajorPages = 1;


async function renderMajor(mode, majorData = null) {
    await loadContentMajorForm();

    const title = document.getElementById("majorTitle");
    const idGroup = document.getElementById("majorIDGroup");
    const nameInput = document.getElementById("majorName");
    const actionBtn = document.getElementById("majorActionBtn");

    if (mode === "add") {
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
            const response = await fetch('/api/major', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    MajorID: majorID,
                    MajorName: majorName
                })
            });

            const result = await response.json();

            if (!response.ok) { 
                if (response.status === 400) {
                    toastMessage.innerText = result.message || 'Mã ngành đã tồn tại';
                    document.getElementById('majorToast').classList.remove('text-bg-success');
                    document.getElementById('majorToast').classList.add('text-bg-danger');
                    toastElement.show();
                    return;
                }
 
                toastMessage.innerText = result.message || 'Thêm ngành học thất bại';
                document.getElementById('majorToast').classList.remove('text-bg-success');
                document.getElementById('majorToast').classList.add('text-bg-danger');
                toastElement.show();
                return;
            }

            if (response.status === 201) {
                document.getElementById('majorID').value = '';
                document.getElementById('majorName').value = '';
                toastMessage.innerText = 'Ngành học đã được thêm thành công';
                document.getElementById('majorToast').classList.remove('text-bg-danger');
                document.getElementById('majorToast').classList.add('text-bg-success');
            }

            toastElement.show();
            loadMajors(currentMajorPage); 
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
    const response = await fetch(`/api/major/${id}`);
    const result = await response.json();
    const major = result.data;

    await renderMajor("edit", {
        majorName: major.MajorName
    });
}

async function updateMajor() {
    const majorName = document.getElementById('majorName').value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('majorToast'));

    if (!majorName || majorName.trim() === "") {

        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('majorToast').classList.remove('text-bg-success');
        document.getElementById('majorToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        const response = await fetch(`/api/major/${editingMajorId}`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                MajorName: majorName
            })
        });

        const result = await response.json();

        if (response.ok) {
            toastMessage.innerText = 'Cập nhật ngành thành công';
            document.getElementById('majorToast').classList.remove('text-bg-danger');
            document.getElementById('majorToast').classList.add('text-bg-success');
            toastElement.show();
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
    await loadMajors(1, searchKeyword);
}


async function loadMajors(page = 1, keyword = '') {
    try {
        currentMajorPage = page;

        const itemsPerPage = parseInt(document.getElementById('itemsPerMajorPageSelect').value);
        const queryParams = new URLSearchParams({
            page,
            limit: itemsPerPage,
            search: keyword || ''
        });

        const url = `/api/major/search?${queryParams.toString()}`;

        const response = await fetch(url);
        const result = await response.json();

        const tbody = document.getElementById('majorTableBody');
        const infoText = document.getElementById('tableInfoText');

        const totalCount = result.totalCount || 0;
        document.querySelector('.card-stats h5').innerText = totalCount;
        tbody.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach((major) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="majorCheckbox" value="${major.MajorID}"></td> 
                    <td>${major.MajorID}</td>
                    <td>${major.MajorName}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="loadMajorEdit('${major.MajorID}')">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-outline-danger" onclick="handleDeleteMajor('${major.MajorID}')">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </td>

                `;
                tbody.appendChild(row);
                document.getElementById('selectAll').addEventListener('change', function () {
                    const isChecked = this.checked;
                    document.querySelectorAll('.majorCheckbox').forEach(cb => {
                        cb.checked = isChecked;
                    });
                });
            });

            // Cập nhật chỉ số hiển thị
            const from = (page - 1) * itemsPerPage + 1;
            const to = Math.min(page * itemsPerPage, totalCount);
            infoText.innerText = `${from}–${to} của ${totalCount}`;

            totalMajorPages = Math.ceil(totalCount / itemsPerPage);

        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
            infoText.innerText = '0–0 của 0';
            totalMajorPages = 1;
        }

        // Reset lại checkbox tổng
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.addEventListener('change', function () {
                const isChecked = this.checked;
                document.querySelectorAll('.majorCheckbox').forEach(cb => {
                    cb.checked = isChecked;
                });
            });
        }

    } catch (error) {
        console.error('Lỗi tải chu kỳ:', error);
    }
}

function goToMajorPage(action) {
    const searchKeyword = document.getElementById('majorKeyword').value.trim();
    switch (action) {
        case 'first':
            if (currentMajorPage > 1) loadMajors(1, searchKeyword);
            break;
        case 'prev':
            if (currentMajorPage > 1) loadMajors(currentMajorPage - 1, searchKeyword);
            break;
        case 'next':
            if (currentMajorPage < totalMajorPages) loadMajors(currentMajorPage + 1, searchKeyword);
            break;
        case 'last':
            if (currentMajorPage < totalMajorPages) loadMajors(totalMajorPages, searchKeyword);
            break;
    }
}


//Xóa ngành

async function deleteMajor(id) {
    try {
        const response = await fetch(`/api/major/${id}`, {
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
            return { success: false, message: 'Xóa ngành thất bại (phản hồi không hợp lệ)' };
        }

        if (response.ok) {
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
            loadMajors(currentMajorPage);
        }
    }
}


async function deleteSelectedMajors() {
    const selected = Array.from(document.querySelectorAll('.majorCheckbox:checked'))
                          .map(cb => parseInt(cb.value));

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

        loadMajors(currentMajorPage);
    }
}

//reset bộ lọc

function resetFilteredMajors() {
    document.getElementById("majorKeyword").value = "";
    loadMajors(1, "");
}
