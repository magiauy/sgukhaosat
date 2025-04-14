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
        <h5>0</h5>
        <p>Ngành</p>
    </div>
</div>

<div class="filter-section">
    <div class="d-flex gap-3">
        <select class="form-select">
            <option>Ngành</option>
        </select>
    </div>
    <div class="d-flex gap-3">
        <button class="btn btn-outline-primary">Lọc</button>
    </div>
</div>

<div class="filter-section">
    <input type="text" class="form-control" placeholder="Tìm kiếm: Nhập mã hoặc tên ngành">
    <div class="action-buttons">
        <button class="btn btn-outline-danger"><i class="bi bi-trash"></i> Xóa</button>
        <button class="btn btn-outline-primary" onclick="loadMajorAdd()"><i class="bi bi-plus"></i> Thêm ngành</button>
    </div>
</div>

<table class="table table-bordered">
    <thead>
        <tr>
            <th><input type="checkbox"></th>
            <th>ID</th>
            <th>Ngành</th>
            <th>Sửa</th>
        </tr>
    </thead>
    <tbody  id="majorTableBody">
    </tbody>
</table>
<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center" id="pagination">
    </ul>
</nav>
</body>
</html>