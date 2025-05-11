function showToast(message, type) {
    // Create a toast container
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
    toast.textContent = message;

    // Append and remove after timeout
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
}

function showSwalToast( message,type) {
    Swal.fire({
        icon: type,
        title: type === 'success' ? 'Thành công' :
               type === 'info' ? 'Thông báo' :
               type === 'warning' ? 'Cảnh báo' : 'Lỗi',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

export { showToast, showSwalToast };