import PaginationComponent from './component/pagination.js';
import FormSettingsModal from "./modal/formSettingsModal.js";
import {callApi} from "./apiService.js";
import {showSwalToast} from "./form/utils/notifications.js";

const formSettingsModal = new FormSettingsModal(config);
async function loadSurveyTable(data) {

    if (!data || !data.forms) {
        console.error("Invalid survey data.");
        return;
    }

    const table = document.getElementById('surveyTable');
    const pagination = document.getElementById('pagination');

    if (!table || !pagination) {
        console.error("Required elements not found.");
        return;
    }

    // Render table rows
    table.innerHTML = '';
    data.forms.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.tooltip = item.FName;
        row.innerHTML = `
            <td class="text-center" >${item.FID}</td>
            <td class="text-left tooltip-trigger" data-tooltip="${item.FName}">
                ${limitLineBreaks(item.FName, 2,41)}
                </td>
            <td class="text-center">${item.TypeName}</td>
            <td class="text-center tooltip-trigger" data-tooltip="${item.MajorName}">
                ${limitLineBreaks(item.MajorName, 2, 20)}
            </td>
            <td class="text-center">${item.PeriodName}</td>
            <td class="text-left tooltip-trigger" data-tooltip="${item.Note}">
                ${limitLineBreaks(item.Note, 2, 41)}
            </td>
            <td class="text-center">${item.UID}</td>
            <td class="text-center">${item.StatusText}</td>
            <td style="display: flex; justify-content: center; align-items: center; gap: 5px; height: 65px">
                <a href="${item.uri}" class="btn btn-warning custom-button btn-edit-form">Sửa</a>
                <button class="btn btn-secondary btn-settings custom-button btn-setting-form" data-id="${item.FID}">
                    <i class="bi bi-gear-fill"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });

    // Event for buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', async function () {
            const row = this.closest('tr');
            const firstTd = row?.querySelector('td');
            if (firstTd) {
                const fid = firstTd.textContent.trim();
                if (this.classList.contains('btn-edit-form')) {
                    window.location.href = `${config.Url}/admin/form/${fid}/edit`;
                } else if (this.classList.contains('btn-setting-form')) {
                    const fid = firstTd.textContent.trim();
                    const form = data.forms.find(item => item.FID == fid);
                    await formSettingsModal.open(fid, form);
                }
            }
        });
    });

    const btnAddForm = document.querySelector('.btn-add-form');
    if (btnAddForm) {
        btnAddForm.addEventListener('click', async function () {
            const data = await callApi(`/draft`, 'POST');
                const url = data['url'];
                window.location.href = `${config.Url}${url}`;
        });
    }



    cleanupTooltips();
// Call the function to add tooltip functionality
    addTooltips();

// Loại bỏ các phần tử tooltip cũ nếu có để tránh trùng lặp (ví dụ khi tải lại hoặc cập nhật bảng)
    function cleanupTooltips() {
        const existingTooltips = document.querySelectorAll('.tooltip-outside');
        existingTooltips.forEach(tooltip => tooltip.remove());
    }


}

function limitLineBreaks(text, maxLineBreaks,maxWidth) {
    if (!text) return 'null';

    const lines = text.split('\n');
    const limitedLines = lines.slice(0, maxLineBreaks).join('\n');
    return limitedLines.length > maxWidth ? limitedLines.substring(0, maxWidth) + ' ...' : limitedLines;
}
export async function loadSurveyFromAPI(offset, limit) {
    try {
        currentLimit = limit;
        let data ;
        if (isFilter){
             data = await callApi(`/admin/forms/pagination?offset=${offset}&limit=${limit}&isFilter=true`, 'POST',{
                filter: {
                    FName: document.getElementById('search-form')?.value || '',
                    TypeID: document.getElementById('form-type-select')?.value || 'all',
                    MajorID: document.getElementById('major-select')?.value || 'all',
                    PeriodID: document.getElementById('period-select')?.value || 'all'
                }
            });

        }else {
             data = await callApi(`/admin/forms/pagination?offset=${offset}&limit=${limit}`);
        }
        if (!data['status']) {
            showSwalToast('Không tìm thấy khảo sát nào', 'error');
            return;
        }

        await loadSurveyTable(data['data']);

        if (isFirstLoad) {
            setupFilterInputs();
            isFirstLoad = false;
        }

        pagination.render({
            currentPage: data['data']['currentPage'],
            totalPages: data['data']['totalPages'],
            limit: limit,
            totalItems: data['data']['totalItems']
        });

    } catch (error) {
        console.error("Failed to load survey data:", error);
    }
}
function addTooltips() {
    document.querySelectorAll(`.tooltip-outside`).forEach(t => t.remove());

    const tooltipTriggers = document.querySelectorAll(`.tooltip-trigger`);

    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener(`mouseenter`, () => {
            const tooltipText = trigger.getAttribute(`data-tooltip`);
            if (!tooltipText) return;

            const tooltipEl = document.createElement(`div`);
            tooltipEl.classList.add(`tooltip-outside`);
            tooltipEl.style.opacity = `0`;
            tooltipEl.style.minHeight = `20px`;
            tooltipEl.textContent = tooltipText;
            tooltipEl.style.position = `absolute`;
            tooltipEl.style.padding = `5px 10px`;
            tooltipEl.style.backgroundColor = `#333`;
            tooltipEl.style.color = `#fff`;
            tooltipEl.style.borderRadius = `4px`;
            tooltipEl.style.whiteSpace = `normal`;
            tooltipEl.style.overflowWrap = `break-word`;
            tooltipEl.style.zIndex = `1000`;
            tooltipEl.style.visibility = `hidden`;

            // Gắn vào body
            document.body.appendChild(tooltipEl);

            requestAnimationFrame(() => {
                const rect = trigger.getBoundingClientRect();
                const tooltipWidth = tooltipEl.offsetWidth;
                const tooltipHeight = tooltipEl.offsetHeight;

                let topPos = rect.bottom + window.scrollY + 5; // Tính toán theo viewport + scroll
                let leftPos = rect.left + window.scrollX + (rect.width - tooltipWidth) / 2;

                tooltipEl.style.top = topPos + `px`;
                tooltipEl.style.left = leftPos + `px`;
                tooltipEl.style.opacity = `1`;
                tooltipEl.style.visibility = `visible`;
            });

            trigger.addEventListener(`mouseleave`, () => {
                tooltipEl.remove();
            }, { once: true });
        });
    });
}

