import { callApi } from "../../apiService.js";
import { renderListUsers } from "./userAdmin.js";

export function deleteAccount(){
    document.querySelector("#delete-account").onclick = async function(){
        const arrID = Array.from(document.querySelectorAll(".user-checkbox:checked")).map((checkbox) => {
            return checkbox.getAttribute("data-id");
        });
        // console.log(arrID); 
       try {
            const response = await callApi("/user", "DELETE", arrID);
            console.log(response);
            renderListUsers();
       } catch (error) {
            console.log(error);
       }

    }
}