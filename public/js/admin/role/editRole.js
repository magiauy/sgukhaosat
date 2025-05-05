import { callApi } from "../../apiService.js";
import { renderAddRoleForm } from "./addRole.js";
import { renderPermissionsStructure } from "./addRole.js";
import { setupCheckboxBehavior } from "./addRole.js";
import { renderContentRole } from "./roleAdmin.js";

export function showEditRoleUI(){
    document.querySelectorAll('.edit-role').forEach((btn) => {
        // console.log(btn);
        btn.onclick = async function(){
            let roleID = btn.getAttribute('data-code');
            let response = await callApi(`/role/${roleID}`, 'GET');
            let role = response.data;
            let permissions = []
            try {
                // Fetch permissions data
                const response = await callApi('/permission');
                permissions = response.data;
            } catch (error) {
                alert("Lỗi khi lấy tất cả quyền");
                return;
            }
                
            // Organize permissions hierarchy
            const topLevelPermissions = permissions.filter(perm => perm.parent_permission_code === null);
            const midLevelPermissions = permissions.filter(perm => 
                topLevelPermissions.some(top => top.permission_code === perm.parent_permission_code)
            );
            
            // Render the form UI
            renderAddRoleForm();
            
            // Populate permissions structure
            renderPermissionsStructure(topLevelPermissions, midLevelPermissions, permissions);
            
            // Set up event listeners for checkbox behavior
            setupCheckboxBehavior();

            // console.log(role);
            let roleName = role.role;
            roleName = roleName.roleName;

            document.querySelector('#roleName').value = roleName;
            role.permissions.forEach(permission => {
                const checkbox = document.querySelector(`#perm-${permission.permID}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            document.querySelector("#save-role").innerHTML = "Cập nhật quyền";

            handleUpdate(topLevelPermissions, roleID);
                
        }
    })
}


function handleUpdate(topLevelPermissions, roleID) {
    document.querySelector("#save-role").onclick = async function(e){
        e.preventDefault();

        let roleName = document.querySelector('#roleName').value;
        let permissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.getAttribute('data-code'));
        
        if(permissions.length === 0){
            alert("Vui lòng chọn quyền");
            return;
        }

        let data = {
            roleID: roleID,
            roleName: roleName,
            permissions: permissions
        };

        let check = false;
        topLevelPermissions.forEach(topPerm => {
            const inputTop = document.querySelector(`#perm-${topPerm.permission_code}`);
            if(inputTop.checked){
                document.querySelectorAll(`#group-${topPerm.permission_code} input[type=checkbox]`).forEach((input) => {
                    if(input.checked){
                        check = true;
                    }
                })
            }
        })
        if(!check){
            alert("Vui lòng chọn quyền phù hợp");
            console.log("Vui lòng chọn quyền phù hợp");
            return;
        }
        

        try {
            let response = await callApi(`/role/id`, 'PUT', data);
            console.log(response);
        } catch (error) {
            console.error("Error updating role:", error);
        }
    }

    // console.log(document.querySelector("#cancel-button"))
    document.querySelector("#cancel-button").onclick = function(e){
        e.preventDefault();
        renderContentRole();
    }
}