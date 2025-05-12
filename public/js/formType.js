import PaginationComponent from "./component/pagination.js";
import {callApi} from "./apiService.js";

let currentOffset = 0;
let itemsPerFormTypePage = 5;
let editingFTypeId = null;

const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadFTypes(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadFTypes(offset, limit);
    }
})


async function initFormType() {
    await setupHandlers();
    await loadFTypes();

}
async function setupHandlers() {
    document.getElementById('fTypeAddBtn').addEventListener('click', loadFTypeAdd);
    document.getElementById('fTypeSearchBtn').addEventListener('click', loadFilteredFTypes);
    document.getElementById('fTypeDeleteBtn').addEventListener('click', deleteSelectedFTypes);
    document.getElementById('fTypeKeyword').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFilteredFTypes();
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

async function renderFType(mode, fTypeData = null) {
    // Create modal if it doesn't exist yet
    let modalElement = document.getElementById('fTypeModal');
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="fTypeModal" tabindex="-1" aria-labelledby="fTypeModalLabel">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fTypeTitle">Thêm ngành</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3" id="fTypeIDGroup">
                                <label for="fTypeID" class="form-label">Mã loại khảo sát</label>
                                <input type="text" id="fTypeID" class="form-control" required>
                            </div>

                            <div class="mb-3">
                                <label for="fTypeName" class="form-label">Tên loại khảo sát</label>
                                <input type="text" id="fTypeName" class="form-control" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="fTypeActionBtn">Thêm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('fTypeModal');

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
    const title = document.getElementById("fTypeTitle");
    const idGroup = document.getElementById("fTypeIDGroup");
    const nameInput = document.getElementById("fTypeName");
    const actionBtn = document.getElementById("fTypeActionBtn");

    if (mode === "add") {
        document.getElementById('fTypeID').value = '';
        nameInput.value = '';
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
    // Show the modal
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });

    // Đặt aria-hidden thành false trước khi hiển thị
    modalElement.setAttribute('aria-hidden', 'false');
    modal.show();

}


//Thêm loại khảo sát

async function loadFTypeAdd() {
    await renderFType("add");
}

async function addFType() {
    const fTypeID = document.getElementById('fTypeID').value;
    const fTypeName = document.getElementById('fTypeName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('fTypeToast'));

    if ((fTypeName && fTypeName.trim() !== "") || (fTypeID && fTypeID.trim() !== "")) {
        try {
            const result = await callApi('/form-type','POST', {
                FTypeID: fTypeID,
                FTypeName: fTypeName
            });


            if (!result.status) {
                toastMessage.innerText = result.message || 'Thêm loại khảo sát thất bại';
                document.getElementById('fTypeToast').classList.remove('text-bg-success');
                document.getElementById('fTypeToast').classList.add('text-bg-danger');
                toastElement.show();
                return;
            }else {
                document.getElementById('fTypeID').value = '';
                document.getElementById('fTypeName').value = '';
                toastMessage.innerText = result.message;
                document.getElementById('fTypeToast').classList.remove('text-bg-danger');
                document.getElementById('fTypeToast').classList.add('text-bg-success');
            }

            toastElement.show();
            loadFTypes(currentOffset, itemsPerFormTypePage);
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


async function loadFTypeEdit(id) {
    editingFTypeId = id;
    const result = await callApi(`/form-type/${id}`);
    const fType = result.data;

    // Gọi render form ở chế độ "edit", truyền dữ liệu
    await renderFType("edit", {
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
        const result = await callApi(`/form-type/${editingFTypeId}`, 'PUT',{
            FTypeName: fTypeName
        });

        if (result.status) {
            toastMessage.innerText = 'Cập nhật loại khảo sát thành công';
            document.getElementById('fTypeToast').classList.remove('text-bg-danger');
            document.getElementById('fTypeToast').classList.add('text-bg-success');
            toastElement.show();
            await loadFTypes(currentOffset, itemsPerFormTypePage);
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
    await loadFTypes(0, itemsPerFormTypePage, searchKeyword,true);
}


async function loadFTypes(offset = 0,limit = 10, keyword = '', isSearch = false) {
    try {
        const queryParams = new URLSearchParams({
            offset: offset,
            limit: limit,
            search: keyword || '',
        });

        const url = `/form-type/search?${queryParams.toString()}`;

        const result = await callApi(url);

        console.log(result);
        console.log(result.data['fType']);

        if (isSearch) {
            //Thông báo
            const toastMessage = document.getElementById('toastMessage');
            const toastElement = new bootstrap.Toast(document.getElementById('fTypeToast'));
            if (result.data['totalCount'] === 0) {
                toastMessage.innerText = 'Không tìm thấy ngành nào';
                document.getElementById('fTypeToast').classList.remove('text-bg-success');
                document.getElementById('fTypeToast').classList.add('text-bg-danger');
            } else {
                toastMessage.innerText = `Tìm thấy ${result.data['totalCount']} ngành`;
                document.getElementById('fTypeToast').classList.remove('text-bg-danger');
                document.getElementById('fTypeToast').classList.add('text-bg-success');
            }
            toastElement.show();
        }
        
        document.querySelector('.card-stats h5').innerText = result.data['totalCount'] || 0;

        renderFTypeTable(result.data['fType'] || []);
        pagination.render({
            currentPage: result.data['currentPage'],
            totalPages: result.data['totalPages'],
            limit: limit,
            totalItems: result.data['totalCount']
        })
        currentOffset = offset;
        itemsPerFormTypePage = limit;
        // Reset select all checkbox
        document.getElementById('selectAll').checked = false;
    } catch (error) {
        console.error('Lỗi tải loại khảo sát:', error);
    }
}

function renderFTypeTable(fTypes) {
    const tbody = document.getElementById('fTypeTableBody');
    tbody.innerHTML = '';

    if (fTypes && fTypes.length > 0) {
        fTypes.forEach((fType) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="fTypeCheckbox" value="${fType.FTypeID}"></td> 
                <td class="idfType">${fType.FTypeID}</td>
                <td>${fType.FTypeName}</td>
                <td>
                    <button class="btn btn-outline-primary" id="editFTypeBtn">
                        <i class="bi bi-gear-fill"></i> Sửa
                    </button>
                </td>
                <td>
                    <button class="btn btn-outline-danger" id="deleteFTypeBtn">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listener for "select all" checkbox
        document.getElementById('selectAll').addEventListener('change', function () {
            const isChecked = this.checked;
            document.querySelectorAll('.fTypeCheckbox').forEach(cb => {
                cb.checked = isChecked;
            });
        });
        document.querySelectorAll('#fTypeTableBody .btn').forEach(button => {
            button.addEventListener('click', async function () {
                const row = this.closest('tr');
                const firstTd = row?.querySelector('.idfType');
                if (firstTd) {
                    const action = this.id;
                    const id = firstTd.textContent.trim();
                    if (action === "editFTypeBtn") {
                        await loadFTypeEdit(id);
                    } else if (action === "deleteFTypeBtn") {
                        await handleDeleteFType(id);
                    }
                }
            });
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }
}

//Xóa loại khảo sát

async function deleteFType(id) {
    try {
        const result = await callApi(`/form-type/${id}`, 'DELETE');

        if (result.status) {
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
            loadFTypes(currentOffset, itemsPerFormTypePage);
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

        loadFTypes(currentOffset, itemsPerFormTypePage);
    }
}

export {initFormType};