export function cleanupModalBackdrops() {
    // Remove excess modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length > 1) {
        for (let i = 1; i < backdrops.length; i++) {
            backdrops[i].remove();
        }
    }

    // If no modal is open but backdrop exists, remove it
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0 && backdrops.length > 0) {
        backdrops[0].remove();
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}
// Event listeners for filter inputs
function setupFilterInputs() {
    const searchInput = document.getElementById('search-form');
    const formTypeSelect = document.getElementById('form-type-select');
    const majorSelect = document.getElementById('major-select');
    const periodSelect = document.getElementById('period-select');

    const dataType = callApi(`/form-type`, 'GET');
    const dataMajor = callApi(`/major`, 'GET');
    const dataPeriod = callApi(`/period`, 'GET');

    dataType.then(data => {
        if (data && data.data) {
            const typeSelect = document.getElementById('form-type-select');
            typeSelect.innerHTML = `<option value="all">Loại khảo sát</option>`;
            data.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.FTypeID;
                option.textContent = item.FTypeName;
                typeSelect.appendChild(option);
            });
        }
    });
    dataMajor.then(data => {
        if (data && data.data) {
            const majorSelect = document.getElementById('major-select');
            majorSelect.innerHTML = `<option value="all">Ngành</option>`;
            data.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.MajorID;
                option.textContent = item.MajorName;
                majorSelect.appendChild(option);
            });
        }
    });
    dataPeriod.then(data => {
        if (data && data.data) {
            const periodSelect = document.getElementById('period-select');
            periodSelect.innerHTML = `<option value="all">Giai đoạn</option>`;
            data.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.periodID;
                option.textContent = item.startYear + ' - ' + item.endYear;
                periodSelect.appendChild(option);
            });
        }
    });
    const btnFilter = document.querySelector('.btn-filter');
    if (btnFilter) {
        btnFilter.addEventListener('click', async function () {
            isFilter = true;
            const offset = 0;
            await loadSurveyFromAPI(offset, currentLimit);
        });
    }
    const btnReset = document.querySelector('.btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', async function () {
            isFilter = false;
            searchInput.value = '';
            formTypeSelect.value = 'all';
            majorSelect.value = 'all';
            periodSelect.value = 'all';
            const offset = 0;
            await loadSurveyFromAPI(offset, currentLimit);
        });
    }

}


let currentLimit = 10;
let isHavePagination = false;
let isFilter = false;
let isFirstLoad = true;
const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: async (offset, limit) => {
        await loadSurveyFromAPI(offset, limit);
    },
    onLimitChange: async (offset, limit) => {
        await loadSurveyFromAPI(offset, limit);
    },
    rowsPerPageText: 'Rows per page'
});


