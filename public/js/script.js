import { callApi } from "./apiService.js";
import { renderFormDetailAccount } from "./admin/account/detailAccount.js";

document.addEventListener("DOMContentLoaded", async () => {
    const logout = document.getElementById('logout');
    if (logout) {
        logout.addEventListener('click', async (e) => {
            // e.preventDefault();
            console.log("Logout clicked");
            sessionStorage.clear();
            document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        });
    }
})
function handleClickInformation(){
    if(!document.querySelector("#btn-information")) return;
    document.querySelector("#btn-information").onclick = async (e) => {
        e.preventDefault();
        let response = await callApi('/me', "POST");
        let account = response.data;
        account = account.user;
        console.log(account)
        await renderFormDetailAccount(account);
       
    }
}

handleClickInformation();
