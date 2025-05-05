function buildOptionHtml(content, count, icon="", questionId="") {
    return ` <div class="option-item d-flex flex-row align-items-center hover-option-item-effect" style="margin: 5px 0 0 0; padding: 0;" id="q${questionId}">
              <!-- Grid dot icon for dragging -->
                <div class="grid-dot option-item-drag-handle" style="cursor: move;">
                <img src="/public/icons/grip-dots-vertical.svg" alt="Grid Dot" style="width: 28px; height: 28px; opacity: 26%;">
              </div>
              <!-- Checkbox icon -->
              ${icon}
              <!-- Editable content -->
              <div class="editable-wrapper flex-xxl-grow-1">
                <div class="editable-option-content " contenteditable="true">
                  ${content || ""}
                </div>
              </div>
              <!-- Delete icon -->
              <div class="delete-handle" style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#5f6368" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                       <path d="M0 0h24v24H0z" fill="none"></path>
                    </svg>
              </div>
            </div>`;
}

function buildGridHtml(content, count, contentClassed, dragHandleClassed,effectClassed ,icon="",questionId=""){
    return ` <div class="${contentClassed} d-flex flex-row align-items-center ${effectClassed}" style="margin: 5px 0 0 0; padding: 0;" id="q${questionId}">
          <!-- Grid dot icon for dragging -->
          <div class="grid-dot ${dragHandleClassed}" style="cursor: move;">
            <img src="/public/icons/grip-dots-vertical.svg" alt="Grid Dot" style="width: 28px; height: 28px; opacity: 26%;">
          </div>
          <!-- Checkbox icon -->
          ${icon}
          <!-- Editable content -->
          <div class="editable-wrapper flex-xxl-grow-1">
            <div class="editable-option-content " contenteditable="true">
              ${content || ""}
            </div>
          </div>
          <!-- Delete icon -->
          <div class="delete-handle" style="cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#5f6368" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                   <path d="M0 0h24v24H0z" fill="none"></path>
                </svg>
          </div>
        </div>
        `;
}
function buildOptionWrapper({
        wrapperClass = "create-new-option-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass = "new-editable-option-content",
        icon = "",
        orderContent = true,
        text = "Thêm tuỳ chọn"
    } = {}) {
    return `
    <div class="${wrapperClass}" >
      <div class="d-flex align-items-center">
      ${icon}
        <div class="${editableClass} " id="${editableClass}"  contenteditable="false">
            ${text}
        </div>
        ${orderContent ? `<div class="m-lg-2"> hoặc </div>
                            <div class="add-another-option" style="font-weight: bold;color: #257ae9;cursor: pointer"> thêm"Câu trả lời khác"</div>` : ""}
      </div>
    </div>
  `;
}
function buildAnotherOptionHtml (content, icon="") {
    return ` <div class="another-item d-flex flex-row align-items-center hover-option-item-effect" style="margin: 5px 0 0 0; padding: 0;">
              <!-- Grid dot icon for dragging -->
                <div class="another-item-spacing">
              </div>
              <!-- Checkbox icon -->
              ${icon}
              <!-- Editable content -->
              <div class=" flex-xxl-grow-1">
                <div class="another-content">
                  ${content || ""}
                </div>
              </div>
              <!-- Delete icon -->
              <div class="delete-another-handle" style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#5f6368" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                       <path d="M0 0h24v24H0z" fill="none"></path>
                    </svg>
              </div>
            </div>
            `;
}

export { buildOptionHtml, buildGridHtml, buildOptionWrapper, buildAnotherOptionHtml };