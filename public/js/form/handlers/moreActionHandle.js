import { callApi } from "../../apiService.js";
import { showToast } from "../utils/notifications.js";
import { getFormId, getFormStatus, getForm } from "../main.js";
import FormSettingsModal from "../../modal/FormSettingsModal.js";

function moreActionHandle() {
    document.querySelector('.more-action-menu').addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        // Remove any existing dropdown menus first
        document.querySelectorAll('.dropdown-menu.show').forEach(el => el.remove());

        // Create dropdown menu
        const menuHTML = `
            <div class="dropdown-menu show" style="position: absolute; z-index: 1050;">
                <a class="dropdown-item settings-option" href="#"><i class="bi bi-gear"></i> Cài đặt</a>
            </div>
        `;

        // Add menu to document
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        const menuElement = document.querySelector('.dropdown-menu.show');

        // Position the menu near the clicked element
        const rect = event.target.getBoundingClientRect();
        menuElement.style.top = `${rect.bottom + window.scrollY}px`;
        menuElement.style.left = `${rect.left + window.scrollX - 150}px`;

        // Add click event for settings option
        menuElement.querySelector('.settings-option').addEventListener('click', async function(e) {
            e.preventDefault();
            menuElement.remove(); // Close the menu

            try {
                // Get form data
                const formId = getFormId();
                const form = await getForm();

                // Open settings modal
                const formSettingsModal = new FormSettingsModal();
                await formSettingsModal.open(formId, form,'adminPage');
            } catch (error) {
                console.error('Error opening settings modal:', error);
                showToast('Không thể mở cài đặt biểu mẫu', 'error');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (menuElement && !menuElement.contains(e.target) && e.target !== event.target) {
                menuElement.remove();
            }
        }, { once: true });
    });
}

export { moreActionHandle };