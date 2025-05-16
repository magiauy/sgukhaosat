import { clearBrTag } from "../utils/contentHelpers.js";
import { CheckBoxIcon, MCIcon } from "../constants/icons.js";
import {
    buildAnotherOptionHtml,
    buildGridHtml,
    buildOptionHtml,
    buildOptionWrapper
} from "../question/questionTemplates.js";
import { getIconForType } from "../utils/iconHelpers.js";
import { createElementFromHTML, placeCaretAtEnd } from "../utils/domHelpers.js"; // Added placeCaretAtEnd
import { setupFormEditListeners } from "../ui/formListeners.js";
import { initQuestionSelects } from "../question/questionSelect.js";
import {setupPasteHandlers} from "../utils/editableContent.js"; // Fixed extension

function handleNewOptionClick(event, wrapperSelector, containerClosestSelector, itemQuerySelector, type="option") {

    const createWrapper = event.target.closest(wrapperSelector);
    if (!createWrapper) return;
    const questionContainer = event.target.closest('.question-item');
    const optionContainer = questionContainer.querySelector(containerClosestSelector);
    let qType = questionContainer.querySelector('.form-select').dataset.qtype;
    let icon;

    switch (qType) {
        case "MULTIPLE_CHOICE":
            icon = MCIcon;
            break;
        case "CHECKBOX":
            icon = CheckBoxIcon;
            break;
        case "GRID_MULTIPLE_CHOICE":
            icon = MCIcon;
            break;
        case "GRID_CHECKBOX":
            icon = CheckBoxIcon;
            break;
        default:
            icon = "";
            break;
    }
    if (!optionContainer) {
        return;
    }
    let replaceHtml;
    const count = optionContainer.querySelectorAll(itemQuerySelector).length + 1;
    const content = "Câu trả lời " + count;
    switch (type) {
        case "option":
            replaceHtml = buildOptionHtml(content, count, icon);
            break;
        case "grid-row":
            replaceHtml = buildGridHtml(content, count, "row-container-item", "grid-row-drag-handle", "hover-grid-row-effect");
            break;
        case "grid-column":
            replaceHtml = buildGridHtml(content, count, "column-container-item", "grid-column-drag-handle", "hover-grid-column-effect", icon);
            break;
    }
    optionContainer.insertAdjacentHTML("beforeend", replaceHtml);
    const newItem = optionContainer.querySelector(itemQuerySelector + ":last-child");
    const inputToFocus = newItem.querySelector('input, textarea, [contenteditable="true"]');
    clearBrTag();
    setupPasteHandlers();
    const btnSave = document.querySelector('.btn-save');
    if (btnSave) {
        btnSave.disabled = false;
    }
    if (inputToFocus) {
        placeCaretAtEnd(inputToFocus);
        // inputToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
function setupOptionContentHandlers() {
    document.addEventListener("click", function(event) {
        if (event.target.matches(".new-editable-option-content")) {
            handleNewOptionClick(event, ".create-new-option-wrapper", ".option-container", ".option-item");
        } else if (event.target.matches(".new-editable-grid-row-content")) {
            handleNewOptionClick(event, ".create-new-grid-row-wrapper", ".row-container", ".row-container-item", "grid-row");
        } else if (event.target.matches(".new-editable-grid-column-content")) {
            handleNewOptionClick(event, ".create-new-grid-column-wrapper", ".column-container", ".column-container-item", "grid-column");
        }
    });
}

function setupOptionHandlers() {
    const questionsContainer = document.getElementById('questionsContainer');

    // Add "another option"
    questionsContainer.addEventListener('click', function(event) {
        const btnAddAnotherOption = event.target.closest('.add-another-option');
        if (!btnAddAnotherOption) return;

        const item = btnAddAnotherOption.closest('.question-item');
        const optionContainer = item.querySelector('.create-new-container');
        const qType = item.querySelector('.form-select').dataset.qtype;
        const optionWrapper = optionContainer.querySelector('.create-new-option-wrapper');
        let icon = getIconForType(qType);

        if (item) {
            optionContainer.insertAdjacentHTML('afterbegin', buildAnotherOptionHtml("Khác", icon));
            optionWrapper.replaceWith(createElementFromHTML(buildOptionWrapper({
                icon: icon,
                orderContent: false
            })));
            initQuestionSelects();
            document.querySelector('.btn-save').disabled = false;
        }
    });

    // Delete "another option"
    questionsContainer.addEventListener('click', function(event) {
        const deleteAnother = event.target.closest('.delete-another-handle');
        if (!deleteAnother) return;

        const item = deleteAnother.closest('.another-item');
        const questionItem = deleteAnother.closest('.question-item');
        const optionWrapper = questionItem.querySelector('.create-new-option-wrapper');
        const qType = questionItem.querySelector('.form-select').dataset.qtype;
        let icon = getIconForType(qType);

        if (item) {
            item.remove();
        }

        optionWrapper.replaceWith(createElementFromHTML(buildOptionWrapper({
            icon: icon,
            orderContent: true
        })));
    });

    // Setup auto-save enabler
    setupFormEditListeners();
}

export { handleNewOptionClick, setupOptionContentHandlers, setupOptionHandlers }; // Fixed export