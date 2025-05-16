function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.textContent;
}

function setupPasteHandlers() {
    const editableDivs = document.querySelectorAll(".editable-content,.editable-option-content,.editable-description-content");

    editableDivs.forEach(div => {
        // Skip elements that already have paste handlers attached
        if (div.getAttribute("data-paste-handler-attached") === "true") {
            return;
        }

        div.addEventListener("paste", (e) => {
            e.preventDefault();
            console.log("pasteevent");
            try {
                // Get and sanitize pasted text
                const text = sanitizeText(
                    (e.clipboardData || window.clipboardData).getData("text/plain")
                );

                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                range.deleteContents();

                // Insert sanitized text
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                range.collapse(false);

                // Trigger input event for change detection
                div.dispatchEvent(new Event('input', { bubbles: true }));

            } catch (error) {
                console.error("Paste handler error:", error);
            }
        });

        // Mark this element as having a paste handler attached
        div.setAttribute("data-paste-handler-attached", "true");
    });
}

export { setupPasteHandlers };