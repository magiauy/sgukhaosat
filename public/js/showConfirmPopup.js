/**
 * Hiển thị popup xác nhận đa năng
 * @param {Object} options - Tùy chọn cấu hình
 * @param {string} options.title - Tiêu đề popup (mặc định: 'Xác nhận')
 * @param {string} options.message - Nội dung thông báo
 * @param {string} options.confirmButtonText - Chữ của nút xác nhận (mặc định: 'Xác nhận')
 * @param {string} options.cancelButtonText - Chữ của nút hủy (mặc định: 'Hủy')
 * @param {string} options.type - Loại thông báo: 'warning', 'danger', 'info', 'success' (mặc định: 'warning')
 * @param {Function} options.onConfirm - Hàm callback khi người dùng xác nhận
 * @param {Function} options.onCancel - Hàm callback khi người dùng hủy
 * @returns {Promise} - Promise trả về true khi xác nhận, false khi hủy
 */
export function showConfirmPopup(options = {}) {
    const { 
        title = 'Xác nhận', 
        message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmButtonText = 'Xác nhận',
        cancelButtonText = 'Hủy',
        type = 'warning',
        onConfirm = null,
        onCancel = null
    } = options;
    
    // Xác định icon và màu sắc dựa vào type
    let icon, iconClass, buttonClass;
    switch(type) {
        case 'danger':
            icon = 'bi-exclamation-octagon';
            iconClass = 'text-danger';
            buttonClass = 'btn-danger';
            break;
        case 'info':
            icon = 'bi-info-circle';
            iconClass = 'text-info';
            buttonClass = 'btn-info';
            break;
        case 'success':
            icon = 'bi-check-circle';
            iconClass = 'text-success';
            buttonClass = 'btn-success';
            break;
        case 'warning':
        default:
            icon = 'bi-exclamation-triangle';
            iconClass = 'text-warning';
            buttonClass = 'btn-warning';
    }
    
    return new Promise((resolve) => {
        // Kiểm tra xem đã có popup nào đang hiển thị không
        const existingPopup = document.getElementById('confirm-popup-container');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Tạo container
        const popupContainer = document.createElement('div');
        popupContainer.id = 'confirm-popup-container';
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        popupContainer.style.height = '100%';
        popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        popupContainer.style.display = 'flex';
        popupContainer.style.justifyContent = 'center';
        popupContainer.style.alignItems = 'center';
        popupContainer.style.zIndex = '9999';
        popupContainer.style.opacity = '0';
        popupContainer.style.transition = 'opacity 0.2s ease';
        
        // HTML cho popup
        popupContainer.innerHTML = `
            <div class="popup-content bg-white rounded-4 shadow-lg" style="max-width: 400px; width: 90%; animation: scaleIn 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <div class="p-4 text-center border-bottom position-relative">
                    <h5 class="mb-0 fw-bold">${title}</h5>
                    <button type="button" class="btn-close position-absolute end-0 top-0 mt-2 me-2" id="close-popup"></button>
                </div>
                <div class="p-4 text-center">
                    <div class="mb-3">
                        <i class="bi ${icon} ${iconClass}" style="font-size: 3rem;"></i>
                    </div>
                    <p>${message}</p>
                </div>
                <div class="p-3 bg-light border-top text-center d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-outline-secondary px-4" id="cancel-popup">
                        <i class="bi bi-x-circle me-2"></i>${cancelButtonText}
                    </button>
                    <button type="button" class="btn ${buttonClass} px-4" id="confirm-popup">
                        <i class="bi bi-check-circle me-2"></i>${confirmButtonText}
                    </button>
                </div>
            </div>
        `;
        
        // Thêm style animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Thêm popup vào body
        document.body.appendChild(popupContainer);
        
        // Hiển thị popup với animation
        setTimeout(() => {
            popupContainer.style.opacity = '1';
        }, 10);
        
        // Event listener cho các nút
        const closePopup = () => {
            popupContainer.style.opacity = '0';
            setTimeout(() => {
                popupContainer.remove();
                style.remove();
            }, 200);
        };

        const onClose = () => {
            closePopup();
            if (onCancel) onCancel();
            resolve(false);
        };

        const onConfirmAction = () => {
            closePopup();
            if (onConfirm) onConfirm();
            resolve(true);
        };
        
        document.getElementById('close-popup').addEventListener('click', onClose);
        document.getElementById('cancel-popup').addEventListener('click', onClose);
        document.getElementById('confirm-popup').addEventListener('click', onConfirmAction);
        
        // Đóng khi click bên ngoài
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) {
                onClose();
            }
        });
        
        // Đóng khi nhấn ESC
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                onClose();
                document.removeEventListener('keydown', handler);
            }
        });
    });
}