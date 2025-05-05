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
            const text = e.target.textContent.trim();

            switch (text) {
                case "Tài khoản":
                    await renderContentUser();
                    break;
                case "Quản lý ngành":
                    await loadContent('/public/views/pages/major.php');
                    await initMajor();
                    break;
                case "Chu kỳ":
                    await loadContent('/public/views/pages/period.php');
                    await initPeriod();
                    break;
                case "Loại khảo sát":
                    await loadContent('/public/views/pages/formType.php');
                    await initFormType();
                    break;
                case "Quản lý chức vụ":
                    await loadContent('/public/views/pages/position.php');
                    await initPosition();
                    break;
                case "Phân quyền":
                    renderContentRole();
                    break;
                case "Khảo sát":
                    await loadContent2(`/pages/survey`);
                    await loadSurveyFromAPI(0, 10);
                    break;
                default:
                    break;
            }

            const content = document.getElementById('content');
            const sidebar = document.getElementById('sidebar');

            function adjustSidebarHeight() {
                const contentHeight = content.offsetHeight;
                sidebar.style.height = contentHeight + 'px';
            }

            adjustSidebarHeight();
            window.addEventListener('resize', adjustSidebarHeight);
        }
    })
    }
async function loadContent2(url) {

    const content = await callApi(url)
    document.getElementById('content').innerHTML = content['html'];
}
    async function loadContent(url) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "text/html",
            }
        });
        if (response.ok) {
            const content = await response.text();
            document.getElementById('content').innerHTML = content;
        } else if (response.status === 401) {
            window.location.href = "/login";
        } else if (response.status === 403) {
            window.location.href = "/403";
        } else {
            console.error("Failed to load:", url);
        }
    }
    

function loadSurveyInformation(data) {
    if (data) {
        const content = document.getElementById('content');
        content.innerHTML = data['html'];
    }
}


handleClickOnSidebar()