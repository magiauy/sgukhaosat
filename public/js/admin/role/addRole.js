import { callApi } from '../../apiService.js';
import { renderContentRole } from './roleAdmin.js';

//hàm render giao diện thêm vai trò
export function showAddRoleUI() {
    document.querySelector('#add-role-button').onclick = async function() {
        try {
            // Fetch permissions data
            const response = await callApi('/permission');
            const permissions = response.data;
            
            // Organize permissions hierarchy
            const topLevelPermissions = permissions.filter(perm => perm.parent_permission_code === null);
            const midLevelPermissions = permissions.filter(perm => 
                topLevelPermissions.some(top => top.permission_code === perm.parent_permission_code)
            );
            
            // Render the form UI
            renderAddRoleForm();
            
            // Populate permissions structure
            renderPermissionsStructure(topLevelPermissions, midLevelPermissions, permissions);
            
            // Set up event listeners for checkbox behavior
            setupCheckboxBehavior();
            
            // Add form submission handler
            setupFormSubmission(topLevelPermissions);
            
        } catch (error) {
            console.error("Error loading permissions:", error);
            showErrorMessage("Không thể tải dữ liệu quyền. Vui lòng thử lại sau.");
        }
    };
}

export function renderAddRoleForm() {
    document.querySelector('#content').innerHTML = `       
        <div class="row justify-content-center">
            <div class="col-md-10">
                <div class="card shadow-lg rounded-3 border-0 mb-4">
                    <div class="card-header bg-white py-3 border-0">
                        <h4 class="text-center fw-bold text-primary mb-0">
                            <i class="fas fa-user-tag me-2"></i>Tạo vai trò mới
                        </h4>
                    </div>
                    
                    <div class="card-body p-4">
                        <form id="add-role-form">
                            <!-- Tên vai trò -->
                            <div class="mb-4">
                                <label for="roleName" class="form-label fw-semibold">Tên vai trò</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0">
                                        <i class="fas fa-user-shield text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0 ps-0" 
                                           id="roleName" placeholder="Nhập tên vai trò" required>
                                </div>
                                <div class="form-text text-muted">Tên vai trò nên ngắn gọn và mô tả chức năng</div>
                            </div>

                            <!-- Chọn quyền -->
                            <div class="permissions-section mt-4">
                                <label class="form-label fw-semibold mb-3">
                                    <i class="fas fa-key me-2 text-primary"></i>Chọn quyền cho vai trò này
                                </label>
                                
                                <div class="alert alert-info py-2 px-3 d-flex align-items-center mb-3">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <small>Chọn các quyền phù hợp với vai trò. Bạn có thể chọn cả nhóm hoặc từng quyền riêng lẻ.</small>
                                </div>

                                <div class="permissions-container" id="permissions-container">
                                    <!-- Permissions will be added here dynamically -->
                                </div>
                            </div>

                            <div class="d-grid gap-2 mt-4">
                                <button id="save-role" type="submit" class="btn btn-primary py-2">
                                    <i class="fas fa-save me-2"></i>Tạo vai trò
                                </button>
                                <button type="button" class="btn btn-outline-secondary py-2" id="cancel-button">
                                    <i class="fas fa-times me-2"></i>Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderPermissionsStructure(topLevelPermissions, midLevelPermissions, allPermissions) {
    const container = document.querySelector("#permissions-container");
    
    topLevelPermissions.forEach((topPerm) => {
        // Create accordion item for each top-level permission
        const accordionId = `accordion-${topPerm.permission_code}`;
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item border mb-3 rounded-3 shadow-sm';
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading-${topPerm.permission_code}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#${accordionId}" aria-expanded="false" 
                        aria-controls="${accordionId}">
                    <div class="form-check mb-0 w-100">
                        <input class="form-check-input top-level-permission" type="checkbox" 
                               id="perm-${topPerm.permission_code}" 
                               data-code="${topPerm.permission_code}">
                        <label class="form-check-label fw-semibold ms-2" for="perm-${topPerm.permission_code}">
                            ${topPerm.name}
                        </label>
                    </div>
                </button>
            </h2>
            <div id="${accordionId}" class="accordion-collapse collapse" 
                 aria-labelledby="heading-${topPerm.permission_code}">
                <div class="accordion-body pt-0">
                    <div class="row permission-group mt-3" id="group-${topPerm.permission_code}">
                        <!-- Mid-level permissions will be added here -->
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(accordionItem);
        
        // Add mid-level permissions for this top-level permission
        const relevantMidPerms = midLevelPermissions.filter(
            midPerm => midPerm.parent_permission_code === topPerm.permission_code
        );
        
        const midPermContainer = accordionItem.querySelector(`#group-${topPerm.permission_code}`);
        
        relevantMidPerms.forEach((midPerm) => {
            const midPermCard = document.createElement('div');
            midPermCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-3';
            midPermCard.innerHTML = `
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-light py-2 px-3">
                        <div class="form-check">
                            <input class="form-check-input mid-level-permission" type="checkbox" 
                                   id="perm-${midPerm.permission_code}" 
                                   data-code="${midPerm.permission_code}" 
                                   data-parent="${midPerm.parent_permission_code}">
                            <label class="form-check-label fw-semibold" for="perm-${midPerm.permission_code}">
                                ${midPerm.name}
                            </label>
                        </div>
                    </div>
                    <div class="card-body p-2" id="leaf-${midPerm.permission_code}">
                        <!-- Leaf permissions will be added here -->
                    </div>
                </div>
            `;
            
            midPermContainer.appendChild(midPermCard);
            
            // Add leaf permissions for this mid-level permission
            const leafPerms = allPermissions.filter(
                leafPerm => leafPerm.parent_permission_code === midPerm.permission_code
            );
            
            const leafContainer = midPermCard.querySelector(`#leaf-${midPerm.permission_code}`);
            
            leafPerms.forEach((leafPerm) => {
                const leafItem = document.createElement('div');
                leafItem.className = 'form-check mb-2';
                leafItem.innerHTML = `
                    <input class="form-check-input leaf-permission" type="checkbox" 
                           id="perm-${leafPerm.permission_code}" 
                           data-code="${leafPerm.permission_code}" 
                           data-parent="${leafPerm.parent_permission_code}">
                    <label class="form-check-label small" for="perm-${leafPerm.permission_code}">
                        ${leafPerm.name}
                    </label>
                `;
                
                leafContainer.appendChild(leafItem);
            });
        });
    });

