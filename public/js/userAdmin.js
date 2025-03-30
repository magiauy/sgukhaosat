export async function  renderContentUser(){
    const response = await fetch("http://localhost:8000/api/getListUsers");
    const users = await response.json();

    let totalCreateSurvey = users.data.filter((user) => {
        return user.roleName === "Người tạo";
    }).length
    let totalParticipateSurvey =  users.data.filter((user) => {
        return user.roleName === "Người tham gia";
    }).length
    let totalAdmin = users.data.filter((user) => {
        return user.roleName === "Admin";
    }).length

    document.querySelector("#content").innerHTML = `
        <div class="container my-4 container-account">
            <!-- Thống kê tài khoản -->
            <section class="row text-center">
                <div class="col-md-4">
                    <div class="p-3 bg-white shadow-sm rounded">
                        <h4 class="text-primary">${totalCreateSurvey}</h4>
                        <p class="text-muted">Người tạo khảo sát</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 bg-white shadow-sm rounded">
                        <h4 class="text-success">${totalParticipateSurvey}</h4>
                        <p class="text-muted">Người làm khảo sát</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 bg-white shadow-sm rounded">
                        <h4 class="text-danger">${totalAdmin}</h4>
                        <p class="text-muted">Admin</p>
                    </div>
                </div>
            </section>

           <!-- Bộ lọc -->
            <section class="mt-4 bg-white p-3 shadow-sm rounded">
                <h5 class="mb-3">Bộ lọc</h5>
                <div class="row">
                    <div class="col-md-2">
                        <select class="form-select role-select">
                            <option selected>Vai trò</option>
                            <option value="1">Người tạo</option>
                            <option value="2">Người tham gia</option>
                            <option value="3">Admin</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select department-select">
                            <option selected>Khoa</option>
                            <option value="CNTT">Công nghệ thông tin</option>
                            <option value="QTKD">Quản trị kinh doanh</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select status-select">
                            <option selected>Tình trạng</option>
                            <option value="1">Đang hoạt động</option>
                            <option value="2">Đã bị khóa</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <input type="datetime-local" class="form-control date-create">
                    </div>
                    <div class="col-md-3 d-flex justify-content-end gap-2">
                        <button class="btn btn-secondary delete-filter-user">Xóa lọc</button>
                        <button class="btn btn-primary filter-user">Lọc</button>
                    </div>
                </div>
            </section>


            <!-- Quản lý tài khoản -->
           <section class="mt-4">
    <!-- Thanh công cụ chính -->
    <div class="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded">
        <h5 class="m-0">Quản lý tài khoản</h5>
        <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" placeholder="Tìm kiếm email" style="max-width: 200px;">
            <button class="btn btn-danger delete-user-button">Xóa tài khoản</button>
        </div>
    </div>

    <!-- Form nhập tài khoản (TÁCH RIÊNG) -->
    <form method="POST" enctype="multipart/form-data" class="mt-3">
        <div class="d-flex justify-content-end bg-white p-3 shadow-sm rounded">
            <input type="file" class="form-control me-2 import-user-input" accept=".xlsx, .xls" name="importFile" style="max-width: 300px;">
            <button type="button" class="btn btn-primary import-user-button">Import tài khoản</button>
        </div>
    </form>

    <!-- Bảng dữ liệu -->
    <div class="table-responsive mt-3">
        <table class="table table-hover table-bordered bg-white shadow-sm rounded">
            <thead class="table-dark text-center">
                <tr>
                    <th><input type="checkbox" class="choose-all-user"/></th>
                    <th>Email</th>
                    <th>Họ tên</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Tình trạng</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody class="text-center">
                <!-- Dữ liệu sẽ được thêm vào đây -->
            </tbody>
        </table>
    </div>
</section>


        </div>
    `;
    
    
    renderListUsers(users.data);
    handleClickFilter();
    handleImportUsers();

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

async function renderListUsers(users){
    if(!users){
        const response = await fetch("http://localhost:8000/api/getListUsers");
        users = await response.json();
        users = users.data;
    }

    if(users.length === 0){
        document.querySelector(".container-account table tbody").innerHTML = "Không có dữ liệu";
        return;
    }

    let bodyTable = ``;
    users.forEach((user) => {
        bodyTable += `
            <tr>
                <td><input type="checkbox" data-key="${user.email}" class="choose-user"/></td>
                <td>${user.email}</td>
                <td>${user.fullname}</td>
                <td>${user.roleName}</td>
                <td>${user.dateCreate}</td>
                <td><span class="badge bg-success">${user.status}</span></td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-light" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu" data-key="${user.email}">
                            <li><a class="dropdown-item detail-user" href="#"><i class="bi bi-info-circle me-2"></i>Thông tin</a></li>
                            <li><a class="dropdown-item text-danger delete-user" href="#"><i class="bi bi-trash me-2"></i>Xóa</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    })

    document.querySelector(".container-account table tbody").innerHTML = bodyTable;

    handleClickMore(users);

    document.querySelector(".choose-all-user").onchange = (e) => {
        console.log(document.querySelectorAll(".container-account table input"))
        document.querySelectorAll(".container-account table input").forEach((inputCheckbox) => {
            inputCheckbox.checked = e.target.checked;
        })
    }
}

function handleClickMore(data){
  
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
                                        <h5 class="my-3">${user[0].fullname}</h5>
                                        <p class="text-muted mb-1">${user[0].job}</p>
                                        <p class="text-muted mb-4">${user[0].address}</p>
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
                                                <label class="col-sm-3 col-form-label">Khoa</label>
                                                <div class="col-sm-9">
                                                    <input id="department" type="text" class="form-control" value="${user[0].department}">
                                                </div>
                                            </div>

                                            <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Vai Trò</label>
                                                <div class="col-sm-9">
                                                    <select id="roleName" class="form-control">
                                                        <option value="cs0001" ${user[0].roleName === 'Người tạo' ? 'selected' : ''}>Người tạo</option>
                                                        <option value="ad0001" ${user[0].roleName === 'Admin' ? 'selected' : ''}>Admin</option>
                                                        <option value="ps0001" ${user[0].roleName === 'Người tham gia' ? 'selected' : ''}>Người tham gia</option>
                                                    </select>
                                                </div>
                                            </div>
                                           <div class="row mb-3">
                                                <label class="col-sm-3 col-form-label">Tình trạng</label>
                                                <div class="col-sm-9">
                                                    <select id="status" class="form-control">
                                                        <option value="1" ${user[0].status === 'Đang hoạt động' ? 'selected' : ''}>Đang hoạt động</option>
                                                        <option value="2" ${user[0].status === 'Đã bị khóa' ? 'selected' : ''}>Đã bị khóa</option>
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

    document.querySelectorAll(".delete-user").forEach((user) => {
        user.onclick = () => {
            const key = user.parentElement.parentElement.dataset.key;
            handleDelete([key]);
        }
    })
}

function handleClickFilter(){
    document.querySelector(".filter-user").onclick = async function(){
        const department = document.querySelector(".department-select").options[document.querySelector(".department-select").selectedIndex].textContent;
        const role = document.querySelector(".role-select").options[document.querySelector(".role-select").selectedIndex].textContent;
        const status = document.querySelector(".status-select").options[document.querySelector(".status-select").selectedIndex].textContent;
        const dateCreate = new Date(document.querySelector(".date-create").value).getTime();
        const now = new Date().getTime();
        
        
        const response = await fetch("http://localhost:8000/api/getListUsers");
        const users = await response.json();

        const listFiltered = users.data.filter((user) => {
            const userDate = new Date(user.dateCreate).getTime();
            return (
                (user.department === department || department === "Khoa") 
                && (user.roleName === role || role === "Vai trò")
                && (user.status === status || status === "Tình trạng")
                && ((userDate >= dateCreate && userDate <= now) || isNaN(dateCreate))
            );
        })

        renderListUsers(listFiltered);
    }

    document.querySelector(".delete-filter-user").onclick = async function () {
        // const response = await fetch("http://localhost:8000/api/getListUsers");
        // const users = await response.json();

        // const department = document.querySelector(".department-select").options[document.querySelector(".department-select").selectedIndex].textContent;
        // const role = document.querySelector(".role-select").options[document.querySelector(".role-select").selectedIndex].textContent;
        // const status = document.querySelector(".status-select").options[document.querySelector(".status-select").selectedIndex].textContent;

        // const listFiltered = users.data.filter(() => {
        //     return true;
        // })

        // renderListUsers(listFiltered);
        renderContentUser();
    }
}


//hàm xử lý việc xóa user, arrUser là mảng các email
async function handleDelete(arrUser){
    if(arrUser.length === 0) return;

    await Promise.all(arrUser.map((email) => {
        return fetch(`http://localhost:8000/api/user?email=${email}`, {
            method: 'DELETE',
            headers:{
                'Content-type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).catch(error => {
            console.error(error.message);
            return { error: error.message };
        })
    }));
    
    renderListUsers();
}

