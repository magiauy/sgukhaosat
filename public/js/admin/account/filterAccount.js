import { callApi } from "../../apiService.js";
import { renderContentUser, renderListAccount } from "./accountAdmin.js";
import PaginationComponent from "../../component/pagination.js";

const pagination = new PaginationComponent({
    containerId: 'pagination-account',
    onPageChange: (offset, limit) => {
        renderTableAccountOnPagination(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        renderTableAccountOnPagination(offset, limit);
    },
});
//hàm xử lí việc ấn button lọc
export function filterAccount() {
    document.getElementById("filter-account").onclick = async function() {
        renderTableAccountOnPagination(0, 10);
    }
    // Xử lý nút xóa lọc
    document.querySelector("#delete-filter-account").addEventListener("click", function() {
        // Reset các trường lọc
        document.getElementById("role-select").value = "all";
        document.getElementById("status-select").value = "all";
        document.getElementById("sort-select").value = "created_desc";
        document.getElementById("from-date-create").value = "";
        document.getElementById("to-date-create").value = "";
        document.getElementById("from-date-update").value = "";
        document.getElementById("to-date-update").value = "";
        
        // Hiển thị lại dữ liệu không lọc
        renderTableAccountOnPagination(0, 10);
    });
}

async function renderTableAccountOnPagination(offset, limit) {
   // Lấy giá trị từ các trường lọc
        const roleID = document.getElementById("role-select").value;
        const status = document.getElementById("status-select").value;
        const sortOrder = document.getElementById("sort-option").value;
        const fromDateCreate = document.getElementById("create-from-date").value;
        const toDateCreate = document.getElementById("create-to-date").value;
        const fromDateUpdate = document.getElementById("update-from-date").value;
        const toDateUpdate = document.getElementById("update-to-date").value;
        
        // Chuẩn bị dữ liệu lọc
        const filterData = {
            roleId: roleID,
            status: status,
            sortOrder: sortOrder,
            fromDateCreate: fromDateCreate,
            toDateCreate: toDateCreate,
            fromDateUpdate: fromDateUpdate,
            toDateUpdate: toDateUpdate,
            offset: 0,
            limit: 10,
            isFilter: 1,
            isSearch: 0
        };
        console.log(filterData);
        
        try {
            // Gọi API với dữ liệu lọc
            const response = await callApi("/users/pagination", "POST", filterData);
            const result = response.data;
            console.log(response);
        
           
        } catch (error) {
            console.error("Lỗi khi lọc tài khoản:", error);
            // Hiển thị thông báo lỗi cho người dùng
        }
        renderListAccount(result.users);
            pagination.render({
                currentPage: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(result.total / limit),
                limit: limit,
                totalItems: result.total
            });
}
