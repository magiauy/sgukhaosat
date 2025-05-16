import {globalQuestionTypes} from "./questionInitializer.js";
import { swapPatternQuestion } from "./questionActions.js";

function populateSelect(selectElement, currentQTypeID) {
    if (!globalQuestionTypes) return;
    // Clear any existing options
    selectElement.innerHTML = '';

    const groups = [
        { name: 'Văn bản', items: ['SHORT_TEXT', 'LONG_TEXT'] },
        { name: 'Lựa chọn', items: ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'] },
        { name: 'Lưới', items: ['GRID_MULTIPLE_CHOICE', 'GRID_CHECKBOX'] }
    ];

    groups.forEach(group => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.name;

        group.items.forEach(typeId => {
            const qt = globalQuestionTypes['data'].find(t => t.QTypeID === typeId);
            if (qt) {
                const option = document.createElement('option');
                option.value = qt.QTypeID;
                option.textContent = questionTypeTranslations[qt.QTypeID] || qt.TypeName;
                if (qt.QTypeID === currentQTypeID) {
                    option.selected = true;
                }
                optgroup.appendChild(option);
            }
        });

        selectElement.appendChild(optgroup);
    });
}
const questionTypeTranslations = {
    // Text types
    'SHORT_TEXT': 'Văn bản ngắn',
    'LONG_TEXT': 'Văn bản dài',

    // Choice types
    'MULTIPLE_CHOICE': 'Trắc nghiệm',
    'MC_OPTION': 'Lựa chọn trắc nghiệm',
    'ANOTHER_OPTION': 'Lựa chọn khác',

    'CHECKBOX': 'Hộp kiểm',
    'CHECKBOX_OPTION': 'Lựa chọn hộp kiểm',

    'DROPDOWN': 'Menu thả xuống',
    'DROPDOWN_OPTION': 'Lựa chọn thả xuống',

    // Grid types
    'GRID_MULTIPLE_CHOICE': 'Lưới trắc nghiệm',
    'GRID_MC_COLUMN': 'Cột lưới trắc nghiệm',
    'GRID_MC_ROW': 'Hàng lưới trắc nghiệm',

    'GRID_CHECKBOX': 'Lưới hộp kiểm',
    'GRID_CHECKBOX_COLUMN': 'Cột lưới nhiều lựa chọn',
    'GRID_CHECKBOX_ROW': 'Hàng lưới nhiều lựa chọn',

    // Layout types
    'SUBTITLE': 'Tiêu đề phụ',
    'DESCRIPTION': 'Mô tả'
};

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