import { callApi } from "../../apiService.js";
import { showSwalToast } from "../../form/utils/notifications.js";
import { renderTableAccountOnPagination } from "./accountAdmin.js";
import {selectedAccountIDs} from "./accountAdmin.js";
import { showConfirmPopup } from "../../showConfirmPopup.js";


export function deleteAccountSelected(){
    document.querySelector("#delete-selected-accounts").onclick = async function(e){
        e.preventDefault();
        const confirmed = await showConfirmPopup({
                title: 'Xác nhận xóa tài khoản',
                message: `Bạn có chắc chắn muốn xóa các tài khoản này không?`,
                type: 'danger',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });

            if(confirmed) {
                const emailsToDelete = Array.from(selectedAccountIDs);
                
                try {
                    const response = await callApi("/user", "DELETE", emailsToDelete);
                    console.log(response);
                    selectedAccountIDs.clear(); // Xóa danh sách ID đã chọn
                    renderTableAccountOnPagination(0, 10);
                    showSwalToast("Xóa tài khoản thành công", "success");
                } catch (error) {
                    showSwalToast("Có lỗi xảy ra khi xóa tài khoản", "error");
                    console.log(error);
                }
            }
        

    }
}
