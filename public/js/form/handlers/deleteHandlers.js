import { duplicateQuestionItem } from "../question/questionActions.js";
import { clearBrTag } from "../utils/contentHelpers.js";

function setupDeleteHandlers() {
    // Delete option items
    document.addEventListener('click', function(event) {
        const deleteHandle = event.target.closest('.delete-handle');
        if (!deleteHandle) return;
        const item = deleteHandle.closest('.option-item, .row-container-item, .column-container-item');
        if (item) {
            item.remove();
        }
        document.querySelector('.btn-save').disabled = false;
    });

    // Delete questions
    document.addEventListener('click', function(event) {
        const deleteHandle = event.target.closest('.delete-question-handle');
        if (!deleteHandle) return;
        const item = deleteHandle.closest('.question-item');
        if (item) {
            item.remove();
        }
        document.querySelector('.btn-save').disabled = false;
    });

    // Duplicate questions
    document.addEventListener('click', function(event) {
        const duplicate = event.target.closest('.duplicate-question-handle');
        if (!duplicate) return;
        const item = duplicate.closest('.question-item');
        const selectElement = item.querySelector('.form-select').dataset.qtype;
        if (item) {
            duplicateQuestionItem(item, selectElement)
        }
        clearBrTag();
        document.querySelector('.btn-save').disabled = false;
    });
}

export { setupDeleteHandlers };