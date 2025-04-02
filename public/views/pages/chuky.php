<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản Lý Chu Kỳ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="/public/css/qlnganh.css">
</head>
<body>
    
    <div id="content">
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
                <button class="btn btn-outline-primary"><i class="bi bi-plus"></i> Thêm chu kỳ</button>
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
            <tbody>
                <tr>
                    <td><input type="checkbox"></td>
                    <td>#1234</td>
                    <td>01/01/2025</td>
                    <td>31/12/2025</td>
                    <td><button class="btn btn-outline-primary"><i class="bi bi-gear-fill"></i> Sửa</button></td>
                </tr>
            </tbody>
        </table>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>