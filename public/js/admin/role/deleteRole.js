import { callApi } from "../../apiService.js";
import { renderTableOnPagination } from "./roleAdmin.js";
import { selectedRoleIDs } from "./roleAdmin.js";

//hàm xóa vai trò
export async function handleDeleteRole(){
    document.querySelectorAll(`.delete-role`).forEach((btn) => {
        btn.onclick = async function(){
            let roleID = btn.getAttribute('data-code');
            // console.log(roleID);
            try {
                let response = await callApi(`/role/id`, 'DELETE', [roleID]);
                console.log(response);
                await renderTableOnPagination(0, 10);
                selectedRoleIDs.delete(roleID);

            } catch (error) {
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
        try {
            // console.log(selectedRoleIds);
            let response = await callApi(`/role/id`, 'DELETE', selectedRoleIds);
            console.log(response);
            await renderTableOnPagination(0, 10);
            selectedRoleIDs.clear();
        } catch (error) {
            console.log("Lỗi khi xóa vai trò:", error);
        }          
       
    };
}