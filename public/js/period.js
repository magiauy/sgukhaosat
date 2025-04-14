let currentPeriodPage = 1;
const itemsPerPage = 5;

function loadPeriodAdd() {
    fetch('/public/views/pages/periodAdd.php')
        .then(res => res.text())
        .then(html => document.getElementById('content').innerHTML = html);
}


async function addCycle() {
    const startYear = document.getElementById('start_year').value;
    const endYear = document.getElementById('end_year').value;

    const toastMessage = document.getElementById('toastMessage');
    const toastElement = new bootstrap.Toast(document.getElementById('cycleToast'));

    // Kiểm tra điều kiện năm bắt đầu phải nhỏ hơn năm kết thúc
    if (startYear && endYear) {
        if (parseInt(startYear) >= parseInt(endYear)) {
            toastMessage.innerText = 'Năm bắt đầu phải nhỏ hơn năm kết thúc';
            document.getElementById('cycleToast').classList.remove('text-bg-success');
            document.getElementById('cycleToast').classList.add('text-bg-danger');
            toastElement.show();
            return; // Dừng lại nếu điều kiện không thỏa mãn
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
                document.getElementById('cycleToast').classList.remove('text-bg-danger');
                document.getElementById('cycleToast').classList.add('text-bg-success');
            } else {
                toastMessage.innerText = result.message || 'Thêm chu kỳ thất bại';
                document.getElementById('cycleToast').classList.remove('text-bg-success');
                document.getElementById('cycleToast').classList.add('text-bg-danger');
            }

            toastElement.show();
        } catch (error) {
            toastMessage.innerText = 'Lỗi: ' + error.message;
            document.getElementById('cycleToast').classList.remove('text-bg-success');
            document.getElementById('cycleToast').classList.add('text-bg-danger');
            toastElement.show();
        }
    } else {
        toastMessage.innerText = 'Vui lòng nhập đầy đủ thông tin';
        document.getElementById('cycleToast').classList.remove('text-bg-success');
        document.getElementById('cycleToast').classList.add('text-bg-danger');
        toastElement.show();
    }
}

async function loadPeriods(page = 1) {
    console.log('Đang tải dữ liệu chu kỳ...');
    try {
        const response = await fetch(`/api/period?page=${page}&limit=${itemsPerPage}`);

        if (!response.ok) {
            throw new Error('Không thể tải chu kỳ. Vui lòng thử lại sau.');
        }

        const result = await response.json();
        console.log(result); // Kiểm tra dữ liệu trả về

        const tbody = document.getElementById('periodTableBody');
        const pagination = document.getElementById('pagination');

        if (!tbody) {
            console.error('Không tìm thấy phần tử #periodTableBody');
            return;
        }

        tbody.innerHTML = ''; // Xóa nội dung bảng
        pagination.innerHTML = ''; // Xóa phân trang cũ

        if (result.data && result.data.length > 0) {
            result.data.forEach(period => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" value="${period.periodID}"></td>
                    <td>#${period.periodID}</td>
                    <td>${formatDate(period.startYear)}</td>
                    <td>${formatDate(period.endYear)}</td>
                    <td>
                        <button class="btn btn-outline-primary" onclick="editPeriod(${period.periodID})">
                            <i class="bi bi-gear-fill"></i> Sửa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Tạo phân trang
            const totalPages = Math.ceil(result.totalCount / itemsPerPage);

            // Thêm nút "Trước"
            if (page > 1) {
                const prevButton = document.createElement('li');
                prevButton.classList.add('page-item');
                prevButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Previous" onclick="loadPeriods(${page - 1})">
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
                    <a class="page-link" href="#" onclick="loadPeriods(${i})">${i}</a>
                `;
                pagination.appendChild(pageButton);
            }

            // Thêm nút "Tiếp theo"
            if (page < totalPages) {
                const nextButton = document.createElement('li');
                nextButton.classList.add('page-item');
                nextButton.innerHTML = `
                    <a class="page-link" href="#" aria-label="Next" onclick="loadPeriods(${page + 1})">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                `;
                pagination.appendChild(nextButton);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải chu kỳ:', error);
        const tbody = document.getElementById('periodTableBody');
        
        if (!tbody) {
            console.error('Không tìm thấy phần tử #periodTableBody');
            return;
        }
        
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
    }
}

async function loadTotalPeriodCount() {
    try {
        const response = await fetch('/api/period/totalCount');
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

function formatDate(dateStr) {
    if (!dateStr.includes('-')) return dateStr; 
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${
             (date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

window.addEventListener('load', function() {
    console.log('DOM và tài nguyên đã sẵn sàng');
    loadPeriods(currentPeriodPage); 
});

 
function editPeriod(id) {
    console.log("Sửa chu kỳ ID:", id);
 
} 



