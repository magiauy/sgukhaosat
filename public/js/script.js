document.addEventListener("DOMContentLoaded", async () => {
    const logout = document.getElementById('logout');
    if (logout) {
        logout.addEventListener('click', async (e) => {
            sessionStorage.clear();
        });
    }

    const token = sessionStorage.getItem('token');
    const response = await fetch(`${config.apiUrl}/me`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status===200) {
        const data = await response.json();
        document.getElementById('btn-login').outerHTML = `
                <div class="dropdown">
                    <button class="btn dropdown-toggle d-flex align-items-center gap-2" 
                            type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle fs-5"></i>
                        <span id="username">Loading...</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end mt-2 shadow-lg border-0 rounded-3" 
                        aria-labelledby="dropdownMenuButton">
                        <li class="px-3 py-2">
                            <p class="mb-0 fw-bold text-dark" id="dropdown-username">Loading...</p>
                            <small class="text-muted" id="dropdown-email">Loading...</small>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                        <a class="dropdown-item py-2 d-flex align-items-center gap-2" id ="btn-admin" href="/admin?token=${token}">
                        <i class="bi bi-house"></i> Trang quản trị
                        </a>    
                        </li>
                        
                        <li>
                            <a class="dropdown-item py-2 text-danger fw-bold d-flex align-items-center gap-2" href="/" id="logout">
                                <i class="bi bi-box-arrow-right"></i> Đăng xuất
                            </a>
                        </li>
                    </ul>
                </div>
            `;
        document.getElementById('username').innerText = data['data']['user']['fullName']??'username';
        document.getElementById('dropdown-username').innerText = data['data']['user']['fullName']?? 'username';
        document.getElementById('dropdown-email').innerText = data['data']['user']['email'];
        document.getElementById('logout').addEventListener('click', (e) => {
            sessionStorage.clear();
        });



    } else if (response.status===401) {
        sessionStorage.clear();
    }

});

