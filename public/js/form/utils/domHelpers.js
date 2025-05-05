function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function focusNewItem(newItem) {
    const inputToFocus = newItem.querySelector('input, textarea, [contenteditable="true"]');
    if (inputToFocus) {
        inputToFocus.focus();
        inputToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export { createElementFromHTML, focusNewItem, placeCaretAtEnd };