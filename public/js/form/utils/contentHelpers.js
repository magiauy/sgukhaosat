function clearBrTag() {
    document.querySelectorAll('.editable-content,.editable-option-content,.editable-description-content').forEach(el => {
        el.addEventListener('input', function () {
            // If the element contains only a <br> or is empty
            if (this.innerHTML.trim() === '<br>' || this.innerHTML.trim() === '') {
                this.innerHTML = '';
            }
        });
    });
}

export { clearBrTag };