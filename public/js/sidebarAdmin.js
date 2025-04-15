import {renderContentUser} from "./userAdmin.js";
import {renderContentRole} from "./roleAdmin.js";
import {loadSurveyFromAPI} from "./formsManager.js";

import {callApi} from "./apiService.js";


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
                    loadContent("./views/pages/qlnganh.php");
                    break;
                case "Chu kỳ":
                    loadContent("./views/pages/chuky.php");
                    break;
                case "Loại khảo sát":
                    loadContent("./views/pages/loaiks.php");
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
async function loadContent(url) {

    const content = await callApi(url)
    document.getElementById('content').innerHTML = content['html'];
}

function loadSurveyInformation(data) {
    if (data) {
        const content = document.getElementById('content');
        content.innerHTML = data['html'];
    }
}

// async function initialize() {
//     if (await checkAccess('admin')){
        handleClickOnSidebar()
//         document.getElementById("loading-overlay").style.display = "none";
//         document.getElementById("sidebar-container").removeAttribute("style");
//         document.getElementById("sidebar-container").setAttribute("class", "d-flex flex-row");
//     }else {
//         document.getElementById("loading-overlay").style.display = "none";
//         document.getElementById("sidebar-container").setAttribute("style", "display: none;");
//     }
// }
//
//
// initialize();

