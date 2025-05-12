import { callApi } from "../../apiService.js";
import PaginationComponent from "../../component/pagination.js";
import { renderTableRole } from "./roleAdmin.js";
import { clearSelectedRoles } from "./roleAdmin.js";
import { showSwalToast } from "../../form/utils/notifications.js";

const pagination = new PaginationComponent({
    containerId: 'pagination-role',
    onPageChange: (offset, limit) => {
        renderTableOnFilterPagination(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        renderTableOnFilterPagination(offset, limit);
    },

});

export function filter(){
    document.querySelector("#filter-role").addEventListener('click', async () => {
       renderTableOnFilterPagination(0, 10);
       
    })

    document.querySelector("#delete-filter-role").onclick = async () => {
        document.querySelector("#create-from-date").value = "";
        document.querySelector("#create-to-date").value = "";
        document.querySelector("#update-from-date").value = "";
        document.querySelector("#update-to-date").value = "";
        document.querySelector("#sort-option").value = "created_desc";
        clearSelectedRoles(); // Xóa tất cả checkbox đã chọn
        renderTableOnFilterPagination(0, 10);
        showSwalToast("Xóa bộ lọc thành công!", "success");

    }
}

export async function renderTableOnFilterPagination(offset, limit){
    try {
        let fromDateCreate = document.querySelector("#create-from-date").value;
        let toDateCreate = document.querySelector("#create-to-date").value;
        let fromDateUpdate = document.querySelector("#update-from-date").value;
        let toDateUpdate = document.querySelector("#update-to-date").value;
        let option = document.querySelector("#sort-option").value;


        const data = {
            offset: offset,
            limit: limit,
            fromDateCreate: fromDateCreate,
            toDateCreate: toDateCreate,
            fromDateUpdate: fromDateUpdate,
            toDateUpdate: toDateUpdate,
            option: option,
            isFilter: 1,
            isSearch: 0
        }
        // console.log(data);

        let response = await callApi("/role/pagination", "POST", data);
        console.log(response);
        let result = response.data; // Lấy danh sách vai trò từ API
        showSwalToast("Lọc vai trò thành công!", "success");
        renderTableRole(result.roles);
        
        pagination.render({
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(result.total / limit),
            limit: limit,
            totalItems: result.total
        });

    } catch (error) {
        showSwalToast("Lọc vai trò không thành công!", "error");
        console.log(error);
    }
}