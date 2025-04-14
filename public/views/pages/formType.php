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
        <p>Loại khảo sát</p>
    </div>
</div>

<div class="filter-section">
    <div class="d-flex gap-3">
        <select class="form-select">
            <option>Loại khảo sát</option>
        </select>
    </div>
    <div class="d-flex gap-3">
        <button class="btn btn-outline-primary">Lọc</button>
    </div>
</div>

<div class="filter-section">
    <input type="text" class="form-control" placeholder="Tìm kiếm: Nhập mã hoặc tên loại khảo sát">
    <div class="action-buttons">
        <button class="btn btn-outline-danger"><i class="bi bi-trash"></i> Xóa</button>
        <button class="btn btn-outline-primary" onclick="loadFormTypeAdd()"><i class="bi bi-plus"></i> Thêm loại khảo sát</button>
    </div>
</div>

<table class="table table-bordered">
    <thead>
        <tr>
            <th><input type="checkbox"></th>
            <th>ID</th>
            <th>Loại khảo sát</th>
            <th>Sửa</th>
        </tr>
    </thead>
    <tbody id="formTypeTableBody">
    </tbody>
</table>
<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center" id="pagination">
    </ul>
</nav> 
</body>
</html>