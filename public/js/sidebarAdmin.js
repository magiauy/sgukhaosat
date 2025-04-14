import {renderContentUser} from "./userAdmin.js";
import {renderContentRole} from "./roleAdmin.js";
import {loadSurveyFromAPI} from "./formsManager.js";
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
                    loadTotalMajorCount();
                    break;
                case "Chu kỳ":
                    await loadContent('/public/views/pages/period.php');
                    loadPeriods();
                    loadTotalPeriodCount();
                    break;
                case "Loại khảo sát":
                    await loadContent('/public/views/pages/formType.php');
                    loadFormTypes();
                    loadTotalFormTypeCount();
                    break;
                case "Phân quyền":
                    renderContentRole();
                    break;
                case "Khảo sát":
                    await loadContent(`${config.apiUrl}/pages/survey`);
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
    const response = await fetch(url,{
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            }
        });
        if (response.ok) {
        const content = await response.json();
        document.getElementById('content').innerHTML = content['html'];
        } else if (response.status === 401) {
        // Handle unauthorized access
            window.location.href = "/login";
        } else if (response.status === 403) {
        // Handle forbidden access
            window.location.href = "/403";
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

