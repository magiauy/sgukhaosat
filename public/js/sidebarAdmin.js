import { renderContentUser } from "./userAdmin.js";



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
        }
       
    })
}

handleClickOnSidebar();

