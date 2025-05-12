import { callApi } from '../../apiService.js';
import { renderTableOnPagination } from './roleAdmin.js';
import { updateRole } from './editRole.js';

export function showPopupAddRole() {
    document.querySelector('#add-role-button').onclick = async function() {
        showFormRole();
    };
}

export async function showFormRole(roleID){
    let permissions = [];
    try {
        const response = await callApi('/permission');
        permissions = response.data;
    } catch (error) {
        console.error("Lỗi khi lấy tất cả quyền:", error);
    }
    
    // Sửa trong hàm showPopupAddRole()
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal fade" id="addRoleModal" tabindex="-1" aria-labelledby="addRoleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="addRoleModalLabel">
                        Tạo vai trò mới
                    </h5>
                    <button id="close-button" type="button" class="btn-close btn-close-white" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <form id="add-role-form">
                        <!-- Layout dọc -->
                        <div class="row g-3">
                            <!-- Phần tên vai trò -->
                            <div class="col-12">
                                <div class="mb-3">
                                    <label for="roleName" class="form-label fw-semibold">Tên vai trò <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="roleName" placeholder="Nhập tên vai trò...">
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="mb-3">
                                    <label for="roleID" class="form-label fw-semibold">ID vai trò <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="roleID" placeholder="Nhập ID vai trò...">
                                </div>
                            </div>
                            
                            <!-- Phần phân quyền có scroll -->
                            <div class="col-12">
                                <div class="permissions-section">
                                    <label class="form-label fw-semibold mb-2">Phân quyền</label>
                                    <div class="border rounded p-3 bg-light permissions-container" style="max-height: 400px; overflow-y: auto; position: relative; z-index: 1050;">
                                        <div class="accordion" id="permissionsAccordion">
                                            <!-- Quyền cấp cao sẽ được thêm vào đây -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="close-popup" type="button" class="btn btn-outline-secondary">
                        Hủy bỏ
                    </button>
                    <button type="button" id="save-role" class="btn btn-primary">
                        Tạo vai trò
                    </button>
                </div>
            </div>
        </div>
    </div>
    `);
    

    // Thêm vào phương thức showPopupAddRole() sau dòng addRoleModal.show()
    const addRoleModal = new bootstrap.Modal(document.getElementById('addRoleModal'));
    addRoleModal.show();

    // Tổ chức cấu trúc quyền
    const permRoot = permissions.find(perm => perm.permParent === null);
    
    const topLevelPermissions = permissions.filter(perm => perm.permParent === permRoot.permID);
    const midLevelPermissions = permissions.filter(perm => 
        topLevelPermissions.some(top => top.permID === perm.permParent)
    );
    const leafLevelPermissions = permissions.filter(perm =>
        midLevelPermissions.some(mid => mid.permID === perm.permParent) 
    );
    
    // Render cấu trúc quyền
    renderPermissionsStructure(topLevelPermissions, midLevelPermissions, leafLevelPermissions);
    closePopup();

    createRole();
        
    // Thêm vào hàm showPopupAddRole() sau khi modal được hiển thị
    // Điều chỉnh chiều cao container phân quyền dựa trên kích thước màn hình
    // Thay thế trong showPopupAddRole()
    function adjustPermissionsHeight() {
        const permissionsContainer = document.querySelector('.permissions-container');
        const modalBody = document.querySelector('.modal-body');
        const modalContent = document.querySelector('.modal-content');
        const modalHeader = document.querySelector('.modal-header');
        const modalFooter = document.querySelector('.modal-footer');
        const roleNameInput = document.querySelector('#roleName').parentElement;
        const roleIDInput = document.querySelector('#roleID').parentElement;
        
        // Tính toán không gian có sẵn cho phần permissions
        const modalHeight = modalContent.clientHeight;
        const headerHeight = modalHeader.clientHeight;
        const footerHeight = modalFooter.clientHeight;
        const roleNameHeight = roleNameInput.clientHeight;
        const roleIDHeight = roleIDInput.clientHeight;
        const labelHeight = 30; // Ước tính cho label "Phân quyền"
        const padding = 40; // Padding và margins
        
        // Tính toán chiều cao tối đa có thể cho container
        const maxAvailableHeight = modalHeight - headerHeight - footerHeight - roleNameHeight - roleIDHeight - labelHeight - padding;
        
        // Điều chỉnh chiều cao dựa trên kích thước màn hình
        let containerHeight;
        if (window.innerWidth < 768) {
            containerHeight = Math.min(300, maxAvailableHeight);
        } else if (window.innerWidth < 992) {
            containerHeight = Math.min(350, maxAvailableHeight);
        } else {
            containerHeight = Math.min(400, maxAvailableHeight);
        }
        
        // Áp dụng chiều cao
        permissionsContainer.style.maxHeight = `${containerHeight}px`;
    }

    // Thêm vào showPopupAddRole()
    // Đảm bảo tất cả tính năng hoạt động đúng
    document.getElementById('addRoleModal').addEventListener('shown.bs.modal', function () {
        adjustPermissionsHeight();
        
        // Xử lý accordion collapse event
        const accordions = document.querySelectorAll('.accordion-collapse');
        accordions.forEach(accordion => {
            accordion.addEventListener('shown.bs.collapse', function() {
                // Đảm bảo accordion được hiển thị trong vùng nhìn thấy
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 10);
            });
        });
    });

    window.addEventListener('resize', adjustPermissionsHeight);

    if(roleID){
        const response = await callApi(`/role/${roleID}`);
        const role = response.data;
        console.log(role);

        //gán giá trị 
        document.getElementById("roleName").value = role.role.roleName;
        document.getElementById("roleID").value = role.role.roleID;
        role.permissions.forEach((perm) => {
            // console.log(perm.permID);
            const checkbox = document.querySelector(`#perm-${perm.permID}`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.disabled = false;
            }
        });
        document.querySelector("#save-role").innerText = "Cập nhật vai trò";
        document.querySelector("#save-role").id = "update-role";
        updateRole(roleID);
        document.querySelector("#addRoleModalLabel").innerText = "Chỉnh sửa vai trò";
}
}


