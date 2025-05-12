import { callApi } from "../../apiService.js";
import { renderTableAccountOnPagination } from "./accountAdmin.js";
import {selectedAccountIDs} from "./accountAdmin.js";

export function deleteAccountSelected(){
    document.querySelector("#delete-selected-accounts").onclick = async function(e){
        e.preventDefault();
        // console.log(selectedAccountIDs.size)
        const emailsToDelete = Array.from(selectedAccountIDs);
        
        try {
            const response = await callApi("/user", "DELETE", emailsToDelete);
            console.log(response);
            selectedAccountIDs.clear(); // Xóa danh sách ID đã chọn
            renderTableAccountOnPagination(0, 10);
        } catch (error) {
            console.log(error);
        }

    }
}
