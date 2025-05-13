import { callApi } from "../../apiService.js";
import { showSwalToast } from "../../form/utils/notifications.js";
import { renderFormDetailAccount } from "./detailAccount.js";



export function searchAccount(){
    document.querySelector("#search-button").onclick = async function(e){
        e.preventDefault();
        const email = document.querySelector("#id-search").value;
        if(email === ""){
            showSwalToast("Vui lòng nhập email", "warning");
            return;
        }

        try {
            let response = await callApi(`/user/id`, "POST", {email: email});
            // console.log(email)
            let account = response.data;
            if(!account){
                showSwalToast("Không tìm thấy tài khoản", "warning");
                return;
            }
            renderFormDetailAccount(account);
            document.querySelector("#id-search").value = "";
            showSwalToast("Tìm thấy tài khoản", "success");
        } catch (error) {
            showSwalToast("Có lỗi xảy ra khi tìm kiếm tài khoản", "error");
            console.error("Error fetching account data:", error);
        }

       
    }
}