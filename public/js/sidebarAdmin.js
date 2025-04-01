import { renderContentUser } from "./userAdmin.js";
import { renderContentRole } from "./roleAdmin.js";


async function checkAccess() {
    const token = sessionStorage.getItem('token');
    const permission = document.body.getAttribute('data-token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    try {
        const response = await fetch(`${config.apiUrl}/verify-access`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permission })
        });
        if (response.status === 401) {
            console.log("401")
            window.location.href= '/401';
        }else if (response.status === 403) {
            console.log("403")
            window.location.href = '/403';
        }
        document.body.removeAttribute('data-token');
    } catch (error) {
        // console.error('Error:', error);
        window.location.href = '/login';
    }
}
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
await checkAccess();
handleClickOnSidebar();

