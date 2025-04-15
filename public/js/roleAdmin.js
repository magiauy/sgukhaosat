export function renderContentRole(){
    document.querySelector("#content").innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center mb-4">
            <h3 class="mb-0">Quản lí phân quyền</h3>
        </div>

        <!-- Div dưới: nội dung -->
        <div class="bg-white p-4 rounded shadow content-role">
           <div class="row">
                <!-- Khối 1 -->
                <div class="col-md-6 mb-4">
                    <div class="border rounded p-3">
                    <!-- Phần đầu: checkbox lớn -->
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="mainPermission1">
                        <label class="form-check-label fw-bold" for="mainPermission1">
                        Quản lý người dùng
                        </label>
                    </div>

                    <!-- Phần 2: checkbox nhỏ -->
                    <div class="ms-4">
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission1-1">
                        <label class="form-check-label" for="subPermission1-1">
                            Thêm người dùng
                        </label>
                        </div>
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission1-2">
                        <label class="form-check-label" for="subPermission1-2">
                            Sửa người dùng
                        </label>
                        </div>
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission1-3">
                        <label class="form-check-label" for="subPermission1-3">
                            Xóa người dùng
                        </label>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Khối 2 -->
                <div class="col-md-6 mb-4">
                    <div class="border rounded p-3">
                    <!-- Phần đầu: checkbox lớn -->
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="mainPermission2">
                        <label class="form-check-label fw-bold" for="mainPermission2">
                        Quản lý bài viết
                        </label>
                    </div>

                    <!-- Phần 2: checkbox nhỏ -->
                    <div class="ms-4">
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission2-1">
                        <label class="form-check-label" for="subPermission2-1">
                            Thêm bài viết
                        </label>
                        </div>
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission2-2">
                        <label class="form-check-label" for="subPermission2-2">
                            Sửa bài viết
                        </label>
                        </div>
                        <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="subPermission2-3">
                        <label class="form-check-label" for="subPermission2-3">
                            Xóa bài viết
                        </label>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

        </div>
    `
    clickBtn();

}

async function contentTable(){
    const request = await fetch(`${config.apiUrl}/role`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' 
        }
    });
    const response = await request.json();

    const arrRoles = response.data;
    
    arrRoles.forEach((role) => {
        document.querySelector(".content-role table tbody").innerHTML += `
            <tr data-email=${role.roleName}>
                <td>${role.roleName}</td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
            </tr>
        `        
    })
}

function clickBtn(){
    document.querySelector("#permission-for-role").onclick = () => {
        document.querySelector(".content-role").innerHTML = `
            <div class="d-flex justify-content-center gap-3 mb-4">
                <button class="btn btn-outline-primary" onclick="showContent('user')">User</button>
                <button class="btn btn-outline-primary" onclick="showContent('form')">Form</button>
                <button class="btn btn-outline-primary" onclick="showContent('chuky')">Chu kỳ</button>
            </div>
            <div class="table-responsive mb-4">
                <table class="table table-bordered table-striped text-center">
                <thead class="table-light">
                    <tr>
                    <th>Email</th>
                    <th>Thêm</th>
                    <th>Xóa</th>
                    <th>Chỉnh sửa</th>
                    <th>Xem</th>
                    </tr>
                </thead>
                <tbody>
                
                </tbody>
                </table>
            </div>
            <div class="d-flex justify-content-center gap-3 mb-4">
                <button class="btn btn-success btn-save-role">Lưu thay đổi</button>
                <button class="btn btn-danger">Xóa thay đổi</button>
            </div>
        `

        contentTable();
        clickBtnSaveRole();
    }
}

function clickBtnSaveRole(){
    document.querySelector(".btn-save-role").onclick = () => {
        document.querySelectorAll(".content-role table tbody tr").forEach((tr) => {
            tr.querySelectorAll("td input").forEach((input, index) => {
                if(index==1){
                    console.log(input);
                    if(input.checked){
                        console.log("ok");
                        console.log(input.parentElement.parentElement.getAttribute("data-email"));
                    }
                }
                
            })
        })       
    }
}