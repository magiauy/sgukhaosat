import { setupDeleteHandlers } from "./deleteHandlers.js";
import { setupOptionHandlers, setupOptionContentHandlers } from "./optionHandlers.js";
import { setupQuestionHandlers } from "./questionHandlers.js";
import { setupSaveHandlers, setupSubmitHandler } from "./saveHandlers.js";
import { setupPreviewHandler } from './previewHandler.js';
import {moreActionHandle} from "./moreActionHandle.js";

let isGlobalClickListenerAdded = false;

export function setupEventHandlers() {
    if (isGlobalClickListenerAdded) return;

    setupOptionContentHandlers();

    if (!window.isDeleteListenerAdded) {
        setupDeleteHandlers();
        setupQuestionHandlers();
        setupOptionHandlers();
        setupSaveHandlers();
        setupSubmitHandler();
        moreActionHandle();

        window.isDeleteListenerAdded = true;
    }
    
    setupPreviewHandler();

    isGlobalClickListenerAdded = true;
}