import { callApi } from "../../apiService.js";
import { showSwalToast } from "../../form/utils/notifications.js";
import { renderTableOnPagination } from "./roleAdmin.js";
import { selectedRoleIDs } from "./roleAdmin.js";

//hàm xóa vai trò
export async function handleDeleteRole(){
    document.querySelectorAll(`.delete-role`).forEach((btn) => {
        btn.onclick = async function(){
            let roleID = btn.getAttribute('data-code');
            // console.log(roleID);
            const data = {
                roleIds: [roleID]
            }
            try {
                let response = await callApi(`/role/id`, 'DELETE', data);
                console.log(response);
                await renderTableOnPagination(0, 10);
                selectedRoleIDs.delete(roleID);
                showSwalToast("Xóa vai trò thành công!", "success");

            } catch (error) {
                showSwalToast("Xóa vai trò không thành công!", "error");
                console.log("Lỗi khi xóa vai trò:", error);
            }
        }
    })
}

export function handleDeleteSelectedRoles() {
    const deleteSelectedBtn = document.getElementById('delete-selected-roles');
    deleteSelectedBtn.onclick = async function(e) {
        e.preventDefault();
        const selectedRoleIds = Array.from(document.querySelectorAll('.role-checkbox:checked'))
            .map(cb => cb.getAttribute('data-id'));
        const data = {
            roleIds: selectedRoleIds
        }
        try {
            // console.log(selectedRoleIds);
            let response = await callApi(`/role/id`, 'DELETE', data);
            console.log(response);
            await renderTableOnPagination(0, 10);
            showSwalToast("Xóa vai trò thành công!", "success");
            selectedRoleIDs.clear();
        } catch (error) {
            showSwalToast("Xóa vai trò không thành công!", "error");
            console.log("Lỗi khi xóa vai trò:", error);
        }          
       
    };
}