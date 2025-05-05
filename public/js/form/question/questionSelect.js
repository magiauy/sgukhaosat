import {globalQuestionTypes} from "./questionInitializer.js";
import { swapPatternQuestion } from "./questionActions.js";

function populateSelect(selectElement, currentQTypeID) {
    if (!globalQuestionTypes) return;
    // Clear any existing options
    selectElement.innerHTML = '';

    // Iterate over the global question types array and append options
    globalQuestionTypes['data'].forEach(qt => {
        const option = document.createElement('option');
        option.value = qt.QTypeID;
        option.textContent = qt.TypeName;
        // Select the option if its value matches the current question's QTypeID
        if (qt.QTypeID === currentQTypeID) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}
function initQuestionSelects() {
    const selects = document.querySelectorAll('.question-item select.form-select');
    selects.forEach(select => {
        if (!select.dataset.initialized) {
            select.dataset.initialized = 'true';
            const currentQTypeID = select.getAttribute('data-qtype') || '';
            populateSelect(select, currentQTypeID);
            select.addEventListener('change', function () {
                const currentElement = this.closest('.question-item');
                swapPatternQuestion(currentElement, this.value);
            });
        }
    });
}

export  { initQuestionSelects, populateSelect };