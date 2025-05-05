import { callApi } from "../../apiService.js";
import { showAddAccount, importUsers } from "./addAccount.js";
import { deleteAccount } from "./deleteAccount.js";


async function addRoleNameForUsers(users){
    let response = await callApi("/role");    
    let roles = response.data;

    roles.forEach((role) => {
        users.forEach((user) => {
            if(user.roleID === role.roleID){
                user.roleName = role.roleName;
            }
        })
    })
}

//hàm render ra nội dung submenu tài khoản
export async function  renderContentUser(){
    document.querySelector("#content").innerHTML = `
        <!-- Header Card -->
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-body text-center py-4">
                <h3 class="mb-0 fw-bold text-primary">Quản lý tài khoản</h3>
            </div>
        </div>

        <!-- Main Content Card -->
        <div class="card shadow-sm border-0 content-account">
            <div class="card-body p-0" id="container-account">
                
                <!-- Action Buttons Section -->
                <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <!-- Phần input file -->
                        <div class="me-2">
                            <input type="file" class="form-control import-user-input" accept=".xlsx, .xls" name="importFile" id="importFile">
                        </div>
                        
                        <!-- Phần select role -->
                        <div class="me-2">
                            <select class="form-select role-select" required>
                                
                            </select>
                        </div>
                        
                        <!-- Phần button import -->
                        <div>
                            <button type="button" class="btn btn-primary import-user" id="import-account">
                                <i class="bi bi-upload"></i> Import
                            </button>
                        </div>
                    </div>

                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-danger" id="delete-account">
                            <i class="bi bi-trash"></i> Xóa tài khoản
                        </button>
                        <button class="btn btn-primary add-user-button" id="add-account">
                            <i class="bi bi-plus-circle"></i> Thêm tài khoản
                        </button>
                    </div>
                </div>

                 <!-- Filter Section -->
                <div class="p-4 border-bottom">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0 fw-bold">Bộ lọc tìm kiếm</h5>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary btn-sm delete-filter-user">
                                <i class="bi bi-x-circle"></i> Xóa lọc
                            </button>
                            <button class="btn btn-primary btn-sm filter-user">
                                <i class="bi bi-funnel"></i> Áp dụng
                            </button>
                        </div>
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <select class="form-select role-select" id="role-select">
                                    <option value="all" selected>Tất cả</option>
                                    <!-- Các vai trò sẽ được thêm vào đây -->
                                </select>
                                <label for="role-select">Vai trò</label>
                            </div>
                        </div>
                        
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <select class="form-select status-select" id="status-select">
                                    <option value="all" selected>Tất cả</option>
                                    <option value="1">Đang hoạt động</option>
                                    <option value="0">Đã bị khóa</option>
                                </select>
                                <label for="status-select">Tình trạng</label>
                            </div>
                        </div>
                        
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <input type="date" class="form-control date-create" id="from-date-create">
                                <label for="date-create">Từ</label>
                            </div>
                        </div>
                        
                         <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <input type="date" class="form-control date-create" id="to-date-create">
                                <label for="date-create">Đến</label>
                            </div>
                        </div>
                       
                    </div>
                </div>
                
                <!-- Table Section -->
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th width="40" class="text-center">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input choose-all-user" id="choose-all-user">
                                    </div>
                                </th>
                                <th>Email</th>
                                <th>Họ tên</th>
                                <th>Vai trò</th>
                                <th>Ngày tạo</th>
                                <th>Tình trạng</th>
                                <th class="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                            <!-- Dữ liệu mẫu -->
                           
                          
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination Section -->
                <div class="p-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-muted fs-sm">Hiển thị 1-10 trong tổng số 25 tài khoản</span>
                    </div>
                    <nav aria-label="Page navigation">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item disabled">
                                <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Trước</a>
                            </li>
                            <li class="page-item active" aria-current="page">
                                <a class="page-link" href="#">1</a>
                            </li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#">Sau</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    `;

    //render option vai trò
    let response = await callApi("/role");    
    let roles = response.data;
    roles.forEach((role) => {
        document.querySelectorAll(".role-select").forEach((option) => {
            option.innerHTML += `
                <option value="${role.roleID}">${role.roleName}</option>
            `
        })
    })

    await renderListUsers();
    deleteAccount();
    showAddAccount();
    importUsers();
    // handleClickFilter();
    // handleImportUsers();
    // handleSearchEmail(users.data);
    // handleAddUserButton();
    // handleDeleteUserButton();


    // Chức năng xử lý checkbox
    const chooseAllCheckbox = document.getElementById('choose-all-user');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    // console.log(userCheckboxes);
    
    // Xử lý sự kiện khi click vào checkbox "chọn tất cả"
    chooseAllCheckbox.addEventListener('change', function() {
        userCheckboxes.forEach(checkbox => {
            // console.log(checkbox);
            checkbox.checked = this.checked;
        });
    });

    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(userCheckboxes).every(cb => cb.checked);
            chooseAllCheckbox.checked = allChecked;
        });
    });
    
}


