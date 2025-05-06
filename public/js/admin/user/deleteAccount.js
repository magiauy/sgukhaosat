import { callApi } from "../../apiService.js";
import { renderListUsers } from "./userAdmin.js";

export function deleteAccount(){
    document.querySelector("#delete-account").onclick = async function(){
        const arrID = Array.from(document.querySelectorAll(".user-checkbox:checked")).map((checkbox) => {
            return checkbox.getAttribute("data-id");
        });
        if(arrID.length === 0) {
            return;
        }
       try {
            const response = await callApi("/user", "DELETE", arrID);
            console.log(response);
            renderListUsers();
       } catch (error) {
            console.log(error);
       }

    }

    document.querySelectorAll(".delete-account-i").forEach((i) => {
        i.onclick = async () => {
            const id = i.getAttribute("data-id");
            try {
                const response = await callApi("/user", "DELETE", [id]);
                console.log(response);
                renderListUsers();
            } catch (error) {
                console.log(error);
            }

        }
    })
}