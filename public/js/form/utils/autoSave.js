import { callApi } from "../../apiService.js";
import { showToast } from "./notifications.js";
import { getFormId, setAutoSaveInterval, getAutoSaveInterval } from "../main.js";
import { collectQuestionData } from "../survey/dataCollector.js";

function stopAutoSave() {
  const interval = getAutoSaveInterval();
  if (interval !== null) {
      console.log("Auto save stopped");

      clearInterval(interval);
    setAutoSaveInterval(null);
  }
}

function startAutoSave() {
  console.log("Auto save started");
  // Clear any existing interval first
  stopAutoSave();

  const interval = setInterval(() => {
    const formId = getFormId();
    const result = collectQuestionData();

    if (formId) {
      callApi(`/draft?id=${formId}`, "PUT", result).then(r => {
        if (r['status']) {
          showToast("Đã tự động lưu!", "success");
        } else {
          showToast("Tự động lưu thất bại!", "error");
        }
      });
    } else {
      console.error("Form ID not available for auto-save");
    }
  }, 30000); // auto-save every 30s

  setAutoSaveInterval(interval);
}

export { stopAutoSave, startAutoSave };