//hàm xử lý khi ấn nút chỉnh sửa và lưu thông tin
function handleClickSaveChanges(oldEmail){
    document.querySelector(".update-info-account").onclick = async function(){
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const phone = document.querySelector("#phone").value;
        const roleId = document.querySelector("#roleName").value;
        const department = document.querySelector("#department").value;
        const status = document.querySelector("#status").options[document.querySelector("#status").selectedIndex].textContent;
        const data = {
            email,
            password,
            phone,
            roleId,
            department,
            status
        }

        const result = await fetch(`http://localhost:8000/api/user?email=${oldEmail}`,{
            method: 'PUT',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const response = await result.json();
        console.log(response);
        
    }
}

//hàm xử lí ấn import file user
function handleImportUsers(){
    document.querySelector(".import-user-button").onclick = async function(e){
        const inputFile = document.querySelector(".import-user-input");
        const file = inputFile.files[0];
        if(!file)  return;

        const result = await fetch("http://localhost:8000/api/user");
        const response = await result.json();
        const dataUser = response.data;

        // console.log(dataUser);
        const reader = new FileReader();
        reader.onload = async function (e){
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const dataArr = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

            //tạo thời gian ngay lúc import file user 
            const now = new Date();
            const dateTimeSQL = now.toISOString().slice(0, 19).replace("T", " ");
            dataArr.forEach((user) => {
                user.dateCreate = dateTimeSQL;
            })

            //gán roleId tương ứng với vai trò
            const objectRoleId = {
                "Người tham gia": "participateSurvey",
                "Người tạo": "createSurvey",
                "Admin": "admin"
            }
            dataArr.forEach((user) => {
                user.roleId = objectRoleId[user["vai trò"]];
                delete user["vai trò"];
            })

            //kiểm tra email nào bị trùng với database
            let usersExisted = [];
            dataArr.forEach((newUser) => {
                const value = dataUser.find(oldUser => oldUser["email"] === newUser["email"]);
                if(value !== undefined) usersExisted.push(value);
            })
            if(usersExisted.length > 0){
                alert("Kiểm tra console log f12");
                usersExisted.forEach((user) => {
                    console.log(user["email"]); // xử lí email bị trùng ở đây
                })
                return;
            };

            // console.log(dataArr)
            const result = await fetch("http://localhost:8000/api/user", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataArr)
            })
            const response = await result.json();

            if(response.data){
                renderListUsers();
                alert("Thành công");
               
            }
            else alert("Thất bại");
        }
        reader.readAsArrayBuffer(file);    
    }
}