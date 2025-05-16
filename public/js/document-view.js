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
    
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    if (!documents || documents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center">Không tìm thấy tài liệu nào</td></tr>`;
        return;
    }
    
    let html = '';
    
    documents.forEach((doc, index) => {
        html += `
            <tr>
                <td>${offset + index + 1}</td>
                <td>${escapeHtml(doc.title)}</td>
                <td>${formatDate(doc.createAt)}</td>
                <td>
                    ${renderFileLinks(doc.files)}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
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
