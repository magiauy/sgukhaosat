import { callApi } from "../../apiService.js";
import { attachSortable } from "../ui/sortable.js";
import { populateSelect } from "./questionSelect.js";
import { moreActionMenu } from "../ui/menuActions.js";
import { setupEventHandlers } from "../handlers/eventHandlers.js";
import { setupSortables } from "../ui/sortable.js";
import {getForm} from "../main.js";
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
    try {
        const response = await callApi('/form-type');
        const typeSelect = document.getElementById('typeid');
        const globalTypesForm = Array.isArray(response) ? response : (response.data || []);
        // Clear existing options
        typeSelect.innerHTML = '<option value="">Chọn loại biểu mẫu</option>'; // Reset to default option

        // Since you're using await, typeData already contains the resolved value
        globalTypesForm.forEach(type => {
            const option = document.createElement('option');
            option.value = type.FTypeID;
            option.textContent = type.FTypeName;
            typeSelect.appendChild(option);
        });

        //Select
        const selectedType = typeSelect.value;
        const selectedOption = Array.from(typeSelect.options).find(option => option.value === selectedType);
        if (selectedOption) {
            selectedOption.selected = true;
        }


    } catch (error) {
        console.error('Error loading form types:', error);
    }
}

async function loadMajor() {

    try {
        const response = await callApi('/major');
        const majorSelect = document.getElementById('majorid');
        const globalMajor = Array.isArray(response) ? response : (response.data || []);
        // Clear existing options
        majorSelect.innerHTML = '<option value="">Chọn ngành</option>'; // Reset to default option

        // Since you're using await, majorData already contains the resolved value
        globalMajor.forEach(major => {
            const option = document.createElement('option');
            option.value = major.MajorID;
            option.textContent = major.MajorName;
            majorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading form majors:', error);
    }
}

async function loadPeriod() {
    try {
        const response = await callApi('/period');
        const periodSelect = document.getElementById('periodid');
        // Clear existing options
        periodSelect.innerHTML = '<option value="">Chọn kỳ</option>'; // Reset to default option

        const globalPeriod = Array.isArray(response) ? response : (response.data || []);

        // Since you're using await, periodData already contains the resolved value
        globalPeriod.forEach(period => {
            const option = document.createElement('option');
            console.log(period);
            option.value = period.periodID;
            option.textContent = period.startYear + '-' + period.endYear;
            periodSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading form periods:', error);
    }
}
function initFormConfig() {
    // Get form data
    const formData = getForm();
    console.log("Initializing form configuration:", formData);

    if (!formData) return;

    // Get select elements
    const selectsType = document.getElementById('typeid');
    const selectsMajor = document.getElementById('majorid');
    const selectsPeriod = document.getElementById('periodid');

    // Force string comparison since select values are always strings
    if (formData.TypeID) {
        const typeIdStr = String(formData.TypeID).trim();
        for (let i = 0; i < selectsType.options.length; i++) {
            if (selectsType.options[i].value === typeIdStr) {
                selectsType.selectedIndex = i;
                break;
            }
        }
    }

    if (formData.MajorID) {
        const majorIdStr = String(formData.MajorID).trim();
        for (let i = 0; i < selectsMajor.options.length; i++) {
            if (selectsMajor.options[i].value === majorIdStr) {
                selectsMajor.selectedIndex = i;
                break;
            }
        }
    }

    if (formData.PeriodID) {
        console.log(String(formData.PeriodID).trim());
        const periodIdStr = String(formData.PeriodID).trim();
        for (let i = 0; i < selectsPeriod.options.length; i++) {
            console.log(selectsPeriod.options[i].value);
            console.log(periodIdStr);
            if (selectsPeriod.options[i].value === periodIdStr) {
                selectsPeriod.selectedIndex = i;
                break;
            }
        }
    }

    // Trigger change events to ensure any listeners are notified
    if (formData.typeid) selectsType.dispatchEvent(new Event('change'));
    if (formData.majorid) selectsMajor.dispatchEvent(new Event('change'));
    if (formData.periodid) selectsPeriod.dispatchEvent(new Event('change'));
}
export {
    initQuestion,
    globalQuestionTypes,
    globalTypesForm,
    globalMajor,
    globalPeriod
};