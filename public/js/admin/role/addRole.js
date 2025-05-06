import { callApi } from '../../apiService.js';
import { renderContentRole } from './roleAdmin.js';

export function showPopupAddRole() {
    document.querySelector('#add-role-button').onclick = async function() {
        let permissions = [];
        try {
            const response = await callApi('/permission');
            permissions = response.data;
        } catch (error) {
            console.error("Lỗi khi lấy tất cả quyền:", error);
        }
        
       // Tạo modal với giao diện dọc
        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="addRoleModal" tabindex="-1" aria-labelledby="addRoleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
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
                                    
                                    <!-- Phần phân quyền -->
                                    <div class="col-12">
                                        <div class="permissions-section">
                                            <label class="form-label fw-semibold mb-2">Phân quyền</label>
                                            <div class="border rounded p-3 bg-light">
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
                                Lưu vai trò
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        
        // Hiển thị modal
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
            
    };
}


export function renderPermissionsStructure(topLevelPermissions, midLevelPermissions, leafLevelPermissions) {
    const container = document.querySelector("#permissionsAccordion");
    container.innerHTML = "";

    // Thêm CSS inline nếu cần
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


async function createRole() {
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
            document.querySelector("#addRoleModal").remove();
            document.querySelector(".modal-backdrop").remove();
            renderContentRole();
           
        } catch (error) {
            console.error("Lỗi khi tạo vai trò:", error);
        }
    }
  
    
       
}

export function closePopup(){
    document.querySelector("#close-popup").onclick = function(e){
        e.preventDefault();
        console.log(123);
        document.querySelector("#addRoleModal").remove();
        document.querySelector(".modal-backdrop").remove();
    }

    document.querySelector("#close-button").onclick = function(e){
        e.preventDefault();
        document.querySelector("#addRoleModal").remove();
        document.querySelector(".modal-backdrop").remove();
    }
}

export function isUppercaseAlphaOnly(str) {
    // Regex: chỉ cho phép A-Z (chữ in hoa, không dấu)
    const regex = /^[A-Z]+$/;
    return regex.test(str);
}
