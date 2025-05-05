import PaginationComponent from './component/pagination.js';


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
            <td class="text-center">${item.TypeID}</td>
            <td class="text-center">${item.MajorID}</td>
            <td class="text-center">${item.PeriodID}</td>
            <td class="text-left">${item.Note}</td>
            <td class="text-center">${item.UID}</td>
            <td class="text-center">${item.Status}</td>
            <td style="display: flex; justify-content: center; align-items: center; height: 65px">
<!--                <div class="flex justify-content-sm-between">-->
<!--                    <button class="btn btn-success custom-button">Chi tiết</button>-->
<!--                    <button class="btn btn-warning custom-button" href="${item.uri}">Sửa</button>-->
<!--                </div>-->
    <a href="${item.uri}" class="btn btn-warning custom-button">Sửa</a>
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
                const text = button.textContent.trim();
                const fid = firstTd.textContent.trim();
                const form = data.forms.find(item => item.FID === fid);

                if (text === "Chi tiết") {
                    fetchSurveyData(firstTd, form);
                } else if (text === "Sửa") {
                    window.location.href = `${config.Url}/admin/form/${fid}/edit`;
                }
            }
        });
    });

    const btnAddForm = document.querySelector('.btn-add-form');
    if (btnAddForm) {
        btnAddForm.addEventListener('click', async function () {
            const res = await fetch(`${config.apiUrl}/draft`, {
                method: 'POST',

            });
            if (res.ok) {
                const data = await res.json();
                const url = data['url'];
                window.location.href = `${config.Url}${url}`;
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
    const lines = text.split('\n');
    const limitedLines = lines.slice(0, maxLineBreaks).join('\n');
    return limitedLines.length > maxWidth ? limitedLines.substring(0, maxWidth) + ' ...' : limitedLines;
}
export async function loadSurveyFromAPI(offset, limit) {
    try {
        currentLimit = limit;
        const res = await fetch(`${config.apiUrl}/admin/forms/pagination?offset=${offset}&limit=${limit}`);
        const data = await res.json();
        await loadSurveyTable(data['data']);

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


let currentLimit = 10;
let isHavePagination = false;
const pagination = new PaginationComponent({
    containerId: 'pagination',
    onPageChange: (offset, limit) => {
        loadSurveyFromAPI(offset, limit);
    },
    onLimitChange: (offset, limit) => {
        loadSurveyFromAPI(offset, limit);
    },
    rowsPerPageText: 'Rows per page'
});
