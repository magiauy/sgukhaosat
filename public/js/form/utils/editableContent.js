function setupPasteHandlers() {
    const editableDivs = document.querySelectorAll(".editable-content,.editable-option-content");
    editableDivs.forEach(div => {
        div.addEventListener("paste", function (e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text/plain");
            const selection = window.getSelection();
            if (!selection.rangeCount) {
                console.warn("⚠️ No selection range found");
                return;
            }
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
        });
    });
}

export { setupPasteHandlers };