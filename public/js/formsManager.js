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
        if (!isHavePagination){
            renderPagination(data['data']['currentPage'], data['data']['totalPages'], limit, data['data']['totalItems']);
        }
    } catch (error) {
        console.error("Failed to load survey data:", error);
    }
}
function renderPagination(currentPage, totalPages, limit, totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'd-flex align-items-center justify-content-between flex-wrap gap-3 py-2 px-3 border rounded bg-light shadow-sm';

    // Rows per page select
    const rowsPerPageDiv = document.createElement('div');
    rowsPerPageDiv.className = 'd-flex align-items-center gap-2';

    const label = document.createElement('label');
    label.className = 'form-label mb-0 fw-semibold';
    label.textContent = 'Rows per page';

    const select = document.createElement('select');
    select.className = 'form-select form-select-sm w-auto';
    [10, 20, 50, 100].forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        if (val === limit) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        const newLimit = parseInt(this.value);
        loadSurveyFromAPI(0, newLimit); // reset về trang 1
    });

    rowsPerPageDiv.appendChild(label);
    rowsPerPageDiv.appendChild(select);

    // Info: "x-y of z"
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);
    const info = document.createElement('div');
    info.className = 'fw-medium';
    info.textContent = `${start}-${end} of ${totalItems}`;

    // Pagination navigation
    const nav = document.createElement('ul');
    nav.className = 'pagination pagination-sm mb-0';

    function createNavItem(svg, page, disabled) {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''}`;

        const link = document.createElement('a');
        link.className = 'page-link px-2 py-1';
        link.href = '#';
        link.innerHTML = svg;
        li.appendChild(link);

        if (!disabled) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const offset = (page - 1) * limit;
                loadSurveyFromAPI(offset, limit);
            });
        }
        return li;
    }

    const firstPageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="first-page">
          <path fill="none" d="M24 0v24H0V0h24z" opacity=".87"></path>
          <path d="M17.7 15.89L13.82 12l3.89-3.89c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.38.38-1.02-.01-1.4zM7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1z"></path>
        </svg>
        `
    const lastPageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="keyboard-left-arrow">
          <path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"></path>
        </svg>
        `;
    const nextPageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="keyboard-right-arrow">
          <path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"></path>
        </svg>
        `;
    const prevPageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="last-page">
          <path fill="none" d="M0 0h24v24H0V0z" opacity=".87"></path>
          <path d="M6.29 8.11L10.18 12l-3.89 3.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L7.7 6.7c-.39-.39-1.02-.39-1.41 0-.38.39-.38 1.03 0 1.41zM17 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1z"></path>
        </svg>
        `;

    nav.appendChild(createNavItem(firstPageSvg, 1, currentPage === 1));
    nav.appendChild(createNavItem(lastPageSvg, currentPage - 1, currentPage === 1));
    nav.appendChild(createNavItem(nextPageSvg, currentPage + 1, currentPage === totalPages));
    nav.appendChild(createNavItem(prevPageSvg, totalPages, currentPage === totalPages));

    // Append to container
    container.appendChild(rowsPerPageDiv);
    container.appendChild(info);
    container.appendChild(nav);

    pagination.appendChild(container);
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