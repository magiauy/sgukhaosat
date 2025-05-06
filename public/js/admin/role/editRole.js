import { callApi } from "../../apiService.js";
import { closePopup, renderPermissionsStructure } from "./addRole.js";
import { renderContentRole } from "./roleAdmin.js";


export function showEditRole(){
    document.querySelectorAll(".edit-role").forEach((button) => {
        button.onclick = async (e) => {
            e.preventDefault();
            const roleID = button.getAttribute("data-code");
            const response = await callApi(`/role/${roleID}`);
            const role = response.data;
            // console.log(role);


            let permissions = [];
            try {
                const response = await callApi('/permission');
                permissions = response.data;
            } catch (error) {
                console.error("Lỗi khi lấy tất cả quyền:", error);
            }
            
            // Tạo modal với giao diện dọc
            document.body.insertAdjacentHTML('beforeend', `
                <div class="modal fade" id="addRoleModal" tabindex="-1" aria-labelledby="addRoleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl modal-dialog-centered">
                        <div class="modal-content border-0 shadow">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="addRoleModalLabel">
                                    Tạo vai trò mới
                                </h5>
                                <button id="close-button" type="button" class="btn-close btn-close-white" aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-4">
                                <form id="add-role-form">
                                    <!-- Layout dọc -->
                                    <div class="row g-3">
                                        <!-- Phần tên vai trò -->
                                        <div class="col-12">
                                            <div class="mb-3">
                                                <label for="roleName" class="form-label fw-semibold">Tên vai trò <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="roleName" placeholder="Nhập tên vai trò...">
                                            </div>
                                        </div>
    
                                        <div class="col-12">
                                            <div class="mb-3">
                                                <label for="roleID" class="form-label fw-semibold">ID vai trò <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="roleID" placeholder="Nhập ID vai trò..." disabled>
                                            </div>
                                        </div>
                                        
                                        <!-- Phần phân quyền -->
                                        <div class="col-12">
                                            <div class="permissions-section">
                                                <label class="form-label fw-semibold mb-2">Phân quyền</label>
                                                <div class="border rounded p-3 bg-light">
                                                    <div class="accordion" id="permissionsAccordion">
                                                        <!-- Quyền cấp cao sẽ được thêm vào đây -->
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button id="close-popup" type="button" class="btn btn-outline-secondary">
                                    Hủy bỏ
                                </button>
                                <button type="button" id="save-role" class="btn btn-primary">
                                    Lưu vai trò
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            
            // Hiển thị modal
            const addRoleModal = new bootstrap.Modal(document.getElementById('addRoleModal'));
            addRoleModal.show();
    
            // Tổ chức cấu trúc quyền
            const permRoot = permissions.find(perm => perm.permParent === null);
            
            const topLevelPermissions = permissions.filter(perm => perm.permParent === permRoot.permID);
            const midLevelPermissions = permissions.filter(perm => 
                topLevelPermissions.some(top => top.permID === perm.permParent)
            );
            const leafLevelPermissions = permissions.filter(perm =>
                midLevelPermissions.some(mid => mid.permID === perm.permParent) 
            );
            
            // Render cấu trúc quyền
            renderPermissionsStructure(topLevelPermissions, midLevelPermissions, leafLevelPermissions);
            //gán giá trị 
            document.getElementById("roleName").value = role.role.roleName;
            document.getElementById("roleID").value = role.role.roleID;
            role.permissions.forEach((perm) => {
                console.log(perm.permID);
                const checkbox = document.querySelector(`#perm-${perm.permID}`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.disabled = false;
                }
            });

            
            closePopup();
            saveRole(roleID);
        }
    })
}

async function saveRole(roleID) {
    document.querySelector("#save-role").onclick = async (e) => {
        e.preventDefault();
        const roleName = document.getElementById("roleName").value;
        const selectedPermissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.getAttribute("data-id"));
        
        const data = {
            roleName: roleName,
            roleID: roleID,
            permissions: selectedPermissions
        };
        console.log(data);
        try {
            const response = await callApi(`/role/id`, 'PUT', data);
            console.log(response);
            document.querySelector("#addRoleModal").remove();
            document.querySelector(".modal-backdrop").remove();
            renderContentRole();
        } catch (error) {
            console.error("Lỗi khi cập nhật vai trò:", error.response); 
        }
    }
}