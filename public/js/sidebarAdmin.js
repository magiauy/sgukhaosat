function submenuClick(){
    document.querySelectorAll(".submenu").forEach((submenuItem) => {
        submenuItem.onclick = (e) => {
            if(e.target.textContent.trim() === "Tài khoản"){
                renderContentSubmenuAccount();
            }
        }
    })

    document.querySelector(".hidden-sidebar").onclick = () => {
        document.querySelector(".sidebar").classList.toggle("active-hidden");
    }
}

submenuClick();

function renderContentSubmenuAccount(){
    document.querySelector(".submenu-content").innerHTML = `
        
    `
}
