document.addEventListener("DOMContentLoaded", function () {
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

            const response = await fetch(`${config.apiUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // localStorage.setItem("token", data.token);
                showPopup(data['message'], "success");
                sessionStorage.setItem('token', data['data']['token']);
                // Chuyển hướng đến trang chính
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                showPopup("Email hoặc mật khẩu không chính xác!", "error");
            }
        } catch (error) {
            console.error("Lỗi khi gửi request:", error);
            showPopup("Có lỗi xảy ra, vui lòng thử lại!", "error");
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

    // Tự động đóng sau 3 giây
    setTimeout(() => modal.hide(), 3000);

}
