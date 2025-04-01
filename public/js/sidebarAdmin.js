import { renderContentUser } from "./userAdmin.js";
import { renderContentRole } from "./roleAdmin.js";



function handleClickOnSidebar(){
    document.getElementById('toggleSidebar').onclick = () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }; 

    document.querySelectorAll("#sidebar ul li a").forEach((item) => {
        item.onclick = (e) => {
            e.preventDefault();
            if(e.target.textContent.trim() === "Tài khoản"){
                renderContentUser();
            }
            else if(e.target.textContent.trim() === "Phân quyền"){
                renderContentRole();
            }
        }
       
    })
}

handleClickOnSidebar();

