<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<div class="container mt-4">
    <h3 id="periodTitle"></h3>
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="periodToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
            </div>
        </div>
    </div>

    <div class="mb-3">
        <label for="startYearInput" class="form-label">Năm bắt đầu</label>
        <input type="number" class="form-control" id="startYearInput" placeholder="Năm bắt đầu">
    </div>

    <div class="mb-3">
        <label for="endYearInput" class="form-label">Năm kết thúc</label>
        <input type="number" class="form-control" id="endYearInput" placeholder="Năm kết thúc">
    </div>

    <button type="button" class="btn btn-primary" id="periodActionBtn"></button>
    <a href="#" class="btn btn-secondary ms-2" onclick="navigateToPeriodList()">Quay lại</a>
</div>
</body>
</html>
