let currentFTypePage = 1;
const itemsPerFormTypePage = 5;
let editingFTypeId = null;


async function renderFTypeForm(mode, fTypeData = null) {
    await loadContentFTypeForm();

    const title = document.getElementById("fTypeFormTitle");
    const idGroup = document.getElementById("fTypeIDGroup");
    const nameInput = document.getElementById("fTypeName");
    const actionBtn = document.getElementById("fTypeActionBtn");

    if (mode === "add") {
        title.textContent = "Thêm loại khảo sát";
        idGroup.style.display = "block";
        actionBtn.textContent = "Thêm";
        actionBtn.onclick = () => addFType();
    } else if (mode === "edit") {
        title.textContent = "Sửa loại khảo sát";
        idGroup.style.display = "none";
        actionBtn.textContent = "Lưu thay đổi";
        actionBtn.onclick = () => updateFType();

        if (fTypeData) {
            nameInput.value = fTypeData.fTypeName || "";
        }
    }
}



//Thêm loại khảo sát

async function loadFTypeAdd() {
    await renderFTypeForm("add");
}

async function addFType() {
    const fTypeID = document.getElementById('fTypeID').value;
    const fTypeName = document.getElementById('fTypeName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('fTypeToast'));

    if ((fTypeName && fTypeName.trim() !== "") || (fTypeID && fTypeID.trim() !== "")) {
        try {
            const response = await fetch('/api/form-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FTypeID: fTypeID,
                    FTypeName: fTypeName
                })
            });

            const result = await response.json();

            if (!response.ok) { 
                if (response.status === 400) {
                    toastMessage.innerText = result.message || 'Mã loại khảo sát đã tồn tại';
                    document.getElementById('fTypeToast').classList.remove('text-bg-success');
                    document.getElementById('fTypeToast').classList.add('text-bg-danger');
                    toastElement.show();
                    return;
                }
 
                toastMessage.innerText = result.message || 'Thêm loại khảo sát thất bại';
                document.getElementById('fTypeToast').classList.remove('text-bg-success');
                document.getElementById('fTypeToast').classList.add('text-bg-danger');
                toastElement.show();
                return;
            }

            if (response.status === 201) {
                document.getElementById('fTypeID').value = '';
                document.getElementById('fTypeName').value = '';
                toastMessage.innerText = 'Loại khảo sát đã được thêm thành công';
                document.getElementById('fTypeToast').classList.remove('text-bg-danger');
                document.getElementById('fTypeToast').classList.add('text-bg-success');
            }

            toastElement.show();
            loadFTypes(currentFTypePage); 
        } catch (error) {
            console.error('Lỗi chi tiết:', error);
            const errorDetails = error.stack || error.message || 'Không có thông tin lỗi chi tiết';
            toastMessage.innerText = 'Lỗi: ' + errorDetails;
            document.getElementById('fTypeToast').classList.remove('text-bg-success');
            document.getElementById('fTypeToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('fTypeToast').classList.remove('text-bg-success');
        document.getElementById('fTypeToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}


//Sửa loại khảo sát


async function loadFTypeFormEdit(id) {
    editingFTypeId = id;
    const response = await fetch(`/api/form-type/${id}`);
    const result = await response.json();
    const fType = result.data;

    // Gọi render form ở chế độ "edit", truyền dữ liệu
    await renderFTypeForm("edit", {
        fTypeName: fType.FTypeName
    });
}

async function updateFType() {
    const fTypeName = document.getElementById('fTypeName').value;
    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('fTypeToast'));

    if (!fTypeName || fTypeName.trim() === "") {

        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('fTypeToast').classList.remove('text-bg-success');
        document.getElementById('fTypeToast').classList.add('text-bg-danger');
        toastElement.show();
        return;
    }

    try {
        const response = await fetch(`/api/form-type/${editingFTypeId}`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                FTypeName: fTypeName
            })
        });

        const result = await response.json();

        if (response.ok) {
            toastMessage.innerText = 'Cập nhật loại khảo sát thành công';
            document.getElementById('fTypeToast').classList.remove('text-bg-danger');
            document.getElementById('fTypeToast').classList.add('text-bg-success');
            toastElement.show();
        } else {
            toastMessage.innerText = result.message || 'Cập nhật thất bại';
            document.getElementById('fTypeToast').classList.remove('text-bg-success');
            document.getElementById('fTypeToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } catch (error) {
        toastMessage.innerText = 'Lỗi: ' + error.message;
        document.getElementById('fTypeToast').classList.remove('text-bg-success');
        document.getElementById('fTypeToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}

//Tìm kiếm loại khảo sát
async function loadFilteredFTypes() {
    const searchKeyword = document.getElementById('fTypeKeyword').value.trim();
    document.getElementById('fTypeKeyword').value = '';
    await loadFTypes(1, searchKeyword);
}


async function loadFTypes(page = 1, keyword = '') {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit: itemsPerPage,
            search: keyword || '',
        });

        const url = `/api/form-type/search?${queryParams.toString()}`;

        const response = await fetch(url);
        const result = await response.json();

        const tbody = document.getElementById('formTypeTableBody');
        const pagination = document.getElementById('pagination');

        // Hiển thị tổng số loại khảo sát
        const totalCount = result.totalCount || 0;
        document.querySelector('.card-stats h5').innerText = totalCount;

        tbody.innerHTML = '';
        pagination.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach((fType) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="fTypeCheckbox" value="${fType.FTypeID}"></td> 
                    <td>${fType.FTypeID}</td>
                    <td>${fType.FTypeName}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="loadFTypeFormEdit('${fType.FTypeID}')">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-outline-danger" onclick="handleDeleteFType('${fType.FTypeID}')">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </td>


                `;
                tbody.appendChild(row);
                document.getElementById('selectAll').addEventListener('change', function () {
                    const isChecked = this.checked;
                    document.querySelectorAll('.fTypeCheckbox').forEach(cb => {
                        cb.checked = isChecked;
                    });
                });
            });

            const totalPages = Math.ceil(result.totalCount / itemsPerPage);

            if (page > 1) {
                const prevButton = document.createElement('li');
                prevButton.classList.add('page-item');
                prevButton.innerHTML = `<a class="page-link" href="#" onclick="loadFTypes(${page - 1})">&laquo;</a>`;
                pagination.appendChild(prevButton);
            }

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('li');
                pageButton.classList.add('page-item');
                pageButton.classList.toggle('active', i === page);
                pageButton.innerHTML = `<a class="page-link" href="#" onclick="loadFTypes(${i})">${i}</a>`;
                pagination.appendChild(pageButton);
            }

            if (page < totalPages) {
                const nextButton = document.createElement('li');
                nextButton.classList.add('page-item');
                nextButton.innerHTML = `<a class="page-link" href="#" onclick="loadFTypes(${page + 1})">&raquo;</a>`;
                pagination.appendChild(nextButton);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải loại khảo sát:', error);
    }
    document.getElementById('selectAll').checked = false;
}

//Xóa loại khảo sát

async function deleteFType(id) {
    try {
        const response = await fetch(`/api/form-type/${id}`, {
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
            return { success: false, message: 'Xóa loại khảo sát thất bại (phản hồi không hợp lệ)' };
        }

        if (response.ok) {
            return { success: true, message: 'Xóa loại khảo sát thành công' };
        } else {
            return { success: false, message: result?.message || 'Xóa loại khảo sát thất bại' };
        }
    } catch (error) {
        return { success: false, message: 'Lỗi: ' + error.message };
    }
}

async function handleDeleteFType(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa loại khảo sát này?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        const res = await deleteFType(id);

        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: res.success ? 'Thành công' : 'Thất bại',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
        });

        if (res.success) {
            loadFTypes(currentFTypePage);
        }
    }
}


async function deleteSelectedFTypes() {
    const selected = Array.from(document.querySelectorAll('.fTypeCheckbox:checked'))
    .map(cb => cb.value);

    if (selected.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn loại khảo sát nào',
            text: 'Vui lòng chọn ít nhất một loại khảo sát để xóa.',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    const result = await Swal.fire({
        icon: 'question',
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${selected.length} loại khảo sát?`,
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
            const res = await deleteFType(id);
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

        loadFTypes(currentFTypePage);
    }
}
