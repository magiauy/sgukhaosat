import { getDraggedElement, setDraggedElement, getIsDragging, setIsDragging } from "../main.js";

function attachSortable(container, itemSelector, handleClass, hoverClass) {
    const sortable = new Sortable(container, {
        handle: handleClass,
        animation: 150,
    });

    sortable.el.addEventListener("dragstart", event => {
        setDraggedElement(event.target);  // Use setter instead of direct assignment
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            if (div !== getDraggedElement()) {  // Use getter to compare
                div.classList.remove(hoverClass);
            }
        });
    });

    sortable.el.addEventListener("dragend", event => {
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            div.classList.add(hoverClass);
        });
        setIsDragging(false);  // Use setter instead of direct assignment
    });

    // Rest of the code remains unchanged
}
function setupSortables() {
    const questionsContainer = document.getElementById('questionsContainer');
    if (!questionsContainer) return;

    // Main container
    attachSortable(questionsContainer, '.question-item', '.drag-handle', 'hover-effect');

    // Nested containers
    questionsContainer.querySelectorAll('#row-container').forEach(container => {
        attachSortable(container, '.row-container-item', '.grid-row-drag-handle', 'hover-grid-row-effect');
    });

    questionsContainer.querySelectorAll('#column-container').forEach(container => {
        attachSortable(container, '.column-container-item', '.grid-column-drag-handle', 'hover-grid-column-effect');
    });

    questionsContainer.querySelectorAll('#option-container').forEach(container => {
        attachSortable(container, '.option-item', '.option-item-drag-handle', 'hover-option-item-effect');
    });
}

export { attachSortable, setupSortables };