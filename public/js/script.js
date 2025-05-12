import { callApi } from "./apiService.js";
import { renderFormDetailAccount } from "./admin/account/detailAccount.js";

document.addEventListener("DOMContentLoaded", async () => {
    const logout = document.getElementById('logout');
    if (logout) {
        logout.onclick =  async function (e){
            // e.preventDefault();
            console.log("Logout clicked");
            sessionStorage.clear();
            document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            await fetch(`${config.apiUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        };
    }
})


function handleClickInformation(){
    if(!document.querySelector("#btn-information")) return;
    document.querySelector("#btn-information").onclick = async (e) => {
        e.preventDefault();
        let response = await callApi('/me', "POST");
        let account = response.data;
        account = account.user;
        console.log(account)
        const modalHTML = `
      <div class="modal fade" id="accountDetailModal" tabindex="-1" aria-labelledby="accountDetailModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-xl">
              <div class="modal-content">
                  <!-- Header -->
                  <div class="modal-header">
                      <h5 class="modal-title" id="accountDetailModalLabel">
                          <i class="bi bi-person-badge me-2"></i>
                          Thông tin tài khoản
                      </h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  
                  <!-- Form content -->
                  <div class="modal-body p-4">
                      <div class="row">
                          <!-- Phần bên trái: Thông tin tài khoản -->
                          <div class="col-md-6 border-end pe-4">
                              <form id="account-detail-form">
                                  <!-- Row 1: Email and Full Name -->
                                  <div class="row mb-3">
                                      <!-- Email field -->
                                      <div class="col-md-12 mb-3">
                                          <label for="account-email" class="form-label fw-medium">Email:</label>
                                          <div class="input-group">
                                              <span class="input-group-text bg-light">
                                                  <i class="bi bi-envelope"></i>
                                              </span>
                                              <input type="email" id="account-email" class="form-control" 
                                                  value="${account.email || ''}" disabled>
                                          </div>
                                      </div>
                                      
                                      <!-- fullName field -->
                                      <div class="col-md-12 mb-3">
                                          <label for="account-fullName" class="form-label fw-medium">Họ tên:</label>
                                          <div class="input-group">
                                              <span class="input-group-text bg-light">
                                                  <i class="bi bi-person"></i>
                                              </span>
                                              <input type="text" id="account-fullName" class="form-control" 
                                                  value="${account.fullName || ''}" disabled>
                                          </div>
                                      </div>
                                  
                                      <!-- Phone field -->
                                      <div class="col-md-12 mb-3">
                                          <label for="account-phone" class="form-label fw-medium">Số điện thoại:</label>
                                          <div class="input-group">
                                              <span class="input-group-text bg-light">
                                                  <i class="bi bi-telephone"></i>
                                              </span>
                                              <input type="text" id="account-phone" class="form-control" 
                                                  value="${account.phone || ''}" disabled>
                                          </div>
                                      </div>

                                       <!-- Position field -->
                                      <div class="col-md-12">
                                          <label for="account-position" class="form-label fw-medium">Chức vụ:</label>
                                          <div class="input-group">
                                              <span class="input-group-text bg-light">
                                                  <i class="bi bi-briefcase"></i>
                                              </span>
                                              <select id="account-position" class="form-select" disabled>
                                                  <!-- Options will be populated via JavaScript -->
                                              </select>
                                          </div>
                                      </div>
                                  </div>
                              </form>
                              
                              <!-- Buttons for personal info section -->
                              <div class="d-flex justify-content-end mt-4 pt-3 border-top">
                                  <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">
                                      <i class="bi bi-x-circle me-2"></i>Đóng
                                  </button>
                                  <button type="button" class="btn btn-primary" id="detail-edit-information">
                                      <i class="bi bi-pencil-square me-2"></i>Sửa thông tin
                                  </button>
                              </div>
                          </div>
                          
                          <!-- Phần bên phải: Đổi mật khẩu -->
                          <div class="col-md-6 ps-4">
                              <form id="change-password-form">
                                  <!-- Mật khẩu hiện tại -->
                                  <div class="mb-3">
                                      <label for="current-password" class="form-label fw-medium">Mật khẩu hiện tại:</label>
                                      <div class="input-group">
                                          <span class="input-group-text bg-light">
                                              <i class="bi bi-key"></i>
                                          </span>
                                          <input type="password" id="current-password" class="form-control" 
                                              placeholder="Nhập mật khẩu hiện tại">
                                          <button class="btn btn-outline-secondary toggle-password" type="button">
                                              <i class="bi bi-eye"></i>
                                          </button>
                                      </div>
                                      <div class="invalid-feedback" id="current-password-error"></div>
                                  </div>
                                  
                                  <!-- Mật khẩu mới -->
                                  <div class="mb-3">
                                      <label for="new-password" class="form-label fw-medium">Mật khẩu mới:</label>
                                      <div class="input-group">
                                          <span class="input-group-text bg-light">
                                              <i class="bi bi-lock"></i>
                                          </span>
                                          <input type="password" id="new-password" class="form-control" 
                                              placeholder="Nhập mật khẩu mới">
                                          <button class="btn btn-outline-secondary toggle-password" type="button">
                                              <i class="bi bi-eye"></i>
                                          </button>
                                      </div>
                                  </div>
                                  
                                  <!-- Xác nhận mật khẩu mới -->
                                  <div class="mb-3">
                                      <label for="confirm-password" class="form-label fw-medium">Xác nhận mật khẩu:</label>
                                      <div class="input-group">
                                          <span class="input-group-text bg-light">
                                              <i class="bi bi-lock-fill"></i>
                                          </span>
                                          <input type="password" id="confirm-password" class="form-control" 
                                              placeholder="Nhập lại mật khẩu mới">
                                          <button class="btn btn-outline-secondary toggle-password" type="button">
                                              <i class="bi bi-eye"></i>
                                          </button>
                                      </div>
                                      <div class="invalid-feedback" id="confirm-password-error"></div>
                                  </div>
                                  
                                  <!-- Button đổi mật khẩu -->
                                  <div class="d-grid gap-2 mt-4 pt-3 border-top">
                                      <button type="button" class="btn btn-primary" id="change-password-btn">
                                          <i class="bi bi-shield-check me-2"></i>Đổi mật khẩu
                                      </button>
                                  </div>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
        // Thêm modal vào body
        document.body.insertAdjacentHTML("beforeend", modalHTML);

        // Lấy position
        let positions = await callApi("/position");
        positions = positions.data;

        const positionSelect = document.querySelector("#account-position");
        positions.forEach((position) => {
            positionSelect.insertAdjacentHTML("beforeend", `
                <option value="${position.PositionID}" ${account.position === position.PositionID ? "selected" : ""}>${position.PositionName}</option>
            `);
        });
        
        // Khởi tạo modal Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('accountDetailModal'));
        modal.show();
        
        // Xử lý đóng modal
        document.getElementById('accountDetailModal').addEventListener('hidden.bs.modal', function () {
            // Xóa modal khỏi DOM sau khi đóng
            this.remove();
        });
        
        // Xử lý chức năng hiện/ẩn mật khẩu
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');
                
                // Chuyển đổi kiểu input
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        });

        handleClickEditInformation();
        handleClickChangePassword(account);

        
    }
}

handleClickInformation();

function handleClickEditInformation(){
    document.querySelector("#detail-edit-information").onclick = async (e) => {
        e.preventDefault();
        document.querySelector("#detail-edit-information").innerText = "Lưu";
        document.querySelector("#detail-edit-information").id = "detail-save-information";
        document.querySelector("#account-fullName").disabled = false;
        document.querySelector("#account-phone").disabled = false;
        document.querySelector("#account-position").disabled = false;
        
        document.querySelector("#detail-save-information").onclick = async (e) => {
            e.preventDefault();
            const email = document.querySelector("#account-email").value;
            const fullName = document.querySelector("#account-fullName").value;
            const phone = document.querySelector("#account-phone").value;
            const position = document.querySelector("#account-position").value;

            let data = {
                email,
                fullName,
                phone,
                position
            }
            console.log(data);
            try {
                let response = await callApi('/user/information', "POST", data);
                console.log(response); 
                document.querySelector("#username").innerText = data.fullName;
               // Tắt modal
                const modalElement = document.getElementById('accountDetailModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
            } catch (error) {
               console.log(error); 
            }
        
        }
    }
}

function handleClickChangePassword(account){
    document.querySelector("#change-password-btn").onclick = async (e) => {
        e.preventDefault();
        const currentPassword = document.querySelector("#current-password").value;
        const newPassword = document.querySelector("#new-password").value;
        const confirmPassword = document.querySelector("#confirm-password").value;

        if(newPassword !== confirmPassword){
            alert("Mật khẩu mới không khớp");
            return;
        }

        let data = {
            account,
            currentPassword,
            newPassword,
            email: account.email
        }
        console.log(data);
        
        try {
            let response = await callApi('/user/password', "PUT", data);
            console.log(response); 
            alert("Đổi mật khẩu thành công");
            document.querySelector("#current-password").value = "";
            document.querySelector("#new-password").value = "";  
            document.querySelector("#confirm-password").value = "";
        } catch (error) {
            console.log(error);
        }
    }
}
