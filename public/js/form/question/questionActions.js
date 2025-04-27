import {initQuestionSelects} from "./questionSelect.js";
import {initQuestion} from "./questionInitializer.js";
import {moreActionMenu} from "../ui/menuActions.js";
import {renderQuestion} from "./questionRenderer.js";

function duplicateQuestionItem(item, desiredValue) {
    // get duplicated HTML from the original element
    const newQuestionHtml = item.outerHTML;

    // create a temporary container to modify the duplicated HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = newQuestionHtml;

    // Find the select element in the duplicated HTML and update its value
    const selectElement = tempContainer.querySelector('select.form-select');
    if (selectElement) {
        selectElement.value = desiredValue;
        // Reset the initialization flag so it is re-initialized
        delete selectElement.dataset.initialized;
    }

    // Insert the modified HTML after the original question-item
    item.insertAdjacentHTML('afterend', tempContainer.innerHTML);

    // Reinitialize the select elements (new duplicated select will be initialized)
    initQuestionSelects();
    moreActionMenu();
}
function swapPatternQuestion(questionElement,type) {

    let question = {
        QID: questionElement.id.replace('q', ''),
        QTypeID: type,
        QContent: questionElement.querySelector('.editable-content').innerText,
        children: []
    };
    const currentSelect = questionElement.querySelector('.form-select').dataset.qtype;
    if (type === "MULTIPLE_CHOICE") {
        if (currentSelect === "CHECKBOX" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "MC_OPTION",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        } else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "MC_OPTION",
                    QContent: colContent
                };
            })
        }
    } else if (type === "CHECKBOX") {
        if (currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "CHECKBOX_OPTION",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        } else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "CHECKBOX_OPTION",
                    QContent: colContent
                };
            })
        }
    } else if (type === "GRID_MULTIPLE_CHOICE") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "GRID_MC_COLUMN",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_CHECKBOX") {
            question.children = [
                ...Array.from(questionElement.querySelectorAll('.row-container .row-container-item')).map(rowItem => {
                    const rowContent = rowItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_MC_ROW",
                        QContent: rowContent
                    };
                }),
                ...Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                    const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_MC_COLUMN",
                        QContent: colContent
                    };
                })
            ];
        }
    } else if (type === "GRID_CHECKBOX") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "GRID_CHECKBOX_COLUMN",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_MULTIPLE_CHOICE") {
            question.children = [
                ...Array.from(questionElement.querySelectorAll('.row-container .row-container-item')).map(rowItem => {
                    const rowContent = rowItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_CHECKBOX_ROW",
                        QContent: rowContent
                    };
                }),
                ...Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                    const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_CHECKBOX_COLUMN",
                        QContent: colContent
                    };
                })
            ];
        }
    } else if (type === "DROPDOWN") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "DROPDOWN_OPTION",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "DROPDOWN_OPTION",
                    QContent: colContent
                };
            })
        }

    }
    questionElement.outerHTML = renderQuestion(question);
    initQuestion();
}

export {duplicateQuestionItem, swapPatternQuestion};