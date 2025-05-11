import { callApi } from "../../apiService.js";
import { attachSortable } from "../ui/sortable.js";
import { populateSelect } from "./questionSelect.js";
import { moreActionMenu } from "../ui/menuActions.js";
import { setupEventHandlers } from "../handlers/eventHandlers.js";
import { setupSortables } from "../ui/sortable.js";

import { initQuestionSelects} from "./questionSelect.js";

// Keep global variables
let globalQuestionTypes = null;
let globalTypesForm = null;
let globalMajor = null;
let globalPeriod = null;
// Main initialization function - now cleaner and focused on coordination
function initQuestion() {
    loadFormData();
    setupSortables();
    setupEventHandlers();
    populateSelect();
// Add this to your JavaScript code
        document.body.addEventListener('change', function(event) {
            if (event.target && event.target.id === 'required') {
                // When checkbox state changes, set a data attribute on the parent question div
                const questionItem = event.target.closest('.question-item');
                if (questionItem) {
                    questionItem.dataset.required = event.target.checked;
                }
            }
        });
}

// Keep data loading functions
async function loadFormData() {
    setTimeout(async () => {
        await Promise.all([
            loadQuestionTypes(),
            loadMajor(),
            loadPeriod(),
            loadTypesForm()
        ]);

        initQuestionSelects();
        initFormConfig();
        moreActionMenu();
    }, 0);
}

async function loadQuestionTypes() {
    if (!globalQuestionTypes) {
        try {
            globalQuestionTypes = await callApi('/question_type', 'GET');
        } catch (error) {
            console.error(error);
        }
    }
}

async function loadTypesForm() {
    // Implementation remains

}

async function loadMajor() {
    // Implementation remains
}

async function loadPeriod() {
    // Implementation remains
}
function initFormConfig() {
    // Implementation remains
}

export {
    initQuestion,
    globalQuestionTypes,
    globalTypesForm,
    globalMajor,
    globalPeriod
};