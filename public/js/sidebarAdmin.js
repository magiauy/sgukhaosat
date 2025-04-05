import { checkAccess } from "./checkAccess.js";
import { renderContentUser } from "./userAdmin.js";
import { renderContentRole } from "./roleAdmin.js";
function handleClickOnSidebar() {
    document.getElementById('toggleSidebar').onclick = () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }; 

    document.querySelectorAll("#sidebar ul li a").forEach((item) => {
        item.onclick = (e) => {
            e.preventDefault();
            const text = e.target.textContent.trim();

            if (text === "Tài khoản") {
                renderContentUser();
            } else if (text === "Quản lý ngành") {
                loadContent("./views/pages/qlnganh.php");
            } else if (text === "Chu kỳ") {
                loadContent("./views/pages/chuky.php");
            } else if (text === "Loại khảo sát") {
                loadContent("./views/pages/loaiks.php");
            } else if (e.target.textContent.trim() === "Phân quyền") {
                renderContentRole();
            }
        }
    })
    }
function loadContent(url) {
    fetch(url)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("content").innerHTML = data;
        })
        .catch((error) => {
            document.getElementById("content").innerHTML =
                "<p class='text-danger'>Lỗi tải nội dung!</p>";
            console.error("Error loading content:", error);
        });
}
async function initialize() {
    if (await checkAccess('admin')){
        handleClickOnSidebar()
        document.getElementById("loading-overlay").style.display = "none";
        document.getElementById("sidebar-container").removeAttribute("style");
        document.getElementById("sidebar-container").setAttribute("class", "d-flex flex-row");
    }else {
        document.getElementById("loading-overlay").style.display = "none";
        document.getElementById("sidebar-container").setAttribute("style", "display: none;");
    }
}


initialize();

