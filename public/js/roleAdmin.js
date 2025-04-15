import { callApi } from "./apiService.js";

export async function renderContentRole(){
    document.querySelector("#content").innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center mb-4">
            <h3 class="mb-0">Quản lí phân quyền</h3>
        </div>

        <!-- Div dưới: nội dung -->
        <div class="bg-white p-4 rounded shadow content-role">
            <div class="row" id="container-permission-for-role">

            </div>
        </div>
    `

    showEnablePermissionOfCurrentUser();
  
   

   
    // clickBtn();

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

async function showEnablePermissionOfCurrentUser(){
    const responsePermissionCurrentUser = await callApi('/me', 'POST');
    let permissionsOfCurrentUser = responsePermissionCurrentUser.data;
    permissionsOfCurrentUser = permissionsOfCurrentUser.permissions;

    const responsePermission = await callApi('/permission');
    const permissionDatabase = responsePermission.data;
    
    let arrManagePerm = []; // mảng này chứa những thằng permission manage như mange_users, manaege_forms
    permissionDatabase.forEach((perm) => {
        if(perm.editable_by_permission_code !== null){
            arrManagePerm.includes(perm.editable_by_permission_code) ? arrManagePerm : arrManagePerm.push(perm);
        }
    })

    //lấy tên của từng manage_..., ví dụ manage_users có tên là Quản lý người dùng
    permissionDatabase.forEach((permDb) => {
        arrManagePerm.forEach((perm) => {
            if(permDb.permission_code === perm.editable_by_permission_code){
                perm.nameEditable = permDb.name;
            }
        })
    })

    arrManagePerm.forEach((perm) => {
        //kiểm tra thằng checkbox lớn đã tồn tại trong DOM chưa tránh trường hợp render bị trùng
        let checkExistEditable = document.querySelector(`#${perm.editable_by_permission_code}`);

        //render checkbox lớn
        if(checkExistEditable === null){
            document.querySelector('#container-permission-for-role').innerHTML +=`
                <div class="permission-group">
                    <div class="permission-header">
                        <input type="checkbox" id=${perm.editable_by_permission_code} disabled=true class="form-check-input me-2" />
                        <label for="permission1" class="form-check-label">${perm.nameEditable}</label>
                        <i class="fa-solid fa-chevron-down"></i>
                    </div>
                    <div class="permission-children ${perm.editable_by_permission_code}">
            
                    </div>
                </div>
            `

            // render option detail (checkbox nhỏ)
            arrManagePerm.forEach((permDetail) => {
                if(perm.editable_by_permission_code === permDetail.editable_by_permission_code){
                    // console.log(perm.editable_by_permission_code)
                    document.querySelector(`.${perm.editable_by_permission_code}`).innerHTML += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id=${permDetail.permission_code} disabled=true>
                            <label class="form-check-label" for=${permDetail.permission_code}>
                                ${permDetail.name}
                            </label>
                        </div>
                    `;
                }
            })

            //disabled nếu không có quyền
            permissionsOfCurrentUser.forEach((pemrOfCurrentUSer) => {
                if(pemrOfCurrentUSer.permID === perm.editable_by_permission_code){
                    // console.log(perm.editable_by_permission_code)
                    document.querySelector(`#${perm.editable_by_permission_code}`).disabled = false;
                    document.querySelectorAll(`.${perm.editable_by_permission_code} input`).forEach((input) => {
                        input.disabled = false;
                    })
                }
            })
        }

    })
    
}

