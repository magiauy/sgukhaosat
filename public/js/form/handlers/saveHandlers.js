import { collectQuestionData, syncQuestion } from "../survey/dataCollector.js";
import { callApi } from "../../apiService.js";
import { showToast } from "../utils/notifications.js";
import { createElementFromHTML } from "../utils/domHelpers.js";
import { stopAutoSave } from "../utils/autoSave.js";
import { getFormId, getFormStatus } from "../main.js";

function setupSaveHandlers() {
    document.addEventListener('click', async function(event) {
        const btnSave = event.target.closest('.btn-save');
        if (!btnSave) return;

        const result = collectQuestionData();

        if (getFormStatus() === "0") {
            const data = await callApi(`/draft?id=${getFormId()}`, "PUT", result);
            if (data['status']) {
                showToast("Đã lưu !", "success");
            } else {
                showToast("Lưu thất bại!", "error");
            }
        } else {
            const data = await callApi(`/admin/form?id=${getFormId()}`, "PUT", result);
            if (data['status']) {
                showToast("Đã lưu!", "success");
                syncQuestion(data['data']);
            } else {
                showToast("Lưu thất bại!", "error");
            }
        }
    });
}

function setupSubmitHandler() {
    document.addEventListener('click', async function(event) {
        const btnSubmit = event.target.closest('.btn-submit');
        if (!btnSubmit) return;

        const result = collectQuestionData();
        const data = await callApi(`/admin/form`, "POST", result);

        if (data['status']) {
            showToast("Xuất bản thành công!", "success");

            // Update URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('status');
            window.history.replaceState({}, document.title, url);

            syncQuestion(data['data']);

            // Replace submit button with success message
            const text = `<span class="text-success fw-bold">Đã xuất bản</span>`;
            btnSubmit.replaceWith(createElementFromHTML(text));

            // Disable auto save
            stopAutoSave();
        } else {
            showToast("Xuất bản thất bại!", "error");
        }
    });
}

export { setupSaveHandlers, setupSubmitHandler };