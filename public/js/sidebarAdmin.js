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
                    await loadContent('/public/views/pages/major.php');
                    loadMajors();
                    break;
                case "Chu kỳ":
                    await loadContent('/public/views/pages/period.php');
                    loadPeriods();
                    break;
                case "Loại khảo sát":
                    await loadContent('/public/views/pages/formType.php');
                    loadFTypes();
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

window.navigateToFTypeList = function () {
    loadContent('/public/views/pages/formType.php')
        .then(() => loadFTypes(currentFTypePage));
}
window.navigateToMajorList = function () {
    loadContent('/public/views/pages/major.php')
        .then(() => loadMajors(currentMajorPage));
}
window.navigateToPeriodList = function () {
    loadContent('/public/views/pages/period.php')
        .then(() => loadPeriods(currentPeriodPage));
}
window.loadContentFTypeForm = async function () {
    await loadContent('/public/views/pages/formTypeForm.php');
    await new Promise(resolve => setTimeout(resolve, 0));
}
window.loadContentMajorForm = async function () {
    await loadContent('/public/views/pages/majorForm.php');
    await new Promise(resolve => setTimeout(resolve, 0));
}
window.loadContentPeriodForm = async function () {
    await loadContent('/public/views/pages/periodForm.php');
    await new Promise(resolve => setTimeout(resolve, 0));
}