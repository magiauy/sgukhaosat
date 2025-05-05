import { callApi } from "../../apiService.js";
import { renderListUsers } from "./userAdmin.js";

// import * as XLSX from "xlsx";

export function showAddAccount() {
    document.querySelector("#add-account").onclick = async function () {
        document.querySelector("#content").innerHTML = `
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">Thêm Tài Khoản Mới</h5>
                </div>
                <div class="card-body">
                    <form id="add-account-form">
                        <div class="mb-3">
                            <label for="email-add" class="form-label fw-bold">Email</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                <input type="email" class="form-control" id="email-add" placeholder="Nhập email" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password-add" class="form-label fw-bold">Mật khẩu</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="password-add" placeholder="Nhập mật khẩu" required>
                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="role-add" class="form-label fw-bold">Vai trò</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
                                <select class="form-select" id="role-select" required>
                                    
                                </select>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary add-user" id="add-account-submit">
                                <i class="fas fa-plus-circle me-2"></i>Thêm tài khoản
                            </button>
                            <button type="button" class="btn btn-secondary" id="cancel-add">
                                <i class="fas fa-times-circle me-2"></i>Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        try {
            let response = await callApi("/role");
            let roles = response.data;
            console.log(roles);
            roles.forEach(role => {
                document.querySelector("#role-select").innerHTML += `<option value="${role.roleID}">${role.roleName}</option>`;
            });
        } catch (error) {
            console.log(error);
            return;
        }

        document.querySelector(".toggle-password").addEventListener("click", function() {
            const passwordInput = document.querySelector("#password-add");
            const icon = this.querySelector("i");
            
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });

        addAccount();
    }
}

function addAccount(){
    document.querySelector("#add-account-submit").onclick = async function(e){
        e.preventDefault();
        const email = document.querySelector("#email-add").value;
        const password = document.querySelector("#password-add").value;
        const role = document.querySelector("#role-select").value;

        const data = {
            email: email,
            password: password,
            roleID: role
        };

        // console.log(data);
        try {
            const response = await callApi("/user", "POST", data);
            console.log(response);
            renderListUsers();
        } catch (error) {
            console.log(error);
        }
    }
}

//hàm xử lí ấn import file user
export function importUsers(){
    document.querySelector("#import-account").onclick = async function(e){
        e.preventDefault();

        const inputFile = document.querySelector(".import-user-input");
        const file = inputFile.files[0];
        if(!file)  return;

        const result = await fetch(`${config.apiUrl}/user`);
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
            }

            console.log(dataArr)
           try {
                const response = await callApi("/user", "POST", dataArr);
                renderListUsers();
                console.log(response);
           } catch (error) {
                console.log(error);
           }

        
        }
        reader.readAsArrayBuffer(file);
    }
}