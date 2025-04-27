import { setupDeleteHandlers } from "./deleteHandlers.js";
import { setupOptionHandlers, setupOptionContentHandlers } from "./optionHandlers.js";
import { setupQuestionHandlers } from "./questionHandlers.js";
import { setupSaveHandlers, setupSubmitHandler } from "./saveHandlers.js";

let isGlobalClickListenerAdded = false;

function setupEventHandlers() {
    if (isGlobalClickListenerAdded) return;

    setupOptionContentHandlers();

    if (!window.isDeleteListenerAdded) {
        setupDeleteHandlers();
        setupQuestionHandlers();
        setupOptionHandlers();
        setupSaveHandlers();
        setupSubmitHandler();

        window.isDeleteListenerAdded = true;
    }

    isGlobalClickListenerAdded = true;
}

export { setupEventHandlers };