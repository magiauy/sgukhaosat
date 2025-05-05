// main.js - Entry point for survey builder application
import { setupEventHandlers } from "./handlers/eventHandlers.js";
import { initQuestion } from "./question/questionInitializer.js";
import { renderSurvey } from "./survey/surveyRenderer.js";
import { callApi } from "../apiService.js";
import { startAutoSave, stopAutoSave } from "./utils/autoSave.js";
import { showToast } from "./utils/notifications.js";
import { MCIcon, CheckBoxIcon } from "./constants/icons.js";

// Global state
let formId = null;
let formStatus = null;
let autoSaveInterval = null;
let draggedElement = null;
let isDragging = false;

// Initialize application
async function initApp() {
  // Extract form ID from URL if editing existing form
  const path = window.location.pathname;
  const matches = path.match(/\/admin\/form\/(\d+)\/edit/);

  if (matches) {
    formId = parseInt(matches[1], 10);
    try {
      // Load existing form data
      const data = await callApi(`/admin/form/${formId}`);
      if (data.status) {
        renderSurvey(data.data);
        formStatus = data.data.form.Status;

        // Enable auto-save for drafts
        if (formStatus === "0") {
          setTimeout(() => {
            showToast("Đã bật chế độ tự động lưu!", "success");
            startAutoSave();
          }, 1000);
        }
      } else {
        showToast("Không thể tải biểu mẫu", "error");
      }
    } catch (error) {
      console.error("Error loading form:", error);
      showToast("Lỗi khi tải biểu mẫu", "error");
    }
  } else {
    // Create new form
    renderSurvey();
    formStatus = "0"; // Draft status
    setTimeout(() => {
      showToast("Đã bật chế độ tự động lưu!", "success");
      startAutoSave();
    }, 1000);
  }

  // Set up all event handlers
  setupEventHandlers();
}

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export necessary variables for other modules
export { formId, formStatus , draggedElement,isDragging , autoSaveInterval};