// Thêm event listener cho top-level checkboxes để điều khiển accordion
document.addEventListener('DOMContentLoaded', function() {
    // Sự kiện click cho các accordion button
    document.addEventListener('click', function(event) {
        // Ngăn việc mở/đóng accordion khi click vào button trừ khi checkbox được check
        if (event.target.classList.contains('accordion-button') || 
            event.target.closest('.accordion-button')) {
            const button = event.target.classList.contains('accordion-button') ? 
                event.target : event.target.closest('.accordion-button');
            const checkbox = button.querySelector('.top-level-permission');
            
            if (!checkbox.checked) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, true);

    // Xử lý khi thay đổi trạng thái checkbox
    const topLevelCheckboxes = document.querySelectorAll('.top-level-permission');
    topLevelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const permCode = this.dataset.code;
            const accordionId = `accordion-${permCode}`;
            const accordionElement = document.getElementById(accordionId);
            
            if (this.checked) {
                // Mở accordion khi checkbox được check
                const bsCollapse = new bootstrap.Collapse(accordionId);
                bsCollapse.show();
            } else {
                // Đóng accordion khi checkbox bị bỏ check
                const bsCollapse = new bootstrap.Collapse(accordionId);
                bsCollapse.hide();
            }
            });
        });
    });
}

export function setupCheckboxBehavior() {
    // When mid-level permission is checked/unchecked
    document.querySelectorAll('.mid-level-permission').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const midCode = this.dataset.code;
            const parentCode = this.dataset.parent;
            const isChecked = this.checked;
            
            // Set all leaf permissions to the same state
            document.querySelectorAll(`.leaf-permission[data-parent="${midCode}"]`).forEach(leafCheckbox => {
                leafCheckbox.checked = isChecked;
            });
            
            // Check parent state
            updateParentCheckbox(parentCode);
        });
    });
    
    // When leaf-level permission is checked/unchecked
    document.querySelectorAll('.leaf-permission').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parentCode = this.dataset.parent;
            updateParentCheckbox(parentCode);
        });
    });
}

function updateParentCheckbox(parentCode) {
    // For mid-level parent
    const midChildren = document.querySelectorAll(`.leaf-permission[data-parent="${parentCode}"]`);
    const midCheckbox = document.querySelector(`#perm-${parentCode}`);
    
    if (midChildren.length > 0) {
        const allChecked = Array.from(midChildren).every(child => child.checked);
        const someChecked = Array.from(midChildren).some(child => child.checked);
        
        midCheckbox.checked = someChecked;
        midCheckbox.indeterminate = someChecked && !allChecked;
        
        // Update top-level parent if needed
        if (midCheckbox.dataset.parent) {
            updateParentCheckbox(midCheckbox.dataset.parent);
        }
    }
}

function setupFormSubmission(topLevelPermissions) {
    document.getElementById('add-role-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get role name
        const roleName = document.getElementById('roleName').value.trim();
        
        if (!roleName) {
            alert("Vui lòng nhập tên vai trò");
            return;
        }

        let check = false;
        topLevelPermissions.forEach(topPerm => {
            const inputTop = document.querySelector(`#perm-${topPerm.permission_code}`);
            if(inputTop.checked){
                document.querySelectorAll(`#group-${topPerm.permission_code} input[type=checkbox]`).forEach((input) => {
                    if(input.checked){
                        check = true;
                    }
                })
            }
        })
        if(!check){
            alert("Vui lòng chọn quyền phù hợp");
            return;
        }
        
      
        // Collect all selected permissions
        const selectedPermissions = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (checkbox.dataset.code) {
                selectedPermissions.push(checkbox.dataset.code);
            }
        });
        
        if (selectedPermissions.length === 0) {
            alert("Vui lòng chọn ít nhất một quyền cho vai trò");
            return;
        }

        // Prepare data for API
        const roleData = {
            roleName: roleName,
            permissions: selectedPermissions
        };
        
        // // Submit role data to API
        saveRole(roleData);
    });
    
    // Cancel button handler
    document.getElementById('cancel-button').addEventListener('click', function() {
        // Go back to roles list or do something else
        renderContentRole();
    });
}

function saveRole(roleData) {
    // Call API to save role
    callApi('/role', 'POST', roleData)
        .then(response => {
            alert(`Vai trò "${roleData.roleName}" đã được tạo thành công!`);
            renderContentRole();
        })
        .catch(error => {
            console.error("Error saving role:", error);
        });
}