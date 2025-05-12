import { callApi } from "../../apiService.js";
import { renderContentUser } from "./accountAdmin.js";

export function showDetail() {
    document.querySelectorAll(".detail-account").forEach((detail) => {
        detail.onclick = async function(e) {
            e.preventDefault();
            const email = detail.getAttribute("data-id");
      
            try {
                let response = await callApi(`/user/id`, "POST", {email: email});
                let account = response.data;
                
                renderFormDetailAccount(account);
                
            } catch (error) {
                console.error("Không thể tải thông tin tài khoản:", error);
                alert("Có lỗi xảy ra khi tải thông tin tài khoản.");
            }
        };
    });
}

export async function renderFormDetailAccount(account) {
  // Tạo modal Bootstrap
  const modalHTML = `
      <div class="modal fade" id="accountDetailModal" tabindex="-1" aria-labelledby="accountDetailModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                  <!-- Header -->
                  <div class="modal-header">
                      <h5 class="modal-title" id="accountDetailModalLabel">
                          <i class="bi bi-person-badge me-2"></i>
                          Chi tiết tài khoản
                      </h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  
                  <!-- Form content -->
                  <div class="modal-body p-4">
                      <form id="account-detail-form">
                          <!-- Row 1: Email and Full Name -->
                          <div class="row mb-3">
                              <!-- Email field -->
                              <div class="col-md-6 mb-3 mb-md-0">
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
                              <div class="col-md-6">
                                  <label for="account-fullName" class="form-label fw-medium">Họ tên:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-person"></i>
                                      </span>
                                      <input type="text" id="account-fullName" class="form-control" 
                                          value="${account.fullName || ''}" disabled>
                                  </div>
                              </div>
                          </div>
                          
                          <!-- Row 2: Phone and Date -->
                          <div class="row mb-3">
                              <!-- Phone field -->
                              <div class="col-md-6 mb-3 mb-md-0">
                                  <label for="account-phone" class="form-label fw-medium">Số điện thoại:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-telephone"></i>
                                      </span>
                                      <input type="text" id="account-phone" class="form-control" 
                                          value="${account.phone || ''}" disabled>
                                  </div>
                              </div>
                              
                              <!-- DateCreate field -->
                              <div class="col-md-6">
                                  <label for="account-dateCreate" class="form-label fw-medium">Ngày tạo:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-calendar-date"></i>
                                      </span>
                                      <input type="text" id="account-dateCreate" class="form-control" 
                                          value="${account.created_at || ''}" disabled>
                                  </div>
                              </div>

                          </div>
                          
                          <!-- Row 3: Password and Role -->
                          <div class="row mb-3">
                              <!-- Password field -->
                              <div class="col-md-6 mb-3 mb-md-0">
                                  <label for="account-password" class="form-label fw-medium">Mật khẩu:</label>
                                  <button id="reset-password" class="btn btn-outline-secondary w-100" disabled>
                                      <i class="bi bi-key me-2"></i>
                                      Đặt lại mật khẩu
                                  </button>
                              </div>
                              
                              <div class="col-md-6">
                                <label for="account-dateUpdate" class="form-label fw-medium">Ngày cập nhật:</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="bi bi-calendar-date"></i>
                                    </span>
                                    <input type="text" id="account-dateUpdate" class="form-control" 
                                        value="${account.updated_at || ''}" disabled>
                                </div>
                              </div>
                              
                              
                          </div>
                          
                          <!-- Row 4: Status -->
                          <div class="row">
                              <!-- Status selection -->
                              <div class="col-md-6">
                                  <label for="account-status" class="form-label fw-medium">Trạng thái:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-toggle-on"></i>
                                      </span>
                                      <select id="account-status" class="form-select" disabled>
                                          <option value="1" ${account.status == 1 ? "selected" : ""}>Hoạt động</option>
                                          <option value="0" ${account.status == 0 ? "selected" : ""}>Khóa</option>
                                      </select>
                                  </div>
                              </div>

                              <!-- Role selection -->
                              <div class="col-md-6">
                                  <label for="account-role" class="form-label fw-medium">Vai trò:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-person-badge"></i>
                                      </span>
                                      <select id="account-role" class="form-select" disabled>
                                          <!-- Options will be populated via JavaScript -->
                                      </select>
                                  </div>
                              </div>
                          </div>

                          <!-- Row 5: -->
                          <div class="row">
                              
                            <div class="col-md-6">
                                  <label for="account-position" class="form-label fw-medium">Position:</label>
                                  <div class="input-group">
                                      <span class="input-group-text bg-light">
                                          <i class="bi bi-person"></i>
                                      </span>
                                      <input type="text" id="account-position" class="form-control" 
                                          value="${account.position || ''}" disabled>
                                  </div>
                              </div>
                              
                          </div>
                      </form>
                  </div>
                  
                  <!-- Footer with buttons -->
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                          <i class="bi bi-x-circle me-2"></i>Đóng
                      </button>
                      <button type="button" class="btn btn-primary" id="detail-edit-submit">
                          <i class="bi bi-pencil-square me-2"></i>Sửa
                      </button>
                  </div>
              </div>
          </div>
      </div>
  `;
  
  // Thêm modal vào body
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  
  // Lấy danh sách roles và thêm vào select
  let roles = await callApi("/role");
  roles = roles.data;
  
  const roleSelect = document.querySelector("#account-role");
  roles.forEach((role) => {
      roleSelect.insertAdjacentHTML("beforeend", `
          <option value="${role.roleID}" ${account.roleID === role.roleID ? "selected" : ""}>${role.roleName}</option>
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


  setUpHandlers(account);
}

function setUpHandlers(account) {
    edit(account);
    resetPassword(account);
}

export function edit(account){
    document.querySelector("#detail-edit-submit").onclick = async function(){
        document.querySelector("#account-role").disabled = false;
        document.querySelector("#account-status").disabled = false;
        document.querySelector("#reset-password").disabled = false;
        document.querySelector("#account-fullName").disabled = false;
        document.querySelector("#account-phone").disabled = false;
        document.querySelector("#account-position").disabled = false;

        document.querySelector("#detail-edit-submit").innerText = "Lưu";
        document.querySelector("#detail-edit-submit").id = "save-edit-submit";

        document.querySelector("#save-edit-submit").onclick = async () => {
            const roleID = document.querySelector("#account-role").value;
            const status = document.querySelector("#account-status").value;
            const fullName = document.querySelector("#account-fullName").value;
            const phone = document.querySelector("#account-phone").value;
            const position = document.querySelector("#account-position").value;
            
            const data = {
                email: account.email,
                roleID: roleID,      
                status: status,
                fullName: fullName,
                phone: phone,
                position: position   
            }
            // console.log(data);
            // let response = await callApi('/me', "POST");
            // let accountCurrent = response.data;
            // accountCurrent = accountCurrent.user;
            // if(accountCurrent.roleID === account.roleID){
            //     data.isResetToken = 1;
            // }
            try {
              const response = await callApi("/user", "PUT", data);
              // console.log(response);
              const modalElement = document.getElementById('accountDetailModal');
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance.hide(); // Ẩn modal

              renderContentUser();
            } catch (error) {
                console.log(error);
                return;
            }
        }
    }
}

export function resetPassword(){
    document.querySelector("#reset-password").onclick = async function(e){
        e.preventDefault();
        const email = document.querySelector("#account-email").value;
        const dataPassword = {
            email: email,
        }
        console.log(dataPassword);
        try {
            const response = await callApi("/user/password", "PUT", dataPassword);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
        document.querySelector("#reset-password").innerText = "Đã khôi phục";
        document.querySelector("#reset-password").disabled = true;
    }
}