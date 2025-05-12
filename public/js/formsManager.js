import PaginationComponent from './component/pagination.js';
import FormSettingsModal from "./modal/formSettingsModal.js";
import {callApi} from "./apiService.js";
import {showSwalToast} from "./form/utils/notifications.js";

const formSettingsModal = new FormSettingsModal(config);
async function loadSurveyTable(data) {
    // console.log(data);

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
    let i = 0;

    // Render table rows
    table.innerHTML = '';
    data.forms.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.tooltip = item.FName;
        row.innerHTML = `
            <td class="ps-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input majorCheckbox" value="${item.FID}">
                    </div>
            </td>
            <td>${++i}</td>
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
                <a href="${item.uri}" class="btn btn-outline-warning btn-edit-form"><i class="bi bi-pencil-square"></i></a>
                <button class="btn btn-outline-secondary btn-settings btn-setting-form" data-id="${item.FID}">
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
                const checkbox = firstTd.querySelector('.form-check-input');
                const fid = checkbox ? checkbox.value : null;
                console.log("Selected FID:", fid);
                // console.log(fid);
                if (this.classList.contains('btn-edit-form')) {
                    window.location.href = `${config.Url}/admin/form/${fid}/edit`;
                } else if (this.classList.contains('btn-setting-form')) {
                    const form = data.forms.find(item => item.FID == fid);

                    await formSettingsModal.open(fid, form);
                }
            }
        });
    });

const btnAddForm = document.querySelector('.btn-add-form');
if (btnAddForm) {
    // Remove any existing event listeners first
    btnAddForm.replaceWith(btnAddForm.cloneNode(true));

    // Get the fresh reference after replacement
    const freshBtnAddForm = document.querySelector('.btn-add-form');

freshBtnAddForm.addEventListener('click', async function() {
    try {
        // Disable button to prevent multiple clicks
        this.disabled = true;

        const data = await callApi(`/draft`, 'POST');
        if (data && data['url']) {
            // Remove any existing modal
            const existingModal = document.getElementById("popupModal");
            if (existingModal) {
                existingModal.remove();
            }

            // Create the modal element
            const modal = document.createElement('div');
            modal.id = "popupModal";
            modal.className = "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center";
            modal.style.cssText = "background: rgba(0,0,0,0.5); z-index: 1050; opacity: 0; transition: opacity 0.3s ease;";

            modal.innerHTML = `
                <div class="bg-white p-4 rounded shadow" style="max-width: 400px; transform: translateY(-20px); transition: transform 0.3s ease;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>Thông báo</h5>
                        <button type="button" class="btn-close" id="closePopupBtn"></button>
                    </div>
                    <div class="text-center">
                        <i class="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                        <p>Biểu mẫu đang được tạo. Bạn sẽ được chuyển hướng sau giây lát.</p>
                    </div>
                </div>
            `;

            // Add to DOM
            document.body.appendChild(modal);

            // Trigger reflow to ensure transitions work
            void modal.offsetWidth;

            // Fade in the modal
            requestAnimationFrame(() => {
                modal.style.opacity = "1";
                modal.querySelector(".bg-white").style.transform = "translateY(0)";
            });

            // Function to handle closing and navigation
            const closeAndNavigate = () => {
                // Fade out animation
                modal.style.opacity = "0";
                modal.querySelector(".bg-white").style.transform = "translateY(-20px)";

                // Wait for animation to complete before navigation
                setTimeout(() => {
                    modal.remove();
                    window.location.href = `${config.Url}${data['url']}`;
                }, 300);
            };

            // Set up navigation timeout
            const navigationTimeout = setTimeout(() => {
                closeAndNavigate();
            }, 2000);

            // Add close button event handler
            document.getElementById("closePopupBtn").onclick = function() {
                clearTimeout(navigationTimeout);
                closeAndNavigate();
            };
        }
    } catch (error) {
        console.error("Error creating draft form:", error);
    } finally {
        // Re-enable button
        this.disabled = false;
    }
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
            typeSelect.innerHTML = `<option value="all">Tất cả loại hình khảo sát</option>`;
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
            majorSelect.innerHTML = `<option value="all">Tất cả ngành</option>`;
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
            periodSelect.innerHTML = `<option value="all">Tất cả chu kỳ</option>`;
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


