function setupFormEditListeners() {
    const btnSave = document.querySelector('.btn-save');
    if (!btnSave) return;

    btnSave.disabled = true;

    // Select all elements where edits can happen
    const editableElements = document.querySelectorAll(
        'input, select, textarea, [contenteditable="true"], .editable-option-content'
    );

    editableElements.forEach(element => {
        element.addEventListener('input', () => btnSave.disabled = false);
        element.addEventListener('change', () => btnSave.disabled = false);
    });
}

export { setupFormEditListeners };