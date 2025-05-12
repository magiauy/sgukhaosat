import { callApi } from "../../apiService.js";
import { renderFormDetailAccount } from "./detailAccount.js";



export function searchAccount(){
    document.querySelector("#search-button").onclick = async function(e){
        e.preventDefault();
        const email = document.querySelector("#id-search").value;
        if(email === ""){
            return;
        }

        try {
            let response = await callApi(`/user/id`, "POST", {email: email});
            // console.log(email)
            let account = response.data;
            if(!account){
                alert("No account found with this email");
                return;
            }
            renderFormDetailAccount(account);
            document.querySelector("#id-search").value = "";
        } catch (error) {
            console.error("Error fetching account data:", error);
        }

       
    }
}