//hàm render ra list user
export async function renderListUsers(){
    let users = [];
    try {
        const response = await callApi(`/user`);
        users = response.data;
        // console.log(users);
    } catch (error) {
        console.log("lỗi khi lấy users", error);
        return;
    }
    await addRoleNameForUsers(users);
    console.log(users);

    if(users.length === 0){
        document.querySelector(".container-account table tbody").innerHTML = "Không có dữ liệu";
        return;
    }

    let bodyTable = ``;
    users.forEach((user) => {
        bodyTable += `
            <tr>
                <td class="text-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input user-checkbox" data-id="${user.email}">
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="fw-medium">${user.email}</div>
                    </div>
                </td>
                <td>${user.fullName}</td>
                <td>
                    <span class="badge bg-secondary">${user.roleName}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar-date text-muted me-1"></i>
                        <small>${user.dateCreate}</small>
                    </div>
                </td>
                <td>
                    <span class="badge ${user.status ? "bg-primary" : "bg-danger"}">${user.status ? "Hoạt động" : "Đã khóa"}</span>
                </td>
                <td>
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-primary edit-account">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-account">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success detail-account">
                            <i class="bi bi-unlock"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })

    document.querySelector("#user-table-body").innerHTML = bodyTable;

    handleClickMore(users);
}

//hàm xử lí việc ấn xem thông tin
function handleClickMore(data){    
    //khi ấn thông tin
    document.querySelectorAll(".detail-user").forEach((detailUser) => {
        detailUser.onclick = async function (e){
            e.preventDefault();
            const email = e.target.parentElement.parentElement.dataset.key;

            const user = data.filter((account) => {
                return account.email === email;
            })

            document.querySelector("#content").innerHTML = `
                <div class="container mt-4">
                    <!-- Nút Quay lại -->
                    <div class="mb-3">
                        <button class="btn btn-secondary back-account" onclick="history.back()">
                            <i class="bi bi-arrow-left"></i> Quay lại
                        </button>
                    </div>
                
                    <div class="row justify-content-center">
                        <div class="col-lg-8">
                            <!-- Thông tin người dùng -->
                            <div class="card p-3">
                                <div class="row g-0">
                                    <!-- Avatar & Info -->
                                    <div class="col-md-4 text-center d-flex flex-column align-items-center justify-content-center">
                                        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp" 
                                            alt="avatar" class="rounded-circle img-fluid" style="width: 150px;">
                                        <h5 class="my-3">${user[0].fullName}</h5>
                                    </div>
                
                                    <!-- Editable Fields -->
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Email</label>
                                                <div class="col-sm-9">
                                                    <input id="email" type="email" class="form-control" value="${user[0].email}">
                                                </div>
                                            </div>

                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Mật khẩu</label>
                                                <div class="col-sm-9">
                                                    <input id="password" type="text" class="form-control" value="${user[0].password}">
                                                </div>
                                            </div>
                
                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Số điện thoại</label>
                                                <div class="col-sm-9">
                                                    <input id="phone" type="text" class="form-control" value="${user[0].phone}">
                                                </div>
                                            </div>
                
                                            
                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Vai Trò</label>
                                                <div class="col-sm-9">
                                                    <select id="roleName" class="form-control">
                                                        <option value="createSurvey" ${user[0].roleName === 'Người tạo' ? 'selected' : ''}>Người tạo</option>
                                                        <option value="admin" ${user[0].roleName === 'Admin' ? 'selected' : ''}>Admin</option>
                                                        <option value="participateSurvey" ${user[0].roleName === 'Người tham gia' ? 'selected' : ''}>Người tham gia</option>
                                                    </select>
                                                </div>
                                            </div>
                                           <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Tình trạng</label>
                                                <div class="col-sm-9">
                                                    <select id="status" class="form-control">
                                                        <option value="1" ${user[0].status === 1 ? 'selected' : ''}>Đang hoạt động</option>
                                                        <option value="0" ${user[0].status === 0 ? 'selected' : ''}>Đã bị khóa</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Ngày tạo</label>
                                                <div class="col-sm-9">
                                                    <input disabled="true" type="text" class="form-control" value="${user[0].dateCreate}">
                                                </div>
                                            </div>

                                
                
                                            <div class="text-end">
                                                <button type="button" class="btn btn-success update-info-account">Save Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                
                            <!-- Bảng thông tin khóa học -->
                            <div class="card p-3 mt-3">
                                <h5 class="card-title">Danh sách các bài khảo sát đã tham gia</h5>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead class="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Tên khóa học</th>
                                                <th>Mã khóa</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>Lập trình Web</td>
                                                <td>WEB101</td>
                                                <td><span class="badge bg-success">Hoàn thành</span></td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>Cơ sở dữ liệu</td>
                                                <td>DB102</td>
                                                <td><span class="badge bg-warning">Đang học</span></td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td>Hệ điều hành</td>
                                                <td>OS103</td>
                                                <td><span class="badge bg-danger">Chưa học</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>
    
            `

            document.querySelector(".back-account").onclick = (e) => {
                e.preventDefault();
                renderContentUser();
            }

            handleClickSaveChanges(email);
        }
    })

    //khi ấn xóa
    document.querySelectorAll(".delete-user").forEach((user) => {
        user.onclick = () => {
            const key = user.parentElement.parentElement.dataset.key;
            handleDelete([key]);
        }
    })
}

//hàm xử lí việc ấn button lọc
function handleClickFilter(){
    document.querySelector(".filter-user").onclick = async function(){
        const roleId = document.querySelector(".role-select").value;
        const status = document.querySelector(".status-select").value;
        const dateCreate = new Date(document.querySelector(".date-create").value).getTime();
        const now = new Date().getTime();
        
        try {
            const response = await fetch(`${config.apiUrl}/user`);
            const users = await response.json();
    
            const listFiltered = users.data.filter((user) => {
                const userDate = new Date(user.dateCreate).getTime();
                return (
                    (user.roleId === roleId || roleId === "all")
                    && (user.status === parseInt(status) || status === "all")
                    && ((userDate >= dateCreate && userDate <= now) || isNaN(dateCreate))
                );
            })

            await renderListUsers(listFiltered);
        } catch (error) {
            console.log(error);   
        }
    }

    //khi ấn xóa lọc
    document.querySelector(".delete-filter-user").onclick = async function () {
        await renderContentUser();
    }
}

//hàm xử lý việc click thêm tài khoản thủ công
function handleAddUserButton(){
    document.querySelector(".add-user-button").onclick = () => {
        document.querySelector("#content").innerHTML = `
            <form>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email-add" placeholder="Nhập email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Mật khẩu</label>
                    <input type="password" class="form-control" id="password-add" placeholder="Nhập mật khẩu" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 add-user">Thêm tài khoản</button>
            </form>
        `
        document.querySelector(".add-user").onclick = async function(e){
            e.preventDefault();
            const email = document.querySelector("#email-add").value;
            const password = document.querySelector("#password-add").value;

            if(email === "" || password === "") return;

            const data = {
                email,
                password
            }
            
            try {
                const result = await fetch(`${config.apiUrl}/user`, {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const response = await result.json();
                const status = result.status;
                if(status === 201){
                    console.log('thành công');
                }
                else{
                    console.log("thất bại: " + response.message);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}

//hàm xử lý việc xóa user, arrUser là mảng các email
async function handleDelete(arrUser){
    if(arrUser.length === 0) return;

    await Promise.all(arrUser.map((email) => {
        return fetch(`${config.apiUrl}/user?email=${email}`, {
            method: 'DELETE',
            headers:{
                'Content-type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).catch(error => {
            console.log(error.message);
            return { error: error.message };
        })
    }))
    .then(responseArray => console.log(responseArray));
    
    await renderListUsers();
}

//hàm xử lí việc xóa tài khoản
function handleDeleteUserButton(){
    //xử lí việc click button xóa tài khoản
    document.querySelector(".delete-user-button").onclick = () => {
        let arr = [];
        document.querySelectorAll(".container-account table input").forEach((item) => {
            if(item.checked){
                if(item.dataset.key){
                    arr.push(item);
                }
            }
        });
        const arrKey = arr.map(item => item.dataset.key);
        handleDelete(arrKey);
    };
}

//hàm xử lý khi ấn nút chỉnh sửa và lưu thông tin
function handleClickSaveChanges(oldEmail){
    document.querySelector(".update-info-account").onclick = async function(){
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const phone = document.querySelector("#phone").value;
        const roleId = document.querySelector("#roleName").value;
        const status = document.querySelector("#status").value;
        const data = {
            email,
            password,
            phone,
            roleId,
            status
        }

        const result = await fetch(`${config.apiUrl}/user?email=${oldEmail}`,{
            method: 'PUT',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const response = await result.json();
        const statusCode = result.status;

        if (statusCode === 200) { 
            alert("thành công");
        } else {
            alert("thất bại");
        }
    }
}



//hàm xử lí tìm kiếm email
function handleSearchEmail(users){
    document.querySelector("#search-email").onkeyup = () => {
        const value = document.querySelector("#search-email").value.toLowerCase();
        if(value === ""){
            renderListUsers();
            return;
        }
        let result = [];
        result = users.filter(user => user.email.toLowerCase().includes(value));
        renderListUsers(result);
    }
}