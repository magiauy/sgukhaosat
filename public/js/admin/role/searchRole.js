import { callApi } from "../../apiService.js";
import { showSwalToast } from "../../form/utils/notifications.js";
import { isUppercaseAlphaOnly, showFormRole, showPopupAddRole } from "./addRole.js";

export async function search(){
    document.querySelector("#search-button").addEventListener('click', async () => {
        const search = document.querySelector("#id-search").value;
        if(search === ""){
            showSwalToast("Vui lòng nhập tên vai trò!", "warning");
            return;
        }
        if(!isUppercaseAlphaOnly(search)){
            showSwalToast("Tên vai trò không hợp lệ!", "warning");
            return;
        }

        const data = {
            isFilter: 0,
            isSearch: 1,
            search: search
        }
        console.log(data);

        try {
            const response = await callApi(`/role/pagination`, "POST", data);
            const result = response.data;
            showSwalToast("Tìm kiếm thành công!", "success");
            console.log(result);

            await showFormRole(result.roles[0].roleID);
        } catch (error) {
            showSwalToast("Tìm kiếm không thành công!", "error");
            console.error("Error fetching roles:", error.message);
        }
    
    })
}