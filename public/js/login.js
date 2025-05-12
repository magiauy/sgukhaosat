import {callApi} from "./apiService.js";

document.addEventListener("DOMContentLoaded", async function () {
    const loginForm = document.getElementById("login-form");

    // Xóa event listener cũ nếu có
    loginForm.replaceWith(loginForm.cloneNode(true));
    const newLoginForm = document.getElementById("login-form");

    newLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        // Disable form để tránh submit nhiều lần
        const submitButton = newLoginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            console.log(`${config.apiUrl}`);
            
            const response = await fetch(`${config.apiUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
           
                const textResponse = await response.text();
                console.error("Received non-JSON response:", textResponse);
                throw new Error("Server returned invalid response format. Please try again later.");
            }
            
            const data = await response.json();

            if (response.ok) {
                // localStorage.setItem("token", data.token);
                document.cookie = `access_token=${data['data']['token']}; path=/; max-age=600;`;
                document.cookie = `refresh_token=${data['data']['refreshToken']}; path=/; max-age=604800;`;

                await showPopup(data['message'], "success");
            } else {
                showPopup(data.message || "Email hoặc mật khẩu không chính xác!", "error");
            }
            console.log("Response:", data);
        } catch (error) {
            console.error("Lỗi khi gửi request:", error);
            showPopup(error.message || "Có lỗi xảy ra khi kết nối đến máy chủ, vui lòng thử lại sau!", "error");
        } finally {
            // Enable lại form sau khi xử lý xong
            submitButton.disabled = false;
        }
    });
});

function showPopup(message, type = "success") {
    // Xóa modal cũ nếu có
    const existingModal = document.getElementById("popupModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Tạo modal Bootstrap
    const modalHtml = `
        <div class="modal fade" id="popupModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-${type === "success" ? "success" : "danger"}">
                    <div class="modal-header bg-${type === "success" ? "success" : "danger"} text-white">
                        <h5 class="modal-title">${type === "success" ? "Thành công" : "Lỗi"}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Thêm vào body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById("popupModal"));
    modal.show();
    if (type === "success") {
        // Tự động đóng sau 3 giây
        const navigationTimeout = setTimeout(() => {
            window.location.href = "/";
        }, 2000);

// Also handle modal hidden event
        const popupModal = document.getElementById("popupModal");
        popupModal.addEventListener('hidden.bs.modal', () => {
            clearTimeout(navigationTimeout); // Clear the timeout if modal closes early
            window.location.href = "/";
        });
    }

// Set auto-close timeout (still keep this if you want the modal to auto-close)
    setTimeout(() => modal.hide(), 3000);
}
