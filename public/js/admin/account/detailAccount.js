import { callApi } from "../../apiService.js";
import { renderContentUser } from "./accountAdmin.js";

export function showDetail(){
    document.querySelectorAll(".detail-account").forEach((detail) => {
        detail.onclick = async function(e){
            e.preventDefault();
            const email = detail.getAttribute("data-id");
            // console.log(email); 
            const response = await callApi(`/user/email?email=${email}`);
            const account = response.data;
            

            // console.log(users);
          
        
            document.body.insertAdjacentHTML("beforeend", `
                <div id="popup-detail-account" class="popup-overlay">
                  <div class="popup-container">
                    <!-- Header -->
                    <div class="popup-header">
                      <h3 class="popup-title">Thêm Tài Khoản Mới</h3>
                      <button id="close-popup" class="close-button">✕</button>
                    </div>
                    
                    <!-- Form content -->
                    <div class="popup-content">
                      <form id="add-account-form" class="form-container">
                        <!-- Row 1: Email and Full Name -->
                        <div class="form-row">
                          <!-- Email field -->
                          <div class="form-group">
                            <label for="account-email" class="form-label">Email:</label>
                            <div class="input-container">
                              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                              <input type="email" id="account-email" class="form-input" required 
                                value="${account.email}"
                                disabled>
                            </div>
                          </div>
              
                          <!-- fullName field -->
                          <div class="form-group">
                            <label for="account-fullName" class="form-label">Họ tên:</label>
                            <div class="input-container">
                              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <input type="email" id="account-fullName" class="form-input" required 
                                value="${account.fullName}"
                                disabled>
                            </div>
                          </div>
                        </div>
              
                        <!-- Row 2: Phone and Date -->
                        <div class="form-row">
                          <!-- Phone field -->
                          <div class="form-group">
                            <label for="account-phone" class="form-label">Số điện thoại:</label>
                            <div class="input-container">
                              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                              <input type="text" id="account-phone" class="form-input" required 
                                value="${account.phone}"
                                disabled>
                            </div>
                          </div>
              
                          <!-- DateCreate field -->
                          <div class="form-group">
                            <label for="account-dateCreate" class="form-label">Ngày tạo:</label>
                            <div class="input-container">
                              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <input type="text" id="account-dateCreate" class="form-input" required 
                                value="${account.dateCreate}"
                                disabled>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Row 3: Password and Role -->
                        <div class="form-row">
                          <!-- Password field -->
                          <div class="form-group">
                            <label for="account-password" class="form-label">Mật khẩu:</label>
                            <div class="input-container">
                              <button id="reset-password" class="reset-button" disabled>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: text-bottom;">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Đặt lại mật khẩu
                              </button>
                            </div>
                          </div>
                          
                          <!-- Role selection -->
                          <div class="form-group">
                            <label for="account-role" class="form-label">Vai trò:</label>
                            <div class="input-container">
                             
                              <select id="account-role" class="form-select" disabled>
                                <!-- Options will be populated via JavaScript -->
                              </select>
                            </div>
                          </div>
                        </div>
              
                        <!-- Row 4: Status and Empty (for balance) -->
                        <div class="form-row">
                          <!-- Status selection -->
                          <div class="form-group">
                            <label for="account-status" class="form-label">Trạng thái:</label>
                            <div class="input-container">
                             
                              <select id="account-status" class="form-select" disabled>
                                <option value="1" ${account.status == 1 ? "selected" : ""}>Hoạt động</option>
                                <option value="0" ${account.status == 0 ? "selected" : ""}>Khóa</option>
                              </select>
                            </div>
                          </div>
                          
                          <!-- Empty space for layout balance -->
                          <div class="form-group">
                            <!-- Intentionally left empty for layout balance -->
                          </div>
                        </div>
                      </form>
                    </div>
                    
                    <!-- Footer with buttons -->
                    <div class="popup-footer">
                      <button id="cancel-detail" class="cancel-button">
                        Đóng
                      </button>
                      <button id="detail-edit-submit" class="submit-button">
                        Sửa
                      </button>
                    </div>
                  </div>
                </div>
              `);
         


            let roleCurrent = await callApi(`/role/${account.roleID}`);
            roleCurrent = roleCurrent.data;
            roleCurrent = roleCurrent.role;

            let roles = await callApi("/role");
            roles = roles.data;
            // console.log(roles);
            roles.forEach((role) => {
                document.querySelector("#account-role").insertAdjacentHTML("beforeend", `
                    <option value="${role.roleID}" ${roleCurrent.roleID === role.roleID ? "selected" : ""}>${role.roleName}</option>
                `);
            })

            closePopup();
            edit(account);
            resetPassword(account);
            
        }
    })
}

export function closePopup(){
    document.querySelector("#cancel-detail").onclick = function(){
        const popup = document.querySelector("#popup-detail-account");
        if(popup){
            popup.remove();
        }
    }

    document.querySelector("#close-popup").onclick = function(){
        const popup = document.querySelector("#popup-detail-account");
        if(popup){
            popup.remove();
        }
    }

}

export function edit(account){
    document.querySelector("#detail-edit-submit").onclick = async function(){
        document.querySelector("#account-role").disabled = false;
        document.querySelector("#account-status").disabled = false;
        document.querySelector("#reset-password").disabled = false;

        document.querySelector("#detail-edit-submit").innerText = "Lưu";
        document.querySelector("#detail-edit-submit").id = "save-edit-submit";

        document.querySelector("#save-edit-submit").onclick = async () => {
            const roleID = document.querySelector("#account-role").value;
            const status = document.querySelector("#account-status").value;
            
            const data = {
                email: account.email,
                roleID: roleID,      
                status: status,
                fullName: account.fullName,
                phone: account.phone    
            }
            // console.log(data);

            try {
                const response = await callApi("/user", "PUT", data);
                // console.log(response);

                document.querySelector("#popup-detail-account").remove();
                renderContentUser();
            } catch (error) {
                console.log(error);
            }
        }
    }
}

export function resetPassword(account){
    document.querySelector("#reset-password").onclick = async function(e){
        e.preventDefault();
        document.querySelector("#reset-password").innerText = "Đã khôi phục";
        document.querySelector("#reset-password").disabled = true;

        const data = {
            email: account.email,
            roleID: account.roleID,
            fullName: account.fullName,
            dateCreate: account.dateCreate,
            status: account.status,
            phone: account.phone
        }

        console.log(data);
        try {
            const response = await callApi("/user/password", "PUT", data);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }
}