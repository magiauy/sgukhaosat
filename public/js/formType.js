let currentFormTypePage = 1;
const itemsPerFormTypePage = 5;

async function loadFormTypes(page = 1) {
    console.log('Đang tải dữ liệu loại biểu mẫu...');
    try {
        const response = await fetch(`/api/form-type?page=${page}&limit=${itemsPerFormTypePage}`);

        if (!response.ok) {
            throw new Error('Không thể tải loại biểu mẫu. Vui lòng thử lại sau.');
        }

        const result = await response.json();
        console.log(result);

        const tbody = document.getElementById('formTypeTableBody');
        const pagination = document.getElementById('pagination');

        if (!tbody) {
            console.error('Không tìm thấy phần tử #formTypeTableBody');
            return;
        }

        tbody.innerHTML = ''; 
        pagination.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach(formType => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" value="${formType.FTypeID}"></td>
                    <td>#${formType.FTypeID}</td>
                    <td>${formType.FTypeName}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="editFormType('${formType.FTypeID}')">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            const totalPages = Math.ceil(result.totalCount / itemsPerFormTypePage);

            if (page > 1) {
                const prevButton = document.createElement('li');
                prevButton.classList.add('page-item');
                prevButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Previous" onclick="loadFormTypes(${page - 1})">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                `;
                pagination.appendChild(prevButton);
            }

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('li');
                pageButton.classList.add('page-item');
                pageButton.classList.toggle('active', i === page);
                pageButton.innerHTML = `
                    <a class="page-link" href="#" onclick="loadFormTypes(${i})">${i}</a>
                `;
                pagination.appendChild(pageButton);
            }

            if (page < totalPages) {
                const nextButton = document.createElement('li');
                nextButton.classList.add('page-item');
                nextButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Next" onclick="loadFormTypes(${page + 1})">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                `;
                pagination.appendChild(nextButton);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải loại biểu mẫu:', error);
        const tbody = document.getElementById('formTypeTableBody');
        
        if (!tbody) {
            console.error('Không tìm thấy phần tử #formTypeTableBody');
            return;
        }
        
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
    }
}

async function addFormType() {
    const formTypeID = document.getElementById('formTypeID').value;
    const formTypeName = document.getElementById('formTypeName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('formTypeToast'));

    if (formTypeID && formTypeName) {
        try {
            const response = await fetch('/api/form-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FTypeID: formTypeID,
                    FTypeName: formTypeName
                })
            });

            const result = await response.json();

            if (response.status === 201) {
                toastMessage.innerText = 'Loại biểu mẫu đã được thêm thành công';
                document.getElementById('formTypeToast').classList.remove('text-bg-danger');
                document.getElementById('formTypeToast').classList.add('text-bg-success');
            } else {
                toastMessage.innerText = result.message || 'Thêm loại biểu mẫu thất bại';
                document.getElementById('formTypeToast').classList.remove('text-bg-success');
                document.getElementById('formTypeToast').classList.add('text-bg-danger');
            }

            toastElement.show();
            loadFormTypes(currentFormTypePage); 
        } catch (error) {
            toastMessage.innerText = 'Lỗi: ' + error.message;
            document.getElementById('formTypeToast').classList.remove('text-bg-success');
            document.getElementById('formTypeToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('formTypeToast').classList.remove('text-bg-success');
        document.getElementById('formTypeToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}

async function deleteFormTypes() {
    const selectedFormTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    if (selectedFormTypes.length === 0) {
        alert('Vui lòng chọn ít nhất một loại biểu mẫu để xóa');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa các loại biểu mẫu đã chọn?')) {
        try {
            const response = await fetch('/api/form-type', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ formTypeIDs: selectedFormTypes })
            });

            const result = await response.json();

            if (response.status === 200) {
                alert(result.message || 'Xóa thành công');
                loadFormTypes(currentFormTypePage);
            } else {
                alert(result.message || 'Xóa không thành công');
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }
}

async function loadTotalFormTypeCount() {
    try {
        const response = await fetch('/api/form-type/totalCount');
        const result = await response.json();

        if (response.ok) {
            const totalCount = result.totalCount || 0;
            document.querySelector('.card-stats h5').innerText = totalCount;
        } else {
            console.error('Không thể lấy tổng số loại biểu mẫu');
        }
    } catch (error) {
        console.error('Lỗi khi tải tổng số loại biểu mẫu:', error);
    }
}

function editFormType(id) {
    console.log("Sửa loại biểu mẫu ID:", id);
}

window.addEventListener('load', function() {
    console.log('DOM và tài nguyên đã sẵn sàng');
    loadFormTypes(currentFormTypePage);
});