export function renderPermissionsStructure(topLevelPermissions, midLevelPermissions, leafLevelPermissions) {
    const container = document.querySelector("#permissionsAccordion");
    container.innerHTML = "";

    // Trong renderPermissionsStructure()
    const style = document.createElement('style');
    style.textContent = `
        .permission-checkbox {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }
        .permission-label {
            margin-left: 8px;
            flex-grow: 1;
        }
        .permission-item,
        .leaf-permission-item {
            display: flex;
            align-items: center;
            min-height: 32px;
            padding: 4px 8px;
        }
        .form-check {
            display: flex;
            align-items: center;
        }
        
        /* CSS cho scrollable permissions */
        .permissions-container {
            max-height: 400px;
            overflow-y: auto;
            scrollbar-width: thin; /* Firefox */
            position: relative;
            z-index: 1050; /* Đảm bảo dropdown hiển thị trên các phần tử khác */
        }
        
        /* Tùy chỉnh scrollbar cho Chrome/Edge/Safari */
        .permissions-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .permissions-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .permissions-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        .permissions-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* Đảm bảo các accordion không bị che khuất */
        .accordion-collapse {
            position: relative;
            z-index: 1055;
        }
        
        /* Đảm bảo accordion button không bị che khuất */
        .accordion-button {
            z-index: 1;
            position: relative;
        }
        
        /* Đảm bảo modal hiển thị trên cùng */
        #addRoleModal {
            z-index: 1060 !important;
        }
        
        .modal-backdrop {
            z-index: 1050 !important;
        }
    `;
    document.head.appendChild(style);

    topLevelPermissions.forEach((topPerm) => {
        const accordionId = `accordion-${topPerm.permID}`;
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item mb-3 border-0';

        const childPermissions = midLevelPermissions.filter(mid => mid.permParent === topPerm.permID)
            .flatMap(mid => leafLevelPermissions.filter(leaf => leaf.permParent === mid.permID));

        accordionItem.innerHTML = `
        <h4 class="accordion-header" id="heading-${topPerm.permID}">
            <div class="d-flex align-items-center w-100 py-2">
                <div class="form-check ms-3">
                    <input class="form-check-input permission-checkbox top-level-checkbox" type="checkbox" 
                           id="perm-${topPerm.permID}" data-level="top" 
                           data-id="${topPerm.permID}">
                </div>
                <button class="accordion-button collapsed shadow-none flex-grow-1 bg-light rounded" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#${accordionId}" 
                        aria-expanded="false" aria-controls="${accordionId}">
                    <div class="d-flex justify-content-between w-100 align-items-center pe-2">
                        <span class="fw-semibold">${topPerm.permName}</span>
                        <span class="badge bg-primary rounded-pill">${childPermissions.length} quyền</span>
                    </div>
                </button>
            </div>
        </h4>
        <div id="${accordionId}" class="accordion-collapse collapse" 
             aria-labelledby="heading-${topPerm.permID}" data-bs-parent="#permissionsAccordion">
            <div class="accordion-body p-0 pt-2">
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 p-2" id="group-${topPerm.permID}">
                    <!-- Mid-level permissions will be added here -->
                </div>
            </div>
        </div>
        `;

        container.appendChild(accordionItem);

        // Thêm mid-level permissions
        const relevantMidPerms = midLevelPermissions.filter(
            midPerm => midPerm.permParent === topPerm.permID
        );

        const midPermContainer = accordionItem.querySelector(`#group-${topPerm.permID}`);

        relevantMidPerms.forEach((midPerm) => {
            const midPermCol = document.createElement('div');
            midPermCol.className = 'col';

            const relevantLeafPerms = leafLevelPermissions.filter(
                leafPerm => leafPerm.permParent === midPerm.permID
            );

            midPermCol.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded">
                <div class="card-header bg-white py-2 border-bottom">
                    <div class="permission-item">
                        <div class="form-check">
                            <input class="form-check-input permission-checkbox mid-level-checkbox" type="checkbox" 
                                   id="perm-${midPerm.permID}" data-level="mid" 
                                   data-id="${midPerm.permID}" data-parent="${midPerm.permParent}"
                                   disabled>
                            <label class="permission-label fw-medium" for="perm-${midPerm.permID}">
                                ${midPerm.permName}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="card-body p-2">
                    <div class="d-flex flex-column gap-1" id="leaf-group-${midPerm.permID}">
                        <!-- Leaf permissions will be added here -->
                    </div>
                </div>
            </div>
            `;

            midPermContainer.appendChild(midPermCol);

            // Thêm leaf permissions
            const leafContainer = midPermCol.querySelector(`#leaf-group-${midPerm.permID}`);

            relevantLeafPerms.forEach((leafPerm) => {
                const leafItem = document.createElement('div');
                leafItem.className = 'leaf-permission-item';

                leafItem.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input permission-checkbox leaf-level-checkbox" type="checkbox" 
                           id="perm-${leafPerm.permID}" data-level="leaf" 
                           data-id="${leafPerm.permID}" data-parent="${leafPerm.permParent}"
                           disabled>
                    <label class="form-check-label permission-label" for="perm-${leafPerm.permID}">
                        ${leafPerm.permName}
                    </label>
                </div>
                `;

                leafContainer.appendChild(leafItem);
            });
        });
    });

    setupCheckboxHandlers();
}

  
function setupCheckboxHandlers() {
    // Xử lý checkbox cấp cao nhất
    document.querySelectorAll('.top-level-checkbox').forEach(topCheckbox => {
        topCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        const topId = this.dataset.id;
        
        // Bật/tắt tất cả checkbox con
        const midCheckboxes = document.querySelectorAll(`.mid-level-checkbox[data-parent="${topId}"]`);
        midCheckboxes.forEach(midCheckbox => {
            midCheckbox.disabled = !isChecked;
            midCheckbox.checked = isChecked;
            
            // Bật/tắt checkbox leaf level
            const midId = midCheckbox.dataset.id;
            const leafCheckboxes = document.querySelectorAll(`.leaf-level-checkbox[data-parent="${midId}"]`);
            leafCheckboxes.forEach(leafCheckbox => {
            leafCheckbox.disabled = !isChecked;
            leafCheckbox.checked = isChecked;
            });
        });
        });
        
        // Ngăn sự kiện click lan ra accordion button
        topCheckbox.addEventListener('click', e => e.stopPropagation());
    });

    // Xử lý checkbox cấp trung
    document.querySelectorAll('.mid-level-checkbox').forEach(midCheckbox => {
        midCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        const midId = this.dataset.id;
        
        // Bật/tắt tất cả checkbox leaf level
        const leafCheckboxes = document.querySelectorAll(`.leaf-level-checkbox[data-parent="${midId}"]`);
        leafCheckboxes.forEach(leafCheckbox => {
            leafCheckbox.disabled = !isChecked;
            leafCheckbox.checked = isChecked;
        });
        
        // Kiểm tra trạng thái checkbox cấp cao
        updateParentCheckboxState(this);
        });
        
        midCheckbox.addEventListener('click', e => e.stopPropagation());
    });

    // Xử lý checkbox cấp lá
    document.querySelectorAll('.leaf-level-checkbox').forEach(leafCheckbox => {
        leafCheckbox.addEventListener('change', function() {
        updateParentCheckboxState(this);
        });
        
        leafCheckbox.addEventListener('click', e => e.stopPropagation());
    });

    // Thêm vào cuối hàm setupCheckboxHandlers()
    // Xử lý sự kiện khi mở accordion để đảm bảo scroll hoạt động đúng
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(() => {
                // Đảm bảo container scroll tới phần accordion đang mở nếu cần
                const accordionBody = this.closest('.accordion-item').querySelector('.accordion-collapse');
                if (accordionBody.classList.contains('show')) {
                    accordionBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 350); // Đợi animation của Bootstrap hoàn thành
        });
    });
}

function updateParentCheckboxState(checkbox) {
const level = checkbox.dataset.level;

if (level === 'leaf') {
    // Cập nhật trạng thái checkbox mid level
    const midId = checkbox.dataset.parent;
    const midCheckbox = document.querySelector(`.mid-level-checkbox[data-id="${midId}"]`);
    const leafCheckboxes = document.querySelectorAll(`.leaf-level-checkbox[data-parent="${midId}"]`);
    
    const allChecked = Array.from(leafCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(leafCheckboxes).some(cb => cb.checked);
    
    midCheckbox.checked = allChecked;
    midCheckbox.indeterminate = someChecked && !allChecked;
    
    // Tiếp tục cập nhật lên top level
    updateParentCheckboxState(midCheckbox);
} 
else if (level === 'mid') {
    // Cập nhật trạng thái checkbox top level
    const topId = checkbox.dataset.parent;
    const topCheckbox = document.querySelector(`.top-level-checkbox[data-id="${topId}"]`);
    const midCheckboxes = document.querySelectorAll(`.mid-level-checkbox[data-parent="${topId}"]`);
    
    const allChecked = Array.from(midCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(midCheckboxes).some(cb => cb.checked || cb.indeterminate);
    
    topCheckbox.checked = allChecked;
    topCheckbox.indeterminate = someChecked && !allChecked;
}
}


function createRole() {
    document.querySelector("#save-role").onclick = async function(e) {
        e.preventDefault();
        
        let roleName = document.querySelector('#roleName').value;
        let roleID = document.querySelector('#roleID').value;
        let permissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.getAttribute('data-id'));
        
        if(permissions.length === 0){
            alert("Vui lòng chọn quyền");
            return;
        }

        if(roleName.trim() === ""){
            alert("Tên vai trò không được để trống");
            return;
        }

        if(!isUppercaseAlphaOnly(roleID)){
            alert("ID vai trò chỉ được chứa chữ cái in hoa và không có dấu");
            return;
        };

        let data = {
            roleName: roleName,
            roleID: roleID,
            permissions: permissions
        };
        // console.log(data);

        try {
            const response = await callApi('/role', 'POST', data);
            console.log(response);
            const modalElement = document.getElementById('addRoleModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Xóa modal khỏi DOM sau khi đã ẩn
            modalElement.addEventListener('hidden.bs.modal', function () {
                modalElement.remove();
                // Đảm bảo xóa .modal-backdrop nếu còn sót lại
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            });

            await renderTableOnPagination(0, 10);
           
        } catch (error) {
            console.error("Lỗi khi tạo vai trò:", error);
        }
    }
  
    
       
}

export function closePopup(){
    document.querySelector("#close-popup").onclick = function(e){
        e.preventDefault();
        const modalElement = document.getElementById('addRoleModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        // Xóa modal khỏi DOM sau khi đã ẩn
        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            // Đảm bảo xóa .modal-backdrop nếu còn sót lại
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
    }

    document.querySelector("#close-button").onclick = function(e){
        e.preventDefault();
        const modalElement = document.getElementById('addRoleModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        // Xóa modal khỏi DOM sau khi đã ẩn
        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            // Đảm bảo xóa .modal-backdrop nếu còn sót lại
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
    }
}

export function isUppercaseAlphaOnly(str) {
    // Regex: chỉ cho phép A-Z (chữ in hoa, không dấu)
    const regex = /^[A-Z]+$/;
    return regex.test(str);
}
