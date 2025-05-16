/**
 * Set up preview button handler
 */
export function setupPreviewHandler() {
    const previewButton = document.querySelector('button[title="Xem trước"]');
    if (previewButton) {
        previewButton.addEventListener('click', handlePreviewClick);
    }
}

/**
 * Handle preview button click
 */
function handlePreviewClick() {
     
    if (!document.getElementById('previewModal')) {
        createPreviewModal();
    }
    
     
    generatePreview();
    
     
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();
}

/**
 * Create the preview modal
 */
function createPreviewModal() {
    const modalHTML = `
        <div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="previewModalLabel">
                            <i class="fas fa-eye me-2"></i>Xem trước khảo sát
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="preview-container" class="container">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="text-muted small me-auto">
                            <i class="fas fa-info-circle me-1"></i>
                            Đây chỉ là bản xem trước, các câu trả lời sẽ không được lưu lại
                        </div>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Generate preview content from editable elements
 */
function generatePreview() {
    const previewContainer = document.getElementById('preview-container');
    
     
    const formTitle = document.querySelector('.form-title, .editable-title')?.innerText || 'Khảo sát mới';
    
     
    let previewHTML = `
        <div class="survey-preview" style="max-width: 720px; margin: 0 auto;">
            <div class="text-center mb-4">
                <h2 class="fw-bold text-primary">${formTitle}</h2>
                <hr>
            </div>
            <div class="d-flex flex-column gap-4">
    `;
    
     
    const questionElements = document.querySelectorAll('.question, .question-item, .sortable-item');
    
    if (questionElements.length === 0) {
        previewHTML += `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Chưa có câu hỏi nào trong khảo sát này
            </div>
        `;
    } else {
         
        questionElements.forEach((element, index) => {
             
            if (element.classList.contains('drag-handle') || 
                element.classList.contains('ui-sortable-handle')) {
                return;
            }
            
             
            const questionContent = element.querySelector('.editable-content')?.innerText || 'Câu hỏi';
            const questionDescription = element.querySelector('.question-description, .editable-description')?.innerText || '';
            const isRequired = element.classList.contains('required');
            
            previewHTML += `
                <div class="card shadow-sm p-3 rounded question-preview">
                    <p class="fw-semibold">${index + 1}. ${questionContent}${isRequired ? ' <span class="text-danger">*</span>' : ''}</p>
                    ${questionDescription ? `<p>${questionDescription}</p>` : ''}
            `;
            
             
            const type = element.querySelector('.form-select')?.dataset.qtype || '';
            switch (type) {
                case 'SUBTITLE':
                    previewHTML += `<p class="text-muted">${questionContent}</p>`;
                    break;
                case 'CHECKBOX':
                    previewHTML += renderCheckboxPreview(element);
                    break; 
                case 'DROPDOWN':
                    previewHTML += renderDropdownPreview(element);
                    break;
                case 'MULTIPLE_CHOICE':   
                    previewHTML += renderRadioPreview(element);
                    break; 
                case 'LONG_TEXT':
                    previewHTML += `<textarea class="form-control mt-2" rows="3" placeholder="Nhập câu trả lời..." disabled></textarea>`; 
                    break;
                case 'SHORT_TEXT':
                    previewHTML += `<input type="text" class="form-control mt-2" placeholder="Nhập câu trả lời..." disabled>`;
                    break;
                case 'GRID_CHECKBOX':
                    previewHTML += renderGridPreview(element, 'checkbox');
                    break;
                case 'GRID_MULTIPLE_CHOICE':
                    previewHTML += renderGridPreview(element, 'radio');
                    break;
                default:
                    previewHTML += `<div class="alert alert-light">Loại câu hỏi chưa hỗ trợ xem trước</div>`;
            }
            
            previewHTML += `</div>`;
        });
    }
    
     
    previewHTML += `
            </div>
            <div class="text-center mt-5">
                <button type="button" class="btn btn-secondary px-5 py-2 fw-bold" disabled>
                    Gửi khảo sát (Chỉ xem trước)
                </button>
            </div>
        </div>
    `;
    
     
    previewContainer.innerHTML = previewHTML;
}

/**
 * Render preview for radio buttons (multiple choice)
 */
function renderRadioPreview(element) {
    let html = '';
    const timestamp = Date.now();
    
     
    const options = element.querySelectorAll('.option-item, .radio-option');
    
    if (options.length === 0) {
        return `<div class="alert alert-light mt-2">Chưa có tùy chọn</div>`;
    }
    
    options.forEach((option, index) => {
        const optionContent = option.querySelector('.option-content, .editable-option')?.innerText || `Tùy chọn ${index + 1}`;
        const isOther = option.classList.contains('other-option');
        
        html += `
            <div class="form-check mt-2">
                <input class="form-check-input" type="radio" name="preview_radio_${timestamp}" id="preview_radio_${index}" disabled>
                <label class="form-check-label" for="preview_radio_${index}">${optionContent}</label>
                ${isOther ? `
                    <div class="ms-4 mt-1">
                        <input type="text" class="form-control" placeholder="Nhập câu trả lời khác..." disabled>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    return html;
}

/**
 * Render preview for checkboxes
 */
function renderCheckboxPreview(element) {
    let html = '';
    
     
    const options = element.querySelectorAll('.option-item, .checkbox-option');
    
    if (options.length === 0) {
        return `<div class="alert alert-light mt-2">Chưa có tùy chọn</div>`;
    }
    
    options.forEach((option, index) => {
        const optionContent = option.querySelector('.option-content, .editable-option')?.innerText || `Tùy chọn ${index + 1}`;
        const isOther = option.classList.contains('other-option');
        
        html += `
            <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="preview_checkbox_${index}" disabled>
                <label class="form-check-label" for="preview_checkbox_${index}">${optionContent}</label>
                ${isOther ? `
                    <div class="ms-4 mt-1">
                        <input type="text" class="form-control" placeholder="Nhập câu trả lời khác..." disabled>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    return html;
}

/**
 * Render preview for dropdown
 */
function renderDropdownPreview(element) {
    let html = `
        <select class="form-select mt-2" disabled>
            <option selected>Chọn câu trả lời</option>
    `;
    
     
    const options = element.querySelectorAll('.option-item, .dropdown-option');
    
    if (options.length === 0) {
        html += `<option disabled>Chưa có tùy chọn</option>`;
    } else {
        options.forEach((option, index) => {
            const optionContent = option.querySelector('.option-content, .editable-option')?.innerText || `Tùy chọn ${index + 1}`;
            html += `<option>${optionContent}</option>`;
        });
    }
    
    html += `</select>`;
    return html;
}

/**
 * Render preview for grid questions
 * @param {Element} element - The question element
 * @param {string} inputType - Type of inputs to render ('radio' or 'checkbox')
 * @returns {string} HTML for the grid preview
 */
function renderGridPreview(element, inputType) {
     
    const gridContainer = element.querySelector('.grid-container');
    
    if (!gridContainer) {
        return `<div class="alert alert-light mt-2">Bảng câu hỏi (chưa có dữ liệu bảng)</div>`;
    }
    
     
    const gridContent = gridContainer.querySelector('.grid-content');
    
    if (!gridContent) {
        return `<div class="alert alert-light mt-2">Bảng câu hỏi (chưa có nội dung bảng)</div>`;
    }
    
     
    const rowContainer = gridContent.querySelector('.row-container');
    
    if (!rowContainer) {
        return `<div class="alert alert-light mt-2">Bảng câu hỏi (chưa có dữ liệu hàng)</div>`;
    }
    
     
    const rowItems = rowContainer.querySelectorAll('.row-container-item');
    
    if (rowItems.length === 0) {
        return `<div class="alert alert-light mt-2">Bảng câu hỏi (chưa có dữ liệu hàng)</div>`;
    }
    
     
    const rowContents = [];
    rowItems.forEach(item => {
        const content = item.querySelector('.editable-option-content')?.textContent.trim() || '';
        if (content) {
            rowContents.push(content);
        }
    });
    
     
    const columnContainer = gridContent.querySelector('.column-container') || 
                          gridContainer.querySelector('.column-container');
    
     
    const columnContents = [];
    
    if (columnContainer) {
        const columnItems = columnContainer.querySelectorAll('.column-item, .column-container-item');
        columnItems.forEach(item => {
            const content = item.querySelector('.editable-option-content')?.textContent.trim() || '';
            if (content) {
                columnContents.push(content);
            }
        });
    }
    
     
    if (columnContents.length === 0) {
        if (inputType === 'radio') {
             
            columnContents.push('Tùy chọn 1');
            columnContents.push('Tùy chọn 2');
            columnContents.push('Tùy chọn 3');
        } else {
             
            columnContents.push('Tùy chọn 1');
            columnContents.push('Tùy chọn 2');
        }
    }
    
     
    let html = `
        <div class="table-responsive mt-3">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="bg-light"></th>
    `;
    
     
    columnContents.forEach(columnContent => {
        html += `<th scope="col" class="text-center">${columnContent}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
     
    rowContents.forEach((rowContent, rowIndex) => {
        const timestamp = Date.now();
        
        html += `<tr><th scope="row" class="align-middle">${rowContent}</th>`;
        
         
        columnContents.forEach((_, colIndex) => {
            html += `
                <td class="text-center">
                    <input type="${inputType}" class="form-check-input" 
                           ${inputType === 'radio' ? `name="preview_grid_${timestamp}_${rowIndex}"` : ''} 
                           disabled>
                </td>
            `;
        });
        
        html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;
    return html;
}

/**
 * Render existing grid table structure
 * @param {Element} gridContent - The existing table element
 * @param {string} inputType - Type of inputs to render ('radio' or 'checkbox')
 * @returns {string} HTML for the grid preview
 */
function renderExistingGridTable(gridContent, inputType) {
     
    const tableClone = gridContent.cloneNode(true);
    
     
    const inputCells = tableClone.querySelectorAll('td');
    
    inputCells.forEach((cell, index) => {
        const rowIndex = cell.closest('tr').rowIndex - 1;  
        const timestamp = Date.now();
        
        cell.innerHTML = `
            <input type="${inputType}" class="form-check-input" 
                   ${inputType === 'radio' ? `name="preview_grid_${timestamp}_${rowIndex}"` : ''} 
                   disabled>
        `;
    });
    
     
    return `<div class="table-responsive mt-3">${tableClone.outerHTML}</div>`;
}