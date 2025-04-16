<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<div class="container mt-4">
    <h3 id="fTypeFormTitle"></h3>
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
        <div id="fTypeToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
            </div>
        </div>
    </div>

    <div class="mb-3" id="fTypeIDGroup">
        <label for="fTypeID" class="form-label">Mã loại khảo sát</label>
        <input type="text" id="fTypeID" class="form-control" required>
    </div>

    <div class="mb-3">
        <label for="fTypeName" class="form-label">Tên loại khảo sát</label>
        <input type="text" id="fTypeName" class="form-control" required>
    </div>

    <button type="button" class="btn btn-primary" id="fTypeActionBtn"></button>
    <a href="#" class="btn btn-secondary ms-2" onclick="navigateToFTypeList()">Quay lại</a>
</div>
</body>
</html>
