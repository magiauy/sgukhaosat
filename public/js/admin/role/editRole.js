import { callApi } from "../../apiService.js";
import { showSwalToast } from "../../form/utils/notifications.js";
import { closePopup, renderPermissionsStructure, showFormRole } from "./addRole.js";
import { renderContentRole } from "./roleAdmin.js";


export function showEditRole(){
    document.querySelectorAll(".edit-role").forEach((button) => {
        button.onclick = async (e) => {
            e.preventDefault();
            const roleID = button.getAttribute("data-code");
            await showFormRole(roleID);
            updateRole(roleID);
        }
    })
}

export async function updateRole(roleID) {
    document.querySelector("#update-role").onclick = async (e) => {
        e.preventDefault();
        const roleName = document.getElementById("roleName").value;
        const selectedPermissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.getAttribute("data-id"));
        console.log(selectedPermissions);

        const data = {
            roleName: roleName,
            roleID: roleID,
            permissionsCurrent: selectedPermissions
        };
        // console.log(data);
        try {
            const response = await callApi(`/role/id`, 'PUT', data);
            console.log(response);
            const modalElement = document.getElementById('addRoleModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Xóa modal khỏi DOM sau khi đã ẩn
            modalElement.addEventListener('hidden.bs.modal', function () {
                modalElement.remove();
                // Đảm bảo xóa .modal-backdrop nếu còn sót lại
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            });
            renderContentRole();
            showSwalToast("Cập nhật vai trò thành công!", "success");
        } catch (error) {
            showSwalToast("Cập nhật vai trò không thành công!", "error");
            console.error("Lỗi khi cập nhật vai trò:", error.response); 
        }
    }
}