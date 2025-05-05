// paginationComponent.js
export default class PaginationComponent {
  constructor(options = {}) {
    this.containerId = options.containerId || 'pagination';
    this.onPageChange = options.onPageChange || (() => {});
    this.onLimitChange = options.onLimitChange || (() => {});
    this.rowsPerPageText = options.rowsPerPageText || 'Rows per page';
    this.limitOptions = options.limitOptions || [10, 20, 50, 100];
    this.currentPage = 1;
    this.totalPages = 1;
    this.limit = 10;
    this.totalItems = 0;
  }

  render(data = {}) {
    // Update pagination state
    this.currentPage = data.currentPage || this.currentPage;
    this.totalPages = data.totalPages || this.totalPages;
    this.limit = data.limit || this.limit;
    this.totalItems = data.totalItems || this.totalItems;

    const pagination = document.getElementById(this.containerId);
    if (!pagination) return;

    pagination.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'd-flex align-items-center justify-content-between flex-wrap gap-3 py-2 px-3 border rounded bg-light shadow-sm';

    // Rows per page select
    const rowsPerPageDiv = document.createElement('div');
    rowsPerPageDiv.className = 'd-flex align-items-center gap-2';

    const label = document.createElement('label');
    label.className = 'form-label mb-0 fw-semibold';
    label.textContent = this.rowsPerPageText;

    const select = document.createElement('select');
    select.className = 'form-select form-select-sm w-auto';
    this.limitOptions.forEach(val => {
      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      if (val === this.limit) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      const newLimit = parseInt(select.value);
      this.onLimitChange(0, newLimit);
    });

    rowsPerPageDiv.appendChild(label);
    rowsPerPageDiv.appendChild(select);

    // Info: "x-y of z"
    const start = (this.currentPage - 1) * this.limit + 1;
    const end = Math.min(this.currentPage * this.limit, this.totalItems);
    const info = document.createElement('div');
    info.className = 'fw-medium';
    info.textContent = `${start}-${end} of ${this.totalItems}`;

    // Pagination navigation
    const nav = document.createElement('ul');
    nav.className = 'pagination pagination-sm mb-0';

    // SVG icons
    const icons = {
      first: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="first-page">
        <path fill="none" d="M24 0v24H0V0h24z" opacity=".87"></path>
        <path d="M17.7 15.89L13.82 12l3.89-3.89c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.38.38-1.02-.01-1.4zM7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1z"></path>
      </svg>`,
      prev: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="keyboard-left-arrow">
        <path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"></path>
      </svg>`,
      next: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="keyboard-right-arrow">
        <path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"></path>
      </svg>`,
      last: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="last-page">
        <path fill="none" d="M0 0h24v24H0V0z" opacity=".87"></path>
        <path d="M6.29 8.11L10.18 12l-3.89 3.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L7.7 6.7c-.39-.39-1.02-.39-1.41 0-.38.39-.38 1.03 0 1.41zM17 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1z"></path>
      </svg>`
    };

    // Create navigation controls
    nav.appendChild(this.createNavItem(icons.first, 1, this.currentPage === 1));
    nav.appendChild(this.createNavItem(icons.prev, this.currentPage - 1, this.currentPage === 1));
    nav.appendChild(this.createNavItem(icons.next, this.currentPage + 1, this.currentPage === this.totalPages));
    nav.appendChild(this.createNavItem(icons.last, this.totalPages, this.currentPage === this.totalPages));

    // Append components to container
    container.appendChild(rowsPerPageDiv);
    container.appendChild(info);
    container.appendChild(nav);

    pagination.appendChild(container);
  }

  createNavItem(svg, page, disabled) {
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
        const offset = (page - 1) * this.limit;
        this.onPageChange(offset, this.limit);
      });
    }

    return li;
  }
}