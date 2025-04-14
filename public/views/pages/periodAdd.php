<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="cycleToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage">
                    <!-- Nội dung toast sẽ được cập nhật -->
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>                
        </div>
    </div>

    <div class="mb-3">
        <label for="start_year" class="form-label">Năm bắt đầu</label>
        <input type="number" id="start_year" class="form-control" min="1900" max="2100" placeholder="Nhập năm" required>
    </div>
    <div class="mb-3">
        <label for="end_year" class="form-label">Năm kết thúc</label>
        <input type="number" id="end_year" class="form-control" min="1900" max="2100" placeholder="Nhập năm" required>
    </div>

    <button type="button" class="btn btn-primary" onclick="addCycle()">Thêm</button>
</body>
<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center" id="pagination">
        <!-- Các nút phân trang sẽ được thêm vào đây -->
    </ul>
</nav>

</html>