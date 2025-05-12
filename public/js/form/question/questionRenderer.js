import {patternQuestionMultipleChoice, patternQuestionCheckBox, patternQuestionDropdown, patternQuestionGridCheckBox, patternQuestionGridMultipleChoice} from "./questionPatterns.js";

function renderQuestion(question) {
    const descriptionItem = question.children.find(option => option.QTypeID === "DESCRIPTION") || null;
    let html = `<div class="question-item hover-effect flex flex-column align-items-start" ${question.QID ? `id="q${question.QID}" ` : ""}>
    <div class="drag-handle me-2 text-center" style="cursor: move;">
        <img src="/public/icons/grip-dots.svg" alt="Grip Dots" style="width: 24px; height: 24px" />
    </div>
        <div class="question-content d-flex align-items-start gap-2 mb-1">
          ${question.QContent ? `
            <div class="editable-content" contenteditable="true" data-placeholder="${question.QTypeID === 'SUBTITLE' ? 'Tiêu đề' : 'Câu hỏi'}">
                 ${question.QContent}
            </div>` :
        `<div class="editable-content" contenteditable="true" data-placeholder="${question.QTypeID === 'SUBTITLE' ? 'Tiêu đề' : 'Câu hỏi'}"></div>`}
          <select class="form-select" data-qtype="${question.QTypeID}">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>

        ${descriptionItem ? `<div class="question-description" id="q${descriptionItem.QID}">
               ${descriptionItem.QContent ? `
        <div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả">
            ${descriptionItem.QContent}
        </div>` :
        `<div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả"></div>`}
        </div> ` : ""}

    <div class="question-answer">`;

    // Render specific question type content
    if (question.QTypeID === "MULTIPLE_CHOICE") {
        html += patternQuestionMultipleChoice(question);
    } else if (question.QTypeID === "CHECKBOX") {
        html += patternQuestionCheckBox(question);
    } else if (question.QTypeID === "GRID_MULTIPLE_CHOICE") {
        html += patternQuestionGridMultipleChoice(question);
    } else if (question.QTypeID === "GRID_CHECKBOX") {
        html += patternQuestionGridCheckBox(question);
    } else if (question.QTypeID === "DROPDOWN") {
        html += patternQuestionDropdown(question);
    }
    // Actions buttons
    html += `<div class="d-flex justify-content-end mt-2 actions_container px-2 pt-2 gap-2">
            <img src="/public/icons/trashcan.svg" alt="Delete" class="delete-question-handle" style="cursor: pointer; width: 34px; height: 34px;">
            <img src="/public/icons/copy.svg" alt="Duplicate" class="duplicate-question-handle" style="cursor: pointer; width: 34px; height: 34px;">
            ${question.QTypeID === "SUBTITLE" ? "" : `            
            <label class="switch">
              <input type="checkbox" id="required" class="required-checkbox" ${question.QRequired ? "checked" : ""}>
              <span class="slider round"></span>
            </label>
            <span>Bắt buộc</span>`}
            <div class="more-action justify-content-center align-items-center">
                <img src="/public/icons/three-dots-vertical.svg"  style="cursor: pointer; width: 28px; height: 28px;" alt="About action">
            </div>
    </div>`;

    html += `</div>
          <div class="hover-zone"></div>
              <div class="button-group">
                    <button class="btn-add-title-description">Thêm tiêu đề và mô tả</button>
                    <button class="btn-add-question">Thêm câu hỏi</button>
              </div>
            </div>`;

    return html;
}

function addQuestionItem() {
    const question = {
        QContent: "",
        QTypeID: "MULTIPLE_CHOICE",
        QRequired: 1,
        children: [
            {
                QTypeID: "MC_OPTION",
                QContent: "Câu trả lời 1",
            }
        ]
    };

    return renderQuestion(question);
}

function addTitleDescription() {
    const question = {
        QTypeID: "SUBTITLE",
        children: [
            {
                QTypeID: "DESCRIPTION",
                QContent: ""
            }
        ]
    };
    return renderQuestion(question);
}


export { renderQuestion, addQuestionItem, addTitleDescription };