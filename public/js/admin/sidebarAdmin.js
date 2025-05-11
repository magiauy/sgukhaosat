import {renderContentUser} from "./user/userAdmin.js";
import {renderContentRole} from "./role/roleAdmin.js";
import {loadSurveyFromAPI} from "../formsManager.js";
import {callApi} from "../apiService.js";
import {initMajor} from "../major.js";
import {initPeriod} from "../period.js";
import {initFormType} from "../formType.js";
import {initPosition} from "../position.js";

function handleClickOnSidebar() {
    document.getElementById('toggleSidebar').onclick = () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    };

    document.querySelectorAll("#sidebar ul li a").forEach((item) => {
        item.onclick = async (e) => {
            e.preventDefault();
            document.querySelectorAll("#sidebar ul li a").forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to the clicked link
            const linkElement = e.target.closest('a');
            linkElement.classList.add('active');

            const text = e.target.textContent.trim();

            switch (text) {
                case "Tài khoản":
                    await renderContentUser();
                    break;
                case "Quản lý ngành":
                    await loadContent('/pages/major');
                    await initMajor();
                    break;
                case "Chu kỳ":
                    await loadContent('/pages/period');
                    await initPeriod();
                    break;
                case "Loại khảo sát":
                    await loadContent('/pages/formType');
                    await initFormType();
                    break;
                case "Quản lý chức vụ":
                    await loadContent('/pages/position');
                    await initPosition();
                    break;
                case "Phân quyền":
                    renderContentRole();
                    break;
                case "Khảo sát":
                    await loadContent(`/pages/survey`);
                    await loadSurveyFromAPI(0, 10);
                    break;
                default:
                    break;
            }

            setTimeout(adjustSidebarHeight, 100);

        }
    })
    }
async function loadContent(url) {

    const content = await callApi(url)
    const contentElement = document.getElementById('content');
    contentElement.style.height = '';
    contentElement.style.minHeight = '';

    // Set new content
    contentElement.innerHTML = content['html'];

    // Adjust sidebar after a moment
    setTimeout(adjustSidebarHeight, 100);
}

function adjustSidebarHeight() {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');

    // Reset content element's inline height if any
    content.style.height = '';
    content.style.minHeight = '';

    // Force browser to recalculate layout
    void content.offsetHeight;

    // Reset sidebar height completely
    sidebar.style.height = '';
    sidebar.style.minHeight = '';

    // Wait a brief moment for the DOM to settle
    setTimeout(() => {
        // Get current content height after reset
        const contentHeight = content.scrollHeight;
        const minViewportHeight = window.innerHeight - 295;

        // Set the height based on content
        sidebar.style.height = contentHeight + 'px';
        sidebar.style.minHeight = `${minViewportHeight}px`;

        console.log('Reset sizes - Content height:', contentHeight);
    }, 50);
}
handleClickOnSidebar()