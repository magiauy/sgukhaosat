import { callApi } from "../../apiService.js";
import { renderContentUser, renderListAccount } from "./accountAdmin.js";
import PaginationComponent from "../../component/pagination.js";
import { showSwalToast } from "../../form/utils/notifications.js";

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
        await renderTableAccountOnPagination(0, 10);
    }
    // Xử lý nút xóa lọc
    document.querySelector("#delete-filter-account").onclick = async function() {
        // Reset các trường lọc
        document.getElementById("role-select").value = "all";
        document.getElementById("status-select").value = "all";
        document.getElementById("sort-option").value = "created_desc";
        document.getElementById("create-from-date").value = "";
        document.getElementById("create-to-date").value = "";
        document.getElementById("update-from-date").value = "";
        document.getElementById("update-to-date").value = "";
        
        // Hiển thị lại dữ liệu không lọc
        await renderTableAccountOnPagination(0, 10);
        showSwalToast("Đã xóa bộ lọc", "success");
    };
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

        if(fromDateCreate && toDateCreate && new Date(fromDateCreate) > new Date(toDateCreate)) {
            showSwalToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "warning");
            return;
        }
        if(fromDateUpdate && toDateUpdate && new Date(fromDateUpdate) > new Date(toDateUpdate)) {
            showSwalToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "warning");
            return;
        }
        
        // Chuẩn bị dữ liệu lọc
        const filterData = {
            roleID: roleID,
            status: status,
            sortOrder: sortOrder,
            fromDateCreate: fromDateCreate,
            toDateCreate: toDateCreate,
            fromDateUpdate: fromDateUpdate,
            toDateUpdate: toDateUpdate,
            offset: offset,
            limit: limit,
            isFilter: 1,
            isSearch: 0,
            isStatus: 1,
            isRole: 1,
        };
        console.log(filterData);
        
        try {
            // Gọi API với dữ liệu lọc
            const response = await callApi("/user/pagination", "POST", filterData);
            const result = response.data;
            console.log(response);
        
            renderListAccount(result.accounts);
            pagination.render({
                currentPage: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(result.total / limit),
                limit: limit,
                totalItems: result.total
            });

            showSwalToast("Đã lọc tài khoản thành công", "success");
        } catch (error) {
            console.error("Lỗi khi lọc tài khoản:", error);
            // Hiển thị thông báo lỗi cho người dùng
        }
       
}
