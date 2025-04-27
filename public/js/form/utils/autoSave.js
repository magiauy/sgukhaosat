import {callApi} from "../../apiService.js";
import {showToast} from "./notifications.js";
import {autoSaveInterval, formId} from "../main.js";
import {collectQuestionData} from "../survey/dataCollector.js";
function stopAutoSave() {
    console.log("Auto save stopped");
    if (autoSaveInterval !== null) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}
function startAutoSave() {
    console.log("Auto save started");
    autoSaveInterval = setInterval(() => {
        const result = collectQuestionData();
        callApi(`/draft?id=${formId}`, "PUT", result).then(r => {
            if (r['status']) {
                showToast("Đã tự động lưu!", "success");
            } else {
                showToast("Tự động lưu thất bại!", "error");
            }
        });
    }, 30000); // auto-save every 30s
}

export {stopAutoSave,startAutoSave}