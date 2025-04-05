// Tệp auth.js để xử lý tất cả các vấn đề liên quan đến quyền truy cập và đăng nhập.

export async function checkAccess(page) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        redirectToLogin(page);
        return false;
    }

    const permission = document.body.getAttribute('data-token');
    console.log(permission)
    // Kiểm tra đăng nhập trước khi kiểm tra quyền truy cập
    await checkLogin(page);

    const controller = new AbortController();
    const signal = controller.signal;

    // Thêm event để hủy request khi rời trang
    window.addEventListener('beforeunload', () => {
        controller.abort();
    });

    try {
        // Kiểm tra quyền truy cập của user
        const response = await fetch(`${config.apiUrl}/verify-access`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permission }),
            signal: signal
        });

        // Nếu không có quyền truy cập, chuyển hướng đến trang 403
        if (response.status === 403) {
            window.location.href = '/';
            return false;
        }

        if (response.status === 401) {
            window.location.href = '/401';
            return false;
        }

        // Sau khi kiểm tra quyền truy cập, xóa thuộc tính permission
        document.body.removeAttribute('data-token');
        // document.body.removeAttribute('style');
        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            // Request bị hủy, không làm gì
            return false;
        }
        // Xử lý lỗi nếu API không thành công
        redirectToLogin(page);
    }
}

// Hàm kiểm tra đăng nhập
export async function checkLogin(page = 'login') {
    const token = sessionStorage.getItem('token');
    console.log("Checking login status...");
    if (!token) {
        console.log("No token found, redirecting to login");
        redirectToLogin(page);
        return;
    }

    try {
        console.log("Token found, checking login status");
        const response = await fetch(`${config.apiUrl}/me`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.log("Token expired, redirecting to login");
            sessionStorage.clear();
            redirectToLogin(page);
            return;
        }

        console.log("Login status checked");

    } catch (error) {
        redirectToLogin(page);
    }
}

// Hàm chuyển hướng về trang đăng nhập
function redirectToLogin(page = 'login') {
    if (page !== 'login') {
        window.location.href = '/login';
    }
}
