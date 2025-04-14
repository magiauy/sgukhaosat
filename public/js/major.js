let currentMajorPage = 1;
const itemsPerMajorPage = 5;

async function loadMajors(page = 1) {
    console.log('Đang tải dữ liệu ngành học...');
    try {
        const response = await fetch(`/api/major?page=${page}&limit=${itemsPerMajorPage}`);

        if (!response.ok) {
            throw new Error('Không thể tải ngành học. Vui lòng thử lại sau.');
        }

        const result = await response.json();
        console.log(result); // Kiểm tra dữ liệu trả về

        const tbody = document.getElementById('majorTableBody');
        const pagination = document.getElementById('pagination');

        if (!tbody) {
            console.error('Không tìm thấy phần tử #majorTableBody');
            return;
        }

        tbody.innerHTML = ''; // Xóa nội dung bảng
        pagination.innerHTML = ''; // Xóa phân trang cũ

        if (result.data && result.data.length > 0) {
            result.data.forEach(major => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" value="${major.MajorID}"></td>
                    <td>#${major.MajorID}</td>
                    <td>${major.MajorName}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="editMajor(${major.MajorID})">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Tạo phân trang
            const totalPages = Math.ceil(result.totalCount / itemsPerMajorPage);

            // Thêm nút "Trước"
            if (page > 1) {
                const prevButton = document.createElement('li');
                prevButton.classList.add('page-item');
                prevButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Previous" onclick="loadMajors(${page - 1})">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                `;
                pagination.appendChild(prevButton);
            }

            // Thêm các nút trang
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('li');
                pageButton.classList.add('page-item');
                pageButton.classList.toggle('active', i === page);
                pageButton.innerHTML = `
                    <a class="page-link" href="#" onclick="loadMajors(${i})">${i}</a>
                `;
                pagination.appendChild(pageButton);
            }

            // Thêm nút "Tiếp theo"
            if (page < totalPages) {
                const nextButton = document.createElement('li');
                nextButton.classList.add('page-item');
                nextButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Next" onclick="loadMajors(${page + 1})">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                `;
                pagination.appendChild(nextButton);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải ngành học:', error);
        const tbody = document.getElementById('majorTableBody');
        
        if (!tbody) {
            console.error('Không tìm thấy phần tử #majorTableBody');
            return;
        }
        
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
    }
}

async function addMajor() {
    const majorID = document.getElementById('majorID').value;
    const majorName = document.getElementById('majorName').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('majorToast'));

    // Kiểm tra điều kiện năm bắt đầu phải nhỏ hơn năm kết thúc
    if (majorID && majorName) {
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

            if (response.status === 201) {
                toastMessage.innerText = 'Ngành học đã được thêm thành công';
                document.getElementById('majorToast').classList.remove('text-bg-danger');
                document.getElementById('majorToast').classList.add('text-bg-success');
            } else {
                toastMessage.innerText = result.message || 'Thêm ngành học thất bại';
                document.getElementById('majorToast').classList.remove('text-bg-success');
                document.getElementById('majorToast').classList.add('text-bg-danger');
            }

            toastElement.show();
            loadMajors(currentMajorPage);  // Reload danh sách ngành học sau khi thêm
        } catch (error) {
            toastMessage.innerText = 'Lỗi: ' + error.message;
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

async function deleteMajors() {
    const selectedMajors = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    if (selectedMajors.length === 0) {
        alert('Vui lòng chọn ít nhất một ngành để xóa');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa các ngành học đã chọn?')) {
        try {
            const response = await fetch('/api/major', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ majorIDs: selectedMajors })
            });

            const result = await response.json();

            if (response.status === 200) {
                alert(result.message || 'Xóa thành công');
                loadMajors(currentMajorPage);  // Reload danh sách ngành học sau khi xóa
            } else {
                alert(result.message || 'Xóa không thành công');
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }
}

async function loadTotalMajorCount() {
    try {
        const response = await fetch('/api/major/totalCount');
        const result = await response.json();

        if (response.ok) {
            const totalCount = result.totalCount || 0;
            document.querySelector('.card-stats h5').innerText = totalCount;
        } else {
            console.error('Không thể lấy tổng số chu kỳ');
        }
    } catch (error) {
        console.error('Lỗi khi tải tổng số chu kỳ:', error);
    }
}

function editMajor(id) {
    console.log("Sửa ngành học ID:", id);
}

window.addEventListener('load', function() {
    console.log('DOM và tài nguyên đã sẵn sàng');
    loadMajors(currentMajorPage);
});
