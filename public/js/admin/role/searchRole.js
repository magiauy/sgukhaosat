import { callApi } from "../../apiService.js";
import { isUppercaseAlphaOnly, showPopupAddRole } from "./addRole.js";

export async function search(){
    document.querySelector("#search-button").addEventListener('click', async () => {
        const search = document.querySelector("#id-search").value;
        if(search === ""){
            alert("Vui lòng nhập tên vai trò cần tìm kiếm!");
            return;
        }
        if(!isUppercaseAlphaOnly(search)){
            alert("Tên vai trò không hợp lệ! Vui lòng nhập lại!");
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
            console.log(result);

            showPopupAddRole(result);
        } catch (error) {
            console.error("Error fetching roles:", error.message);
        }
    
    })
}