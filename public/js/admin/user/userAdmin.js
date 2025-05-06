import { callApi } from "../../apiService.js";
import { showAddAccount, importUsers } from "./addAccount.js";
import { deleteAccount } from "./deleteAccount.js";
import { showDetail } from "./detailAccount.js";
import { filterAccount } from "./filterAccount.js";
import { searchAccount } from "./searchAccount.js";


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
         <!-- Main Content Card -->
        <div class="card shadow border-0 content-account rounded-3">
            <div class="card-body p-0" id="container-account">
                
                <!-- Action Buttons Section -->
                <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
                    <div>  
                        <button type="button" class="btn btn-primary import-user rounded-pill px-4 py-2 min-width-150" id="import-account">
                            <i class="bi bi-upload me-2"></i> Import
                        </button>
                    </div>

                    <div class="d-flex gap-3">
                        <button class="btn btn-outline-danger rounded-pill px-4 py-2 min-width-150" id="delete-account">
                            <i class="bi bi-trash me-2"></i> Xóa tài khoản
                        </button>
                        <button class="btn btn-primary rounded-pill px-4 py-2 min-width-150 add-user-button" id="add-account">
                            <i class="bi bi-plus-circle me-2"></i> Thêm tài khoản
                        </button>
                    </div>
                </div>

                 <!-- Filter Section -->
                <div class="p-4 border-bottom bg-light bg-opacity-50 mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="mb-0 fw-bold text-primary">Bộ lọc</h5>
                        <div class="d-flex gap-3">
                            <button class="btn btn-outline-secondary delete-filter-user rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-x-circle me-1"></i> Xóa lọc
                            </button>
                            <button id="filter-button" class="btn btn-primary filter-user rounded-pill px-3 py-2 min-width-120">
                                <i class="bi bi-funnel me-1"></i> Áp dụng
                            </button>
                        </div>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <select class="form-select role-select rounded-3 input-height-60" id="role-select">
                                    <option value="all" selected>Tất cả</option>
                                    <!-- Các vai trò sẽ được thêm vào đây -->
                                </select>
                                <label for="role-select">Vai trò</label>
                            </div>
                        </div>
                        
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <select class="form-select status-select rounded-3 input-height-60" id="status-select">
                                    <option value="all" selected>Tất cả</option>
                                    <option value="1">Đang hoạt động</option>
                                    <option value="0">Đã khóa</option>
                                </select>
                                <label for="status-select">Tình trạng</label>
                            </div>
                        </div>
                        
                        <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <input type="date" class="form-control date-create rounded-3 input-height-60" id="from-date-create">
                                <label for="from-date-create">Từ</label>
                            </div>
                        </div>
                        
                         <div class="col-md-3 col-sm-6">
                            <div class="form-floating">
                                <input type="date" class="form-control date-create rounded-3 input-height-60" id="to-date-create">
                                <label for="to-date-create">Đến</label>
                            </div>
                        </div>
                       
                    </div>
                </div>

                 <div class="p-4 border-bottom mt-3">
                    <div class="row g-4">
                        <div class="col-md-9 col-sm-8">
                            <div class="form-floating">
                                <input type="text" class="form-control rounded-3 input-height-60" id="email-search" placeholder="Nhập email cần tìm">
                                <label for="email-search">Tìm kiếm theo email</label>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-4">
                            <div class="d-grid h-100">
                                <button class="btn btn-primary rounded-3 h-100 px-4 py-2" id="search-button">
                                    <i class="bi bi-search me-2"></i> Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Table Section -->
                <div class="table-responsive mt-3">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th width="40" class="text-center p-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input choose-all-user" id="choose-all-user">
                                    </div>
                                </th>
                                <th class="p-3">Email</th>
                                <th class="p-3">Họ tên</th>
                                <th class="p-3">Vai trò</th>
                                <th class="p-3">Ngày tạo</th>
                                <th class="p-3">Tình trạng</th>
                                <th class="text-center p-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                            <!-- Dữ liệu mẫu -->
                            <tr>
                                <td class="text-center p-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input">
                                    </div>
                                </td>
                                <td class="p-3">admin@gmail.com</td>
                                <td class="p-3">null</td>
                                <td class="p-3"><span class="badge bg-secondary py-2 px-3">Administrator</span></td>
                                <td class="p-3">2025-04-02 06:11:31</td>
                                <td class="p-3"><span class="badge bg-primary py-2 px-3">Hoạt động</span></td>
                                <td class="text-center p-3">
                                    <button class="btn btn-outline-primary btn-sm rounded-circle p-2 action-btn">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm rounded-circle p-2 action-btn ms-2">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-center p-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input">
                                    </div>
                                </td>
                                <td class="p-3">nguyenhuuhoa@gmail.com</td>
                                <td class="p-3">null</td>
                                <td class="p-3"><span class="badge bg-info py-2 px-3">Regular User</span></td>
                                <td class="p-3">2025-05-05 17:25:14</td>
                                <td class="p-3"><span class="badge bg-primary py-2 px-3">Hoạt động</span></td>
                                <td class="text-center p-3">
                                    <button class="btn btn-outline-primary btn-sm rounded-circle p-2 action-btn">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm rounded-circle p-2 action-btn ms-2">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination Section -->
                <div class="p-4 border-top d-flex justify-content-between align-items-center bg-light bg-opacity-25 mt-3">
                    <div>
                        <span class="text-muted">Hiển thị 1-10 trong tổng số 25 tài khoản</span>
                    </div>
                    <nav aria-label="Page navigation">
                        <ul class="pagination mb-0">
                            <li class="page-item disabled">
                                <a class="page-link rounded-start px-3" href="#" tabindex="-1" aria-disabled="true">Trước</a>
                            </li>
                            <li class="page-item active" aria-current="page">
                                <a class="page-link" href="#">1</a>
                            </li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link rounded-end px-3" href="#">Sau</a>
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

    await renderListUsers(null);
   
    showAddAccount();
    importUsers();
    filterAccount();
    searchAccount();
   
    // handleClickFilter();
    // handleImportUsers();
    // handleSearchEmail(users.data);
    // handleAddUserButton();
    // handleDeleteUserButton();


    
    
}


//hàm render ra list user
export async function renderListUsers(users){
    if(!users){
        try {
            const response = await callApi(`/user`);
            users = response.data;
            // console.log(users);
        } catch (error) {
            console.log("lỗi khi lấy users", error);
            return;
        }
    }

    await addRoleNameForUsers(users);

    if(users.length === 0){
        document.querySelector("#user-table-body").innerHTML = "Không có dữ liệu";
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
                        <button class="btn btn-sm btn-outline-primary detail-account" data-id=${user.email}>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-account delete-account-i" data-id=${user.email}>
                            <i class="bi bi-trash"></i>
                        </button>
                     
                    </div>
                </td>
            </tr>
        `;
    })

    document.querySelector("#user-table-body").innerHTML = bodyTable;

    // Chức năng xử lý checkbox
    const chooseAllCheckbox = document.getElementById('choose-all-user');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    
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


    deleteAccount();
    showDetail();
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