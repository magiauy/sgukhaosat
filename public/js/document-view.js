/**
 * Document handling for quytrinh pages
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Determine the current page type from the URL
    const currentPath = window.location.pathname;
    let documentType = '';
    
    if (currentPath === '/quytrinh') {
        documentType = 'quy_trinh_khao_sat';
    } else if (currentPath === '/quytrinh/chuandaura') {
        documentType = 'quy_trinh_cap_nhat_chuan_dau_ra';
    } else if (currentPath === '/quytrinh/chuky') {
        documentType = 'danh_sach_quy_trinh_cac_chu_ky';
    } else {
        return; 
    }
    
    const tableHeader = document.querySelector('#documentTable thead tr');
    if (tableHeader) {
        if (tableHeader.querySelectorAll('th').length > 2) {
            tableHeader.innerHTML = `
                <th>Tên tài liệu</th>
                <th>Ngày tạo</th>
            `;
        }
    }
    
    // Phân trang
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    const limit = 5; 
    
    try {
        await loadDocuments(documentType, currentPage, limit);
    } catch (error) {
        console.error('Error loading documents:', error);
        showErrorMessage('Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại sau.');
    }
});

/**
 * Load documents from the API
 * @param {string} type - Document type
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 */
async function loadDocuments(type, page, limit) {
    try {

        const offset = (page - 1) * limit;
        const response = await fetch(`/api/document/type/${type}?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status) {
            renderDocuments(data.documents, offset);
            renderPagination(data.totalCount, page, limit);
        } else {
            showErrorMessage('Không thể tải dữ liệu tài liệu.');
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
    }
}

/**
 * Render documents to the table
 * @param {Array} documents - List of documents
 * @param {number} offset - Offset for numbering
 */
function renderDocuments(documents, offset) {
    const tableBody = document.querySelector('#documentTableBody');
    console.log(documents);
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    if (!documents || documents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center">Không tìm thấy tài liệu nào</td></tr>`;
        return;
    }
    
    let html = '';
    documents.forEach((doc, index) => {
        const docId = `doc-${index}`; 
        html += `
            <tr>
                <td>
                    <a href="javascript:void(0)" class="document-title" data-doc-id="${docId}">
                        ${escapeHtml(doc.title || `Tài liệu ${offset + index + 1}`)}
                    </a>
                    <div id="${docId}" class="document-content mt-2" style="display: none;">
                        <!-- Content will be loaded here when title is clicked -->
                    </div>
                </td>
                <td>${formatDate(doc.createAt)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    const documentTitles = document.querySelectorAll('.document-title');
    documentTitles.forEach((title, index) => {
        title.addEventListener('click', () => {
            const docId = title.getAttribute('data-doc-id');
            const contentDiv = document.getElementById(docId);
            
            document.querySelectorAll('.document-content').forEach(div => {
                if (div.id !== docId && div.style.display !== 'none') {
                    div.style.display = 'none';
                }
            });
            
             renderDocumentContent(documents[index]);
                
               
        });
    });
}

/**
 * Render file links for a document
 * @param {Array} files - List of files
 * @returns {string} HTML for file links
 */
function renderFileLinks(files) {
    if (!files || files.length === 0) {
        return '<span class="text-muted">Không có tệp đính kèm</span>';
    }
    
    let html = '';
    
    files.forEach(file => {
        html += `
            <div>
                <a href="${file.path_folder_url}" target="_blank">
                    <i class="far fa-file-alt me-1"></i> ${escapeHtml(file.name || 'File đính kèm')}
                </a>
            </div>
        `;
    });
    
    return html;
}


function renderDocumentContent(document) {
    if (!document || !document.files || document.files.length === 0) {
        return '<div class="alert alert-info">Không có thông tin tệp tin</div>';
    }
    const tableHeader = window.document.querySelector('#documentTable thead tr');
    if (tableHeader) {
        tableHeader.innerHTML = `
            <th>Mã ngành</th>
            <th>Tên ngành</th>
            <th>Tệp đính kèm</th>
            <th>Ngày tạo</th>
        `;
    }
    let html = window.document.querySelector('#documentTableBody');
    document.files.forEach(file => {
        const majorId = file.MajorID || '';
        const majorName = file.MajorName || '';
        const filePath = file.path_folder_url || '#';
        const fileName = file.name || 'File đính kèm';
        const fileCreateAt = file.createAt || '';
        html.innerHTML = `
            <tr>
                <td>${escapeHtml(majorId)}</td>
                <td>${escapeHtml(majorName)}</td>
                <td>
                    <a href="${filePath}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="far fa-file-alt me-1"></i> ${escapeHtml(fileName)}
                    </a>
                </td>
                <td>${formatDate(fileCreateAt)}</td>
            </tr>
        `;
    });
}

/**
 * Render pagination controls
 * @param {number} totalCount - Total number of documents
 * @param {number} currentPage - Current page number
 * @param {number} limit - Items per page
 */
function renderPagination(totalCount, currentPage, limit) {
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer) {
        console.error('Pagination container not found');
        return;
    }
    
    const totalPages = Math.ceil(totalCount / limit);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    // Add CSS link for document view styling if it doesn't exist
    if (!document.querySelector('link[href*="document-view.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/css/document-view.css';
        document.head.appendChild(cssLink);
    }
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="?page=${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="?page=${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
            <a class="page-link" href="?page=${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    paginationContainer.innerHTML = html;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const tableContainer = document.querySelector('.card-body');
    
    if (!tableContainer) {
        console.error('Table container not found');
        return;
    }
    
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger mt-3';
    errorAlert.textContent = message;
    
    // Remove any existing error messages
    const existingError = tableContainer.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }
    
    tableContainer.prepend(errorAlert);
}

/**
 * Format date to local format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return dateString; 
    }
    
    return date.toLocaleDateString('vi-VN');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} Escaped HTML
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
