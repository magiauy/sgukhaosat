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
let form = null;
let autoSaveInterval = null;
let draggedElement = null;
let isDragging = false;

// Initialize application
async function initApp() {
  try {
    // Show loader when app initializes
    Loader.show({
      title: "Đang tải biểu mẫu...",
      stages: [
        { progress: 20, text: "Đang khởi tạo..." },
        { progress: 40, text: "Đang tải dữ liệu biểu mẫu..." },
        { progress: 70, text: "Đang xử lý..." },
        { progress: 90, text: "Đang hiển thị biểu mẫu..." },
        { progress: 100, text: "Hoàn tất!" }
      ]
    });

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
          console.log(data.data);
          formStatus = data.data.form.Status;
            form = data.data.form;

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
  } catch (error) {
    console.error("Error initializing app:", error);
    showToast("Lỗi khởi tạo ứng dụng", "error");
  } finally {
    // Hide loader when everything is done
    setTimeout(() => Loader.hide(), 600);
    console.log("Form ID:", formId , "Form Status:", formStatus);
  }
}

function getFormId() {
  return formId;
}

function setFormId(id) {
  formId = id;
}

function getFormStatus() {
  return formStatus;
}

function setFormStatus(status) {
  formStatus = status;
}

function getAutoSaveInterval() {
  return autoSaveInterval;
}

function setAutoSaveInterval(interval) {
  autoSaveInterval = interval;
}

function getDraggedElement() {
  return draggedElement;
}

function setDraggedElement(element) {
  draggedElement = element;
}

function getIsDragging() {
  return isDragging;
}

function setIsDragging(dragging) {
  isDragging = dragging;
}
// Initialize question types and other data
function getForm() {
  return form;
}
function setForm(data) {
    form = data;
}
// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);


// Export necessary variables for other modules
export {
  getFormId, setFormId,
  getFormStatus, setFormStatus,
  getAutoSaveInterval, setAutoSaveInterval,
  getDraggedElement, setDraggedElement,
  getIsDragging, setIsDragging,
    getForm, setForm
};