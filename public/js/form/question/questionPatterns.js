import { buildOptionHtml, buildGridHtml, buildOptionWrapper, buildAnotherOptionHtml } from "./questionTemplates.js";
import {MCIcon,CheckBoxIcon} from "../constants/icons.js";


function patternQuestionCheckBox(question) {
    const count = question.children.filter(option => option.QTypeID === "CHECKBOX_OPTION").length;
    const isHaveAnotherOption = question.children.some(option => option.QTypeID === "ORDER_OPTION");
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count,CheckBoxIcon);
        html += `</div>`;
        html += `<div class="create-new-container">`
        html += buildOptionWrapper({icon: CheckBoxIcon});
        html += `</div>`
        return html;
    }
    question.children.forEach(option => {
        html += buildOptionHtml(option.QContent ,count ,CheckBoxIcon,option.QID);
    });
    html += `</div>`;
    html += `<div class="create-new-container">`
    // html += buildAnotherOptionHtml("Thêm câu trả lời khác", CheckBoxIcon);
    html += isHaveAnotherOption ? buildAnotherOptionHtml("Khác",CheckBoxIcon) : ""
    html += buildOptionWrapper({
        icon: CheckBoxIcon,
        orderContent: !isHaveAnotherOption
    })
    html+=`</div>`;
    return html;
}
function patternQuestionMultipleChoice(question){
    const count = question.children.filter(option => option.QTypeID === "MC_OPTION").length;
    const isHaveAnotherOption = question.children.some(option => option.QTypeID === "ORDER_OPTION");
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count,MCIcon);
        html += `</div>`;
        html += `<div class="create-new-container">`
        html += buildOptionWrapper({icon: MCIcon});
        html += `</div>`
        return html;
    }
    question.children.map(option => {
        html += buildOptionHtml(option.QContent, count,MCIcon,option.QID);
    });
    html += `</div>`;
    html += `<div class="create-new-container">`
    html += isHaveAnotherOption ? buildAnotherOptionHtml("Khác",MCIcon) : ""
    html += buildOptionWrapper({
        icon: MCIcon,
        orderContent: !isHaveAnotherOption
    })
    html+=`</div>`;
    return html;
}
function patternQuestionDropdown(question) {
    const count = question.children.filter(option => option.QTypeID === "DROPDOWN_OPTION").length;
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count);
        html += `</div>`;
        html += `<div class="create-new-container">`
        html += buildOptionWrapper();
        html += `</div>`
        return html;
    }
    question.children.forEach(option => {
        html += buildOptionHtml(option.QContent, count, "",option.QID);
    });
    html += `</div>`;
    html += `<div class="create-new-container">`
    html += buildOptionWrapper()
    html+=`</div>`;
    return html;
}
function patternQuestionGridMultipleChoice(question) {
    let html = `<div class="grid-container d-flex flex-row" style="margin: 5px 0 0 0; padding: 0;">
`;
    html += `    
    <div class="grid-content flex-grow-1">
        <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Hàng</div>
    <div class="row-container" id="row-container">
`;
    const countRows = question.children.filter(option => option.QTypeID === "GRID_MC_ROW").length;
    const countColumns = question.children.filter(option => option.QTypeID === "GRID_MC_COLUMN").length;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_ROW") {
            html += buildGridHtml(option.QContent, countRows, "row-container-item", "grid-row-drag-handle","hover-grid-row-effect","",option.QID);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-row-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-row-content",
        orderContent: false,
        text: "Thêm hàng"
    })
    html +=`</div>`;
    html += `<div class="grid-content flex-grow-1">
    <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Cột</div>
    <div class="column-container" id="column-container"> 
`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_COLUMN") {
            html += buildGridHtml(option.QContent, countColumns, "column-container-item", "grid-column-drag-handle","hover-grid-column-effect",MCIcon,option.QID);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-column-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-column-content",
        icon: MCIcon,
        orderContent: false,
        text: "Thêm cột"
    })
    html += `</div></div>`;
    return html;
}
function patternQuestionGridCheckBox(question) {
    let html = `<div class="grid-container d-flex flex-row" style="margin: 5px 0 0 0; padding: 0;">
`;
    html += `    
    <div class="grid-content flex-grow-1" >
        <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Hàng</div>
    <div class="row-container" style="width: 50%;" id="row-container">
`;
    const countRows = question.children.filter(option => option.QTypeID === "GRID_CHECKBOX_ROW").length;
    const countColumns = question.children.filter(option => option.QTypeID === "GRID_CHECKBOX_COLUMN").length;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_ROW") {
            html += buildGridHtml(option.QContent, countRows, "row-container-item", "grid-row-drag-handle","hover-grid-row-effect","",option.QID);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-row-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-row-content",
        orderContent: false,
        text: "Thêm hàng"
    })
    html += `</div>`;
    html += `<div class="grid-content flex-grow-1">
    <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Cột</div>
    <div class="column-container" style="width: 50%;" id="column-container">
`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_COLUMN") {
            html += buildGridHtml(option.QContent, countColumns, "column-container-item", "grid-column-drag-handle","hover-grid-column-effect",CheckBoxIcon,option.QID);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-column-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-column-content",
        icon: CheckBoxIcon,
        orderContent: false,
        text: "Thêm cột"
    })
    html += `</div></div>`;


    return html;
}

export { patternQuestionMultipleChoice, patternQuestionCheckBox, patternQuestionGridMultipleChoice, patternQuestionGridCheckBox, patternQuestionDropdown };
