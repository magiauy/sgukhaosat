import {getFormId ,getFormStatus} from "../main.js";
import {showSwalToast} from "../utils/notifications.js";

function collectQuestionData() {
    // Check for missing required select fields
    const typeId = document.getElementById('typeid').value;
    const majorId = document.getElementById('majorid').value;
    const periodId = document.getElementById('periodid').value;

    // Check if any required field is empty
    if (!typeId) {
        showSwalToast( 'Vui lòng chọn loại biểu mẫu', 'error');
        return null;
    }

    if (!majorId) {
        showSwalToast('Vui lòng chọn khối ngành', 'error');
        return null;
    }

    if (!periodId) {
        showSwalToast( 'Vui lòng chọn niên khóa', 'error');
        return null;
    }

    return {
        form: {
            FID: getFormId(),
            FName: document.getElementById('fname').value,
            Note: document.getElementById('note').value,
            Limit: document.getElementById('limit').value,
            TypeID: typeId,
            MajorID: majorId,
            PeriodID: periodId,
            File: document.getElementById('file').value,
            Status: getFormStatus()
        },
        questions: convertHTMLQuestionToJsonData()
    };
}

function convertHTMLQuestionToJsonData(){
    const questionContainer = document.getElementById('questionsContainer');
    const mapType = {
        "MULTIPLE_CHOICE": "MC_OPTION",
        "CHECKBOX": "CHECKBOX_OPTION",
        "DROPDOWN": "DROPDOWN_OPTION"}
    const questions = [];
    // Loop through each question-item with an index.
    questionContainer.querySelectorAll('.question-item').forEach((questionItem, qIdx) => {
        const questionIndex = qIdx + 1;
        const type = questionItem.querySelector('.form-select')?.dataset.qtype || "SUBTITLE";
        const requiredCheckbox = questionItem.querySelector('.required-checkbox');
        const isRequired = requiredCheckbox ? (requiredCheckbox.checked ? 1 : 0) : 0;
        const question = {
            QID: questionItem.id.replace('q', ''),
            QContent: questionItem.querySelector('.editable-content').innerHTML.trim().replace(/^[\n\r]+|[\n\r]+$/g, ''),
            QTypeID: type,
            QIndex: questionIndex.toString(),
            QRequired: isRequired,
            children: []
        };

        let childIndex = 1;
        // Process description if available.
        const descriptionItem = questionItem.querySelector('.question-description');
        if (descriptionItem) {
            question.children.push({
                QID: descriptionItem.id.replace('q', ''),
                QParent: questionItem.id.replace('q', ''),
                QTypeID: "DESCRIPTION",
                QContent: descriptionItem.querySelector('.editable-description-content').innerText,
                QIndex: questionIndex + '.' + childIndex
            });
            childIndex++;
        }

        // Process option items.
        const optionContainer = questionItem.querySelector('.option-container');
        if (optionContainer) {
            optionContainer.querySelectorAll('.option-item').forEach(optionItem => {
                question.children.push({
                    QID: optionItem.id.replace('q', ''),
                    QParent: questionItem.id.replace('q', ''),
                    QTypeID: mapType[type],
                    QContent: optionItem.querySelector('.editable-option-content').innerText,
                    QIndex: questionIndex + '.' + childIndex
                });
                childIndex++;
            });
        }

        // Process grid container rows and columns.
// Process grid container rows and columns.
        const gridContainer = questionItem.querySelector('.grid-container');
        if (gridContainer) {
            const rowContainer = gridContainer.querySelector('.row-container');
            let rowBase = "";
            if (rowContainer) {
                let rowCounter = 1;
                rowContainer.querySelectorAll('.row-container-item').forEach(rowItem => {
                    const currentRowIndex = questionIndex + '.' + rowCounter;
                    question.children.push({
                        QID: rowItem.id.replace('q', ''),
                        QTypeID: type === "GRID_MULTIPLE_CHOICE" ? "GRID_MC_ROW" : "GRID_CHECKBOX_ROW",
                        QContent: rowItem.querySelector('.editable-option-content').innerText,
                        QIndex: currentRowIndex
                    });
                    // Store the first row index to be used as the base for column indexes.
                    if (rowCounter === 1) {
                        rowBase = currentRowIndex;
                    }
                    rowCounter++;
                });
            }
            // If no row exists, use questionIndex with an extra .1 as base.
            const colBase = rowBase || (questionIndex + '.1');
            const columnContainer = gridContainer.querySelector('.column-container');
            if (columnContainer) {
                let colCounter = 1;
                columnContainer.querySelectorAll('.column-container-item').forEach(colItem => {
                    question.children.push({
                        QID: colItem.id.replace('q', ''),
                        QTypeID: type === "GRID_MULTIPLE_CHOICE" ? "GRID_MC_COLUMN" : "GRID_CHECKBOX_COLUMN",
                        QContent: colItem.querySelector('.editable-option-content').innerText,
                        QIndex: colBase + '.' + colCounter
                    });
                    colCounter++;
                });
            }
        }

        // Process another items.
        const anotherItems = questionItem.querySelectorAll('.another-item');
        if (anotherItems) {
            anotherItems.forEach(item => {
                question.children.push({
                    QTypeID: "ANOTHER_OPTION",
                    QContent: item.querySelector('.another-content').innerText,
                    QIndex: questionIndex + '.' + childIndex
                });
                childIndex++;
            });
        }

        questions.push(question);
    });
    return questions;
}

