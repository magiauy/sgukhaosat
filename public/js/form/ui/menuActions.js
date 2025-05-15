import {getForm, getFormId} from "../main.js";
import FormSettingsModal from "../../modal/FormSettingsModal.js";
import {showToast} from "../utils/notifications.js";

function moreActionMenu() {
    // Remove all existing events and add them again
    document.querySelectorAll('.more-action').forEach(item => {
        item.addEventListener('click', handleMoreActionClick);
    });

}

function handleMoreActionClick(e) {
    // If menu box already exists, remove it and exit
    const existingMenuBox = document.getElementById('moreActionMenu');
    if (existingMenuBox) {
        existingMenuBox.remove();
        return;
    }
    console.log('More action clicked');

    e.stopPropagation();
    // Add click animation class
    const item = e.currentTarget;
    item.classList.add('clicked');
    setTimeout(() => item.classList.remove('clicked'), 400);

    // Create the menu box element
    const menuBox = document.createElement('div');
    menuBox.id = 'moreActionMenu';
    menuBox.classList.add('menu-box');

    const questionItem = item.closest('.question-item');

    // Check if any question-item contains a question-description
    const hasDescription = !!questionItem.querySelector('.question-description');

    // Set the content for the menu item including the checkmark if condition is met
    let menuItemContent;
    if (hasDescription) {
        menuItemContent = `
        <div class="menu-item">
            <span class="checkmark"><i class="fas fa-check"></i></span>
            <span class="menu-label">Mô tả</span>
        </div>`;
    } else {
        menuItemContent = `
        <div class="menu-item">
            <span class="checkmark"></span>
            <span class="menu-label">Mô tả</span>
        </div>`;
    }
    menuBox.innerHTML = menuItemContent;

    // Position the menu box relative to the clicked element
    const rect = item.getBoundingClientRect();
    menuBox.style.top = (rect.bottom + window.scrollY) + 'px';
    menuBox.style.left = (rect.left + window.scrollX) + 'px';

    document.body.appendChild(menuBox);
    setTimeout(() => menuBox.classList.add('show'), 0);

    const menuItem = menuBox.querySelector('.menu-item');
    if (menuItem) {
        menuItem.addEventListener('click', function(ev) {
            handleMenuItemClick(ev, questionItem, hasDescription, menuBox);
        });
    }

    // Close the menu box when clicking outside of it
    document.addEventListener('click', function onDocClick(ev) {
        if (!menuBox.contains(ev.target) && ev.target !== item) {
            menuBox.classList.remove('show');
            setTimeout(() => menuBox.remove(), 300);
            document.removeEventListener('click', onDocClick);
        }
    });

}

function handleMenuItemClick(ev, questionItem, hasDescription, menuBox) {
    ev.stopPropagation();
    const questionContent = questionItem.querySelector('.question-content');
    if (!hasDescription) {
        const questionDescription = document.createElement('div');
        questionDescription.classList.add('question-description');
        questionDescription.innerHTML = `
            <div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả"></div>
        `;
        if (questionContent) {
            questionContent.insertAdjacentElement('afterend', questionDescription);
        }
    } else {
        const questionDescription = questionItem.querySelector('.question-description');
        if (questionDescription) {
            questionDescription.remove();
        }
    }
    menuBox.classList.remove('show');
    setTimeout(() => menuBox.remove(), 300);
}

export { moreActionMenu, handleMoreActionClick };