import { callApi } from "../../apiService.js";
import { renderContentUser, renderListUsers } from "./userAdmin.js";

//hàm xử lí việc ấn button lọc
export function filterAccount(){
    document.querySelector("#filter-button").onclick = async function(){
        const roleID = document.querySelector(".role-select").value;
        const status = document.querySelector(".status-select").value;
        const dateFrom = new Date(document.querySelector("#from-date-create").value).getTime();
        const dateTo = new Date(document.querySelector("#to-date-create").value).getTime();
        // const now = new Date().getTime();

        const isFromValid = !isNaN(dateFrom);
        const isToValid = !isNaN(dateTo);
        
        // Nếu chỉ chọn 1 trong 2, báo lỗi
        if ((isFromValid && !isToValid) || (!isFromValid && isToValid)) {
            alert("Vui lòng nhập đầy đủ cả ngày bắt đầu và ngày kết thúc!");
            return;
        }
        
        let users = [];
        try {
            const response = await callApi("/user", "GET");
            users = response.data;
        } catch (error) {
            console.log(error);   
        }
        const listFiltered = users.filter((user) => {
            const userDate = new Date(user.dateCreate).getTime();
            return (
                (user.roleID === roleID || roleID === "all")
                && (user.status === parseInt(status) || status === "all")
                && ((userDate >= dateFrom && userDate <= dateTo ) || (isNaN(dateTo) && isNaN(dateFrom)))
            );
        })

        // console.log(listFiltered);
        renderListUsers(listFiltered);
    
    }

    //khi ấn xóa lọc
    document.querySelector(".delete-filter-user").onclick = async function () {
        renderContentUser();
    }
}
