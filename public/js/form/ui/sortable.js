import { draggedElement , isDragging} from "../main.js";

function attachSortable(container, itemSelector, handleClass, hoverClass) {
    const sortable = new Sortable(container, {
        handle: handleClass,
        animation: 150,
    });

    sortable.el.addEventListener("dragstart", event => {
        draggedElement = event.target;
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            if (div !== draggedElement) {
                div.classList.remove(hoverClass);
            }
        });
    });

    sortable.el.addEventListener("dragend", event => {
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            div.classList.add(hoverClass);
        });
        isDragging = false;
    });

    const scrollThreshold = 50;
    const scrollSpeed = 10;

    if (itemSelector === '.question-item') {
        sortable.el.addEventListener("dragover", event => {
            event.preventDefault();
            const parent = container.parentElement;
            const rect = parent.getBoundingClientRect();

            if (event.clientY - rect.top < scrollThreshold) {
                parent.scrollBy(0, -scrollSpeed);
            } else if (rect.bottom - event.clientY < scrollThreshold) {
                parent.scrollBy(0, scrollSpeed);
            }
        });
    }
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