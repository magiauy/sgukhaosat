import { callApi } from "../../apiService.js";
import { renderContentRole } from "./roleAdmin.js";

//hàm xóa vai trò
export function handleDeleteRole(){
    document.querySelectorAll(`.delete-role`).forEach((btn) => {
        btn.onclick = async function(){
            let roleID = btn.getAttribute('data-code');
            // console.log(roleID);
            try {
                let response = await callApi(`/role/id`, 'DELETE', [roleID]);
                console.log(response);
                renderContentRole();
            } catch (error) {
                console.log("Lỗi khi xóa vai trò:", error);
            }
        }
    })
}

export function handleDeleteSelectedRoles() {
    const deleteSelectedBtn = document.getElementById('delete-selected-roles');
    deleteSelectedBtn.onclick = async function() {
        const selectedRoleIds = Array.from(document.querySelectorAll('.role-checkbox:checked'))
            .map(cb => cb.getAttribute('data-id'));
        try {
            let response = await callApi(`/role/id`, 'DELETE', selectedRoleIds);
            // console.log(response);
            renderContentRole();
        } catch (error) {
            console.log("Lỗi khi xóa vai trò:", error);
        }          
       
    };
}