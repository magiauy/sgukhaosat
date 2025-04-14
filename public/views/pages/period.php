<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<div class="card-stats">
    <div class="card">
        <h5>1</h5>
        <p>Chu kỳ</p>
    </div>
</div>

<div class="filter-section">
    <div class="d-flex gap-3">
        <select class="form-select">
            <option>Ngày bắt đầu</option>
        </select>
        <select class="form-select">
            <option>Ngày kết thúc</option>
        </select>
    </div>
    <div class="d-flex gap-3">
        <button class="btn btn-outline-primary">Lọc</button>
    </div>
</div>

<div class="filter-section">
    <input type="text" class="form-control" placeholder="Tìm kiếm: Nhập mã hoặc tên chu kỳ">
    <div class="action-buttons">
        <button class="btn btn-outline-danger"><i class="bi bi-trash"></i> Xóa</button>
        <button class="btn btn-outline-primary" onclick="loadPeriodAdd()"><i class="bi bi-plus"></i> Thêm chu kỳ</button>
    </div>
</div>
<table class="table table-bordered">
    <thead>
        <tr>
            <th><input type="checkbox"></th>
            <th>ID</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Sửa</th>
        </tr>
    </thead>
    <tbody id="periodTableBody">
        <!-- Các dòng chu kỳ sẽ được thêm vào đây -->
    </tbody>
</table>
<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center" id="pagination">
        <!-- Các nút phân trang sẽ được thêm vào đây -->
    </ul>
</nav>
</body>
</html>