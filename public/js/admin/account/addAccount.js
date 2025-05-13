import { callApi } from "../../apiService.js";
import { renderListAccount, renderTableAccountOnPagination } from "./accountAdmin.js";
import ImportExcelAccount from "../../modal/ImportExcelAccount.js";

// import * as XLSX from "xlsx";

export function showAddAccount() {
    document.querySelector("#add-account-button").onclick = async function () {
        document.body.insertAdjacentHTML("beforeend",  `
        <div id="popup-add-account" style="display: flex; position: fixed; top: 0; left: 0; 
            width: 100vw; height: 100vh; background: rgba(0,0,0,0.6);
            align-items: center; justify-content: center; z-index: 9999;
            animation: fadeIn 0.3s ease-in-out;">
            
            <div style="background: white; border-radius: 8px; min-width: 400px; max-width: 90%;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden;
                transform: translateY(0); animation: slideIn 0.3s ease-out;">
                
                <!-- Header -->
                <div style="background: #4361ee; color: white; padding: 15px 20px; 
                    display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Thêm Tài Khoản Mới</h3>
                    <button id="close-popup" style="background: none; border: none; color: white; 
                        font-size: 20px; cursor: pointer; padding: 0; display: flex;">✕</button>
                </div>
                
                <!-- Form content -->
                <div style="padding: 20px;">
                    <form id="add-account-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <!-- Email field -->
                        <div>
                            <label for="account-email" style="display: block; margin-bottom: 6px; 
                                font-weight: 500; color: #333;">Email:</label>
                            <div style="position: relative;">
                                
                                <input type="email" id="account-email" required 
                                    style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; 
                                    border-radius: 6px; font-size: 15px; box-sizing: border-box;
                                    transition: border-color 0.2s; outline: none;"
                                    placeholder="Nhập địa chỉ email"
                                    onFocus="this.style.borderColor='#4361ee'" 
                                    onBlur="this.style.borderColor='#ddd'">
                            </div>
                        </div>
                        
                        <!-- Password field -->
                        <div>
                            <label for="account-password" style="display: block; margin-bottom: 6px; 
                                font-weight: 500; color: #333;">Mật khẩu:</label>
                            <div style="position: relative;">
                               
                                <input type="password" id="account-password" required 
                                    style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd;
                                    border-radius: 6px; font-size: 15px; box-sizing: border-box;
                                    transition: border-color 0.2s; outline: none;"
                                    placeholder="Nhập mật khẩu"
                                    onFocus="this.style.borderColor='#4361ee'" 
                                    onBlur="this.style.borderColor='#ddd'">
                               
                            </div>
                        </div>
                        
                        <!-- Role selection -->
                        <div>
                            <label for="account-role" style="display: block; margin-bottom: 6px;
                                font-weight: 500; color: #333;">Vai trò:</label>
                            <div style="position: relative;">
                              
                                <select id="account-role" 
                                    style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd;
                                    border-radius: 6px; font-size: 15px; box-sizing: border-box; 
                                    appearance: none; background-color: white;
                                    background-image: url('data:image/svg+xml;utf8,<svg fill=\"%236b7280\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24px\" height=\"24px\"><path d=\"M7 10l5 5 5-5z\"/></svg>');
                                    background-repeat: no-repeat; background-position: right 10px center;
                                    transition: border-color 0.2s; outline: none;"
                                    onFocus="this.style.borderColor='#4361ee'" 
                                    onBlur="this.style.borderColor='#ddd'">
                                   
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Footer with buttons -->
                <div style="padding: 15px 20px; border-top: 1px solid #eee; 
                    display: flex; justify-content: flex-end; gap: 10px; background-color: #f9fafb;">
                    <button id="cancel-account" 
                        style="padding: 10px 16px; border: 1px solid #ddd; background: white;
                        border-radius: 6px; cursor: pointer; font-weight: 500; color: #4b5563;
                        transition: all 0.2s;"
                        onMouseOver="this.style.backgroundColor='#f3f4f6'" 
                        onMouseOut="this.style.backgroundColor='white'">
                        Hủy
                    </button>
                    <button id="add-account-submit" 
                        style="padding: 10px 16px; border: none; background: #4361ee;
                        border-radius: 6px; cursor: pointer; font-weight: 500; color: white;
                        transition: all 0.2s;"
                        onMouseOver="this.style.backgroundColor='#3a56d4'" 
                        onMouseOut="this.style.backgroundColor='#4361ee'">
                        Thêm tài khoản
                    </button>
                </div>
            </div>
        </div>
        `);

        try {
            let response = await callApi("/role");
            let roles = response.data;
            // console.log(roles);
            roles.forEach(role => {
                document.querySelector("#account-role").innerHTML += `<option value="${role.roleID}">${role.roleName}</option>`;
            });
        } catch (error) {
            console.log(error);
            return;
        }

        addAccount();
        closePopup();
    }
}

function addAccount(){
    document.querySelector("#add-account-submit").onclick = async function(e){
        e.preventDefault();
        const email = document.querySelector("#account-email").value;
        const password = document.querySelector("#account-password").value;
        const role = document.querySelector("#account-role").value;

        const data = {
            email: email,
            password: password,
            roleID: role
        };

        // console.log(data);
        try {
            const response = await callApi("/user", "POST", data);
            console.log(response);
            document.querySelector("#popup-add-account").remove();
            // document.querySelector("#add-account").click();
            await renderTableAccountOnPagination(0, 10);
        } catch (error) {
            console.log(error);
        }
    }
}

function closePopup(){
    document.querySelector("#close-popup").onclick = () => {
        document.querySelector("#popup-add-account").remove();
    }

    document.querySelector("#cancel-account").onclick = () => {
        document.querySelector("#popup-add-account").remove();
    }
}

//hàm xử lí ấn import file user
export function importUsers(){
    document.querySelector("#import-accounts-button").onclick = async function(e){
        e.preventDefault();
        // console.log(123)
        const importAccount = new ImportExcelAccount(config);
        importAccount.open();
    }
} 