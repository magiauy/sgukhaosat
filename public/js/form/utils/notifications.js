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

export { showToast };