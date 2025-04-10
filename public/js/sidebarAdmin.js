import { checkAccess } from "./checkAccess.js";
import { renderContentUser } from "./userAdmin.js";
import { renderContentRole } from "./roleAdmin.js";
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
                    await loadContent(`${config.apiUrl}/pages/survey`, loadSurveyTable);
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
async function loadContent(url, table=null) {
    const response = await fetch(url,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (response.ok) {
        const content = await response.json();
        document.getElementById('content').innerHTML = content['html'];
        if (table){
            console.log("table", content['data']['forms']);
            table(content['data']['forms']);
        }
    } else if (response.status === 401) {
        // Handle unauthorized access
        window.location.href = "/login";
    } else if (response.status === 403) {
        // Handle forbidden access
        window.location.href = "/403";
    }
}

async function loadSurveyTable(data) {
    if (data) {
        const table = document.getElementById('surveyTable');
        if (!table) {
            console.error("Element with ID surveyTable not found.");
            return;
        }
        console.log(data)

        table.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">${item.FID}</td>
                <td class="text-left">${item.FName}</td>
                <td class="text-center">${item.TypeID}</td>
                <td class="text-center">${item.MajorID}</td>
                <td class="text-center">${item.PeriodID}</td>
                <td class="text-left">${item.Note}</td>
                <td class="text-center">"User"</td>
                <td class="text-center">${item.Status}</td>
                <td>
                <div class="flex justify-content-sm-between" >
                    <button class="btn btn-success custom-button" >Chi tiết</button>
                    <button class="btn btn-warning custom-button">Sửa</button>
                </div>
                </td>
            `;

            table.appendChild(row);

        });
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function () {
                // Get the closest row (tr) of the clicked button
                const row = this.closest('tr');
                if (row) {
                    // Get the first td element in that row
                    const firstTd = row.querySelector('td');
                    if (firstTd) {
                        const text = button.textContent.trim();
                        if (text === "Chi tiết") {
                            const fid = firstTd.textContent.trim();
                            // loadContent(`${config.apiUrl}/pages/survey/${fid}`, loadSurveyInformation);

                      const form = data.find(item => item.FID === fid);
                            fetchSurveyData(firstTd,form)
                        }else if (text === "Sửa") {
                            const fid = firstTd.textContent.trim();
                            //goto url
                            window.location.href = `${config.Url}/admin/form/${fid}/edit`;
                        }
                    }
                }
            });
        });

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