function flattenQuestions(questionList) {
    const flatList = [];

    questionList.forEach(q => {
        // Đẩy câu hỏi chính vào
        flatList.push({
            QID: q.QID,
            QIndex: q.QIndex,
            QTypeID: q.QTypeID,
            QContent: q.QContent,
            QParent: q.QParent || null
        });

        // Nếu có children thì đẩy từng child vào
        if (q.children && Array.isArray(q.children)) {
            q.children.forEach(child => {
                flatList.push({
                    QID: child.QID || null,
                    QIndex: child.QIndex,
                    QTypeID: child.QTypeID,
                    QContent: child.QContent,
                    QParent: child.QParent || q.QID
                });
            });
        }
    });

    return flatList;
}


function syncQuestion(newQuestion) {
    const questionContainer = document.getElementById('questionsContainer');
    // Gộp cả câu hỏi chính và children lại
    const allQuestions = flattenQuestions(newQuestion);

    // Helper function: tìm QID theo QIndex
    const findQIDByIndex = (qIndex) => {
        const found = allQuestions.find(q => q.QIndex === qIndex);
        return found ? found.QID : null;
    };

    questionContainer.querySelectorAll('.question-item').forEach((questionItem, qIdx) => {
        const questionIndex = (qIdx + 1).toString();
        // Đầu tiên là câu hỏi chính
        const qidMain = findQIDByIndex(questionIndex);
        if (qidMain) {
            questionItem.id = `q${qidMain}`;
        }

        let childIndex = 1;

        // Gắn ID cho mô tả
        const descriptionItem = questionItem.querySelector('.question-description');
        if (descriptionItem) {
            const qIndex = `${questionIndex}.${childIndex}`;
            const qid = findQIDByIndex(qIndex);
            if (qid) {
                descriptionItem.id = `q${qid}`;
            }
            childIndex++;
        }

        // Gắn ID cho các option
        const optionContainer = questionItem.querySelector('.option-container');
        if (optionContainer) {
            optionContainer.querySelectorAll('.option-item').forEach(optionItem => {
                const qIndex = `${questionIndex}.${childIndex}`;
                const qid = findQIDByIndex(qIndex);
                if (qid) {
                    optionItem.id = `q${qid}`;
                }
                childIndex++;
            });
        }

        // Gắn ID cho grid rows và columns
        const gridContainer = questionItem.querySelector('.grid-container');
        if (gridContainer) {
            const rowContainer = gridContainer.querySelector('.row-container');
            let rowBase = "";
            if (rowContainer) {
                let rowCounter = 1;
                rowContainer.querySelectorAll('.row-container-item').forEach(rowItem => {
                    const currentRowIndex = `${questionIndex}.${rowCounter}`;
                    const qid = findQIDByIndex(currentRowIndex);
                    if (qid) {
                        rowItem.id = `q${qid}`;
                    }
                    if (rowCounter === 1) {
                        rowBase = currentRowIndex;
                    }
                    rowCounter++;
                });
            }

            const colBase = rowBase || `${questionIndex}.1`;
            const columnContainer = gridContainer.querySelector('.column-container');
            if (columnContainer) {
                let colCounter = 1;
                columnContainer.querySelectorAll('.column-container-item').forEach(colItem => {
                    const qIndex = `${colBase}.${colCounter}`;
                    const qid = findQIDByIndex(qIndex);
                    if (qid) {
                        colItem.id = `q${qid}`;
                    }
                    colCounter++;
                });
            }
        }

        // Gắn ID cho "another option"
        const anotherItems = questionItem.querySelectorAll('.another-item');
        if (anotherItems) {
            anotherItems.forEach(item => {
                const qIndex = `${questionIndex}.${childIndex}`;
                const qid = findQIDByIndex(qIndex);
                if (qid) {
                    item.id = `q${qid}`;
                }
                childIndex++;
            });
        }
    });
}



export { collectQuestionData, syncQuestion };