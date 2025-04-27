import { addTitleDescription, addQuestionItem } from "../question/questionRenderer.js";
import { focusNewItem } from "../utils/domHelpers.js";
import { clearBrTag } from "../utils/contentHelpers.js";
import { initQuestionSelects } from "../question/questionSelect.js";

function setupQuestionHandlers() {
    // Add title/description
    document.addEventListener('click', function(event) {
        const btnAddTitleDescription = event.target.closest('.btn-add-title-description');
        if (!btnAddTitleDescription) return;

        const questionsContainer = document.getElementById('questionsContainer');
        const item = btnAddTitleDescription.closest('.question-item');
        let newItem;

        if (item) {
            item.insertAdjacentHTML('afterend', addTitleDescription());
            newItem = item.nextElementSibling;
        } else {
            questionsContainer.insertAdjacentHTML('beforeend', addTitleDescription());
            newItem = questionsContainer.lastElementChild;
        }

        initQuestionSelects();
        focusNewItem(newItem);
        clearBrTag();
    });

    // Add question
    document.addEventListener('click', function(event) {
        const btnAddQuestion = event.target.closest('.btn-add-question');
        if (!btnAddQuestion) return;

        const questionsContainer = document.getElementById('questionsContainer');
        const item = btnAddQuestion.closest('.question-item');
        let newItem;

        if (item) {
            item.insertAdjacentHTML('afterend', addQuestionItem());
            newItem = item.nextElementSibling;
        } else {
            questionsContainer.insertAdjacentHTML('beforeend', addQuestionItem());
            newItem = questionsContainer.lastElementChild;
        }

        initQuestionSelects();
        clearBrTag();
        focusNewItem(newItem);
        document.querySelector('.btn-save').disabled = false;
    });
}

export { setupQuestionHandlers };