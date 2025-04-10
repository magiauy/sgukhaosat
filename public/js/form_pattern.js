document.addEventListener('DOMContentLoaded', async function () {
    const path = window.location.pathname;
        if(path.match(/\/admin\/form\/(\d+)\/edit/)){
            const matches = path.match(/\/admin\/form\/(\d+)\/edit/);
            const formId = parseInt(matches[1], 10);
            const response = await fetch(`${config.apiUrl}/admin/form/${formId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.ok) {
                const data = await response.json();
                renderSurvey(data['data']);
            }
        }else if (path.match(/\/admin\/form\/create/)) {
                renderSurvey();
        }
});
function showSurveyPopup(surveyHtml) {
  // Create a new modal element dynamically without setting aria-hidden.
  const modalElement = document.createElement('div');
  modalElement.classList.add('modal', 'fade');
  modalElement.setAttribute('tabindex', '-1');

  // Define the modal's inner HTML with the survey content.
modalElement.innerHTML = `
  <div class="modal-dialog" style="max-width: 800px;">
    <div class="modal-content" style="background: lightskyblue">
      <div class="modal-header">
        <h5 class="modal-title">Survey Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" style="max-height:800px; overflow-y:auto;">
        ${surveyHtml}
      </div>
    </div>
  </div>
`;
  // Optionally, set inert on background elements to prevent focus.
  // document.querySelector('main').setAttribute('inert', '');

  document.body.appendChild(modalElement);
  // Initialize the Bootstrap modal.
  const modalInstance = new bootstrap.Modal(modalElement, {});
    function onModalHide(event) {
        if (!confirm(`Are you sure you want to close?`)) {
            event.preventDefault();
        }
    }

// Named function to handle the event when the modal is fully hidden
    function onModalHidden() {
        // Remove both event listeners
        modalElement.removeEventListener('hide.bs.modal', onModalHide);
        modalElement.removeEventListener('hidden.bs.modal', onModalHidden);
        // Dispose the modal instance
        modalInstance.dispose();
        // Remove the modal element from the DOM
        modalElement.remove();
    }

    modalElement.addEventListener('hide.bs.modal', onModalHide);
    modalElement.addEventListener('hidden.bs.modal', onModalHidden);


  // Show the modal.
  modalInstance.show();
}
// Updated showSurveyPopup function to load content into .form-content
function showSurvey(surveyHtml) {
  // Query the div with class "form-content"
  const formContentContainer = document.querySelector('.form-content');
  if (formContentContainer) {
    formContentContainer.innerHTML = `
        <div class="survey-body" style="max-width: 700px">
          ${surveyHtml}
      </div>
    `;
  }
}
function initForm(form) {
    console.log(form)
    document.getElementById('fname').value = form.FName;
    document.getElementById('note').value = form.Note;
    document.getElementById('limit').value = form.Limit;
    document.getElementById('typeid').value = form.TypeID;
    document.getElementById('majorid').value = form.MajorID;
    document.getElementById('periodid').value = form.PeriodID;
    const statusMapping = {
        0: { text: "Đang tạo khảo sát", class: "bg-warning text-dark" },
        1: { text: "Đã lưu", class: "bg-success text-white" },
        2: { text: "Đang khảo sát", class: "bg-info text-white" },
        3: { text: "Đã đóng khảo sát", class: "bg-danger text-white" }
    };

    const statusElement = document.querySelector(".status-content .status");

    if (statusElement && statusMapping.hasOwnProperty(form.Status)) {
        const statusInfo = statusMapping[form.Status];

        statusElement.textContent = statusInfo.text;

        // Reset class, giữ lại class 'status badge'
        statusElement.className = 'status badge px-3 py-2';

        // Thêm các class màu sắc
        statusElement.classList.add(...statusInfo.class.split(' '));
    }
}
function renderSurvey(data=null) {
    let surveyHtml = "";
    if (data && data.form && data.questions && data.questions.length > 0) {
        // Use current data to render the form and questions
        surveyHtml = `<div class="editor-container" style="min-width: 700px; margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
  <form id="editorForm">
    <!-- Tên FName -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="fname">Tên Khảo sát:</label>
      <input type="text" id="fname" name="fname" class="form-control" placeholder="Nhập tên khảo sát" value="${data.form.FName || ''}">
    </div>

    <!-- Two select elements in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="typeid">Loại hình khảo sát:</label>
        <select id="typeid" name="typeid" class="form-control">
          <option value="">Chọn loại</option>
          <option value="FT001" ${data.form.TypeID === 'FT001' ? 'selected' : ''}>Chuẩn đầu ra</option>
          <option value="FT002" ${data.form.TypeID === 'FT002' ? 'selected' : ''}>Chương trình đào tạo</option>
        </select>
      </div>
      <div style="flex: 1;">
        <label for="majorid">Khối Ngành:</label>
        <select id="majorid" name="majorid" class="form-control">
          <option value="">Chọn ngành</option>
          <option value="7480201" ${data.form.MajorID === '7480201' ? 'selected' : ''}>Công nghệ thông tin</option>
          <option value="7480201CLC" ${data.form.MajorID === '7480201CLC' ? 'selected' : ''}>Công nghệ thông tin (chương trình chất lượng cao)</option>
          <option value="ce" ${data.form.MajorID === 'ce' ? 'selected' : ''}>Kỹ thuật điện</option>
        </select>
      </div>
    </div>

    <!-- Select and spinner in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="periodid">Chu Kỳ:</label>
        <select id="periodid" name="periodid" class="form-control">
          <option value="">Chọn kỳ</option>
          <option value="1" ${data.form.PeriodID === '1' ? 'selected' : ''}>2000-2004</option>
          <option value="2" ${data.form.PeriodID === '2' ? 'selected' : ''}>2004-2008</option>
          <option value="3" ${data.form.PeriodID === '3' ? 'selected' : ''}>2008-2012</option>
          <option value="4" ${data.form.PeriodID === '4' ? 'selected' : ''}>2012-2016</option>
          <option value="5" ${data.form.PeriodID === '5' ? 'selected' : ''}>2016-2024</option>
          <option value="6" ${data.form.PeriodID === '6' ? 'selected' : ''}>2020-2024</option>
          <option value="7" ${data.form.PeriodID === '7' ? 'selected' : ''}>2024-2028</option>
        </select>
      </div>
      <div style="flex: 1;">
        <label for="limit">Giới hạn:</label>
        <input type="number" id="limit" name="limit" class="form-control" placeholder="Nhập giới hạn" min="0" value="${data.form.Limit || 0}">
      </div>
    </div>

    <!-- Textarea for Note -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="note">Ghi chú:</label>
      <textarea id="note" name="note" rows="4" class="form-control" placeholder="Nhập ghi chú">${data.form.Note || ''}</textarea>
    </div>

    <!-- File input -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="file">Tệp đính kèm:</label>
      <input type="file" id="file" name="file" class="form-control-file">
    </div>
  </form>
</div>`;
        surveyHtml += `<div id="questionsContainer">`;
        data.questions.forEach(question => {
            surveyHtml += renderQuestion(question);
        });
        surveyHtml += `</div>`;
    } else {
        // Create a default form with default content
        surveyHtml = `<div class="editor-container" style="min-width: 700px; margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
  <form id="editorForm">
    <!-- Tên FName default -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="fname">Tên Khảo sát:</label>
      <input type="text" id="fname" name="fname" class="form-control" placeholder="Nhập tên khảo sát" value="Default Survey Name">
    </div>

    <!-- Two select elements in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="typeid">Loại hình khảo sát:</label>
        <select id="typeid" name="typeid" class="form-control">
          <option value="">Chọn loại</option>
          <option value="FT001">Chuẩn đầu ra</option>
          <option value="FT002">Chương trình đào tạo</option>
        </select>
      </div>
      <div style="flex: 1;">
        <label for="majorid">Khối Ngành:</label>
        <select id="majorid" name="majorid" class="form-control">
          <option value="">Chọn ngành</option>
          <option value="7480201">Công nghệ thông tin</option>
          <option value="7480201CLC">Công nghệ thông tin (chương trình chất lượng cao)</option>
          <option value="ce">Kỹ thuật điện</option>
        </select>
      </div>
    </div>

    <!-- Select and spinner in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="periodid">Chu Kỳ:</label>
        <select id="periodid" name="periodid" class="form-control">
          <option value="">Chọn kỳ</option>
          <option value="1">2000-2004</option>
          <option value="2">2004-2008</option>
          <option value="3">2008-2012</option>
          <option value="4">2012-2016</option>
          <option value="5">2016-2024</option>
          <option value="6">2020-2024</option>
          <option value="7">2024-2028</option>
        </select>
      </div>
      <div style="flex: 1;">
        <label for="limit">Giới hạn:</label>
        <input type="number" id="limit" name="limit" class="form-control" placeholder="Nhập giới hạn" min="0" value="0">
      </div>
    </div>

    <!-- Textarea for Note -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="note">Ghi chú:</label>
      <textarea id="note" name="note" rows="4" class="form-control" placeholder="Nhập ghi chú"></textarea>
    </div>

    <!-- File input -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="file">Tệp đính kèm:</label>
      <input type="file" id="file" name="file" class="form-control-file">
    </div>
  </form>
</div>`;
        surveyHtml += `<div id="questionsContainer" style="max-width: 700px;">`;
        // Add a default question using a pre-defined function
        surveyHtml += addTitleDescription();
        surveyHtml += addQuestionItem()
        surveyHtml += `</div>`;
    }




    // showSurveyPopup(surveyHtml);
    showSurvey(surveyHtml);
    initQuestion();
    initForm(data.form);
    document.querySelectorAll('.editable-content,.editable-option-content,.editable-description-content').forEach(el => {
        el.addEventListener('input', function () {
            // If the element contains only a <br> or is empty
            if (this.innerHTML.trim() === '<br>' || this.innerHTML.trim() === '') {
                this.innerHTML = '';
            }
        });
    });
    const editableDivs = document.querySelectorAll(".editable-content,.editable-option-content");
    editableDivs.forEach(div => {
        div.addEventListener("paste", function (e) {
            e.preventDefault();

            const text = (e.clipboardData || window.clipboardData).getData("text/plain");
            const selection = window.getSelection();
            if (!selection.rangeCount) {
                console.warn("⚠️ No selection range found");
                return;
            }

            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
        });
    });

}
function attachSortable(container, itemSelector, handleClass,hoverClass) {
    const sortable = new Sortable(container, {
        handle: handleClass,
        animation: 150,
    });

    sortable.el.addEventListener("dragstart", event => {
        draggedElement = event.target;
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            if (div !== draggedElement) {
                div.classList.remove(hoverClass);
            }
        });
    });

    sortable.el.addEventListener("dragend", event => {
        event.stopPropagation();
        container.querySelectorAll(itemSelector).forEach(div => {
            div.classList.add(hoverClass);
        });
        isDragging = false;
    });

    const scrollThreshold = 50;
    const scrollSpeed = 10;

    if(itemSelector ==='.question-item') {
        sortable.el.addEventListener("dragover", event => {
            event.preventDefault();
            const parent = container.parentElement;
            const rect = parent.getBoundingClientRect();

            if (event.clientY - rect.top < scrollThreshold) {
                parent.scrollBy(0, -scrollSpeed);
            } else if (rect.bottom - event.clientY < scrollThreshold) {
                parent.scrollBy(0, scrollSpeed);
            }
        });
    }
}
function handleNewOptionClick(event, wrapperSelector, containerClosestSelector, itemQuerySelector, type="option") {
    const createWrapper = event.target.closest(wrapperSelector);
    if (!createWrapper) return;
    const questionContainer = event.target.closest('.question-item');
    const optionContainer = questionContainer.querySelector(containerClosestSelector);
    let qType = questionContainer.querySelector('.form-select').dataset.qtype;
    let icon ;

    switch (qType) {
        case "MULTIPLE_CHOICE":
            icon = MCIcon;
            break;
        case "CHECKBOX":
            icon = CheckBoxIcon;
            break;
        case "GRID_MULTIPLE_CHOICE":
            icon = MCIcon;
            break;
        case "GRID_CHECKBOX":
            icon = CheckBoxIcon;
            break;
        default:
        icon = "";
            break;
    }
    if (!optionContainer) {
        return;
    }
    let replaceHtml;
    const count = optionContainer.querySelectorAll(itemQuerySelector).length + 1;
    const content = "Câu trả lời " + count;
    switch (type){
        case "option":
            replaceHtml = buildOptionHtml(content, count, icon);
            break;
        case "grid-row":
            replaceHtml = buildGridHtml(content, count, "row-container-item", "grid-row-drag-handle","hover-grid-row-effect");
            break;
        case "grid-column":
            replaceHtml = buildGridHtml(content, count, "column-container-item", "grid-column-drag-handle","hover-grid-column-effect",icon);
            break;
    }
        optionContainer.insertAdjacentHTML("beforeend", replaceHtml);
}
function initQuestionSelects() {
    const selects = document.querySelectorAll('.question-item select.form-select');
    selects.forEach(select => {
        if (!select.dataset.initialized) {
            select.dataset.initialized = 'true';
            const currentQTypeID = select.getAttribute('data-qtype') || '';
            populateSelect(select, currentQTypeID);
            select.addEventListener('change', function () {
                const currentElement = this.closest('.question-item');
                swapPatternQuestion(currentElement, this.value);
            });
        }
    });
}

function initFormConfig() {
    const select = document.getElementById('typeid');
    if (!select.dataset.initialized) {
        select.dataset.initialized = 'true';
        const currentQTypeID = select.getAttribute('data-qtype') || '';
        if (!globalTypesForm) return;
        // Clear any existing options
        select.innerHTML = '';

        // Iterate over the global question types array and append options
        globalTypesForm['data'].forEach(qt => {
            const option = document.createElement('option');
            option.value = qt.FTypeID;
            option.textContent = qt.FTypeName;
            // Select the option if its value matches the current question's QTypeID
            if (qt.QTypeID === currentQTypeID) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
}

function initQuestion() {
    setTimeout(async () => {
        await loadQuestionTypes();
        await loadMajor();
        await loadPeriod();
        await loadTypesForm();


        initQuestionSelects();
        initFormConfig();
        moreActionMenu();
    }, 0);

    if (!isGlobalClickListenerAdded) {
        document.addEventListener("click", function (event) {
            if (event.target.matches(".new-editable-option-content")) {
                handleNewOptionClick(event, ".create-new-option-wrapper", ".option-container", ".option-item");
            } else if (event.target.matches(".new-editable-grid-row-content")) {
                handleNewOptionClick(event, ".create-new-grid-row-wrapper", ".row-container", ".row-container-item", "grid-row");
            } else if (event.target.matches(".new-editable-grid-column-content")) {
                handleNewOptionClick(event, ".create-new-grid-column-wrapper", ".column-container", ".column-container-item", "grid-column");
            }
        });
        isGlobalClickListenerAdded = true;
    }

// Select the main container
    const questionsContainer = document.getElementById('questionsContainer');
    if (questionsContainer) {
      // Initialize Sortable for question items directly inside the questionsContainer
      attachSortable(questionsContainer, '.question-item', '.drag-handle', 'hover-effect');

      // Now find nested containers within questionsContainer and attach Sortable to each one
      const rowContainers = questionsContainer.querySelectorAll('#row-container');
      rowContainers.forEach(container => {
        attachSortable(container, '.row-container-item', '.grid-row-drag-handle', 'hover-grid-row-effect');
      });

      const columnContainers = questionsContainer.querySelectorAll('#column-container');
      columnContainers.forEach(container => {
        attachSortable(container, '.column-container-item', '.grid-column-drag-handle', 'hover-grid-column-effect');
      });

      const optionContainers = questionsContainer.querySelectorAll('#option-container');
      optionContainers.forEach(container => {
        attachSortable(container, '.option-item', '.option-item-drag-handle', 'hover-option-item-effect');
      });
    }
    // Add the delete-handle listener which is attached globally only once.
    if (!window.isDeleteListenerAdded) {
        document.addEventListener('click', function(event) {
            const deleteHandle = event.target.closest('.delete-handle');
            if (!deleteHandle) return;
            const item = deleteHandle.closest('.option-item, .row-container-item, .column-container-item');
            if (item) {
                item.remove();
            }
        });
        document.addEventListener('click', function(event) {
            const deleteHandle = event.target.closest('.delete-question-handle');
            if (!deleteHandle) return;
            const item = deleteHandle.closest('.question-item');
            if (item) {
                item.remove();
            }
        });
        document.addEventListener('click', function(event) {
            const duplicate = event.target.closest('.duplicate-question-handle');
            if (!duplicate) return;
            const item = duplicate.closest('.question-item');
            const selectElement = item.querySelector('.form-select').dataset.qtype;
            if (item) {
                duplicateQuestionItem(item,selectElement)
            }
        });

        questionsContainer.addEventListener('click', function(event) {
            const btnAddTitleDescription = event.target.closest('.btn-add-title-description');
            if (!btnAddTitleDescription) return;
            const item = btnAddTitleDescription.closest('.question-item');

            if (item){
                item.insertAdjacentHTML('afterend', addTitleDescription());
                initQuestionSelects();
            }else{
                questionsContainer.insertAdjacentHTML('beforeend', addTitleDescription());
                initQuestionSelects();
            }
        })

        questionsContainer.addEventListener('click', function(event) {
            const btnAddQuestion = event.target.closest('.btn-add-question');
            if (!btnAddQuestion) return;
            const item = btnAddQuestion.closest('.question-item');

            if (item){
                item.insertAdjacentHTML('afterend', addQuestionItem());
                initQuestionSelects();
            }else{
                questionsContainer.insertAdjacentHTML('beforeend', addQuestionItem());
                initQuestionSelects();
            }
        })

        questionsContainer.addEventListener('click', function(event) {
            const btnAddAnotherOption = event.target.closest('.add-another-option');
            if (!btnAddAnotherOption) return;
            const item = btnAddAnotherOption.closest('.question-item');
            const optionContainer = item.querySelector('.create-new-container');
            const qType = item.querySelector('.form-select').dataset.qtype;
            const optionWrapper = optionContainer.querySelector('.create-new-option-wrapper');
            let icon;
            switch (qType) {
                case "MULTIPLE_CHOICE":
                    icon = MCIcon;
                    break;
                case "CHECKBOX":
                    icon = CheckBoxIcon;
                    break;
                default:
                    icon = "";
                    break;
            }
            if (item) {
                optionContainer.insertAdjacentHTML('afterbegin', buildAnotherOptionHtml("Khác", icon));
                optionWrapper.replaceWith(createElementFromHTML(buildOptionWrapper({
                    icon:icon,
                    orderContent: false
                })))
                initQuestionSelects();
            }
        })

        questionsContainer.addEventListener('click', function(event) {
            const deleteAnother = event.target.closest('.delete-another-handle');
            if (!deleteAnother) return;
            const item = deleteAnother.closest('.another-item');
            const questionItem = deleteAnother.closest('.question-item');
            const optionWrapper = questionItem.querySelector('.create-new-option-wrapper');
            const qType = questionItem.querySelector('.form-select').dataset.qtype;
            let icon;
            switch (qType) {
                case "MULTIPLE_CHOICE":
                    icon = MCIcon;
                    break;
                case "CHECKBOX":
                    icon = CheckBoxIcon;
                    break;
                default:
                    icon = "";
                    break;
            }
            if (item){
                item.remove();
            }
            optionWrapper.replaceWith(createElementFromHTML(buildOptionWrapper({
                icon:icon,
                orderContent: true
            })))
        })
        document.addEventListener('click', function(event) {
            const btnSubmit = event.target.closest('.btn-submit');
            if (!btnSubmit) return;
            const result = {
                form : {
                    FID : 4,
                    FName: document.getElementById('fname').value,
                    Note: document.getElementById('note').value,
                    Limit: document.getElementById('limit').value,
                    TypeID: document.getElementById('typeid').value,
                    MajorID: document.getElementById('majorid').value,
                    PeriodID: document.getElementById('periodid').value,
                    File: document.getElementById('file').value,
                    Status: 0
                },
                questions: convertHTMLQuestionToJsonData()
            }
            console.log(result);
            // fetch(`${config.apiUrl}/admin/form`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization: `Bearer ${sessionStorage.getItem('token')}`
            //     },
            //     body: JSON.stringify(result)
            // }).then(r =>{
            //     if (r.ok) {
            //         alert("Thành công");
            //     }else{
            //         alert("Thất bại");
            //     }
            // });
        })

        window.isDeleteListenerAdded = true;


    }
}
function createElementFromHTML(htmlString) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlString.trim();
    return temp.firstChild;
}
function duplicateQuestionItem(item, desiredValue) {
    // get duplicated HTML from the original element
    const newQuestionHtml = item.outerHTML;

    // create a temporary container to modify the duplicated HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = newQuestionHtml;

    // Find the select element in the duplicated HTML and update its value
    const selectElement = tempContainer.querySelector('select.form-select');
    if (selectElement) {
        selectElement.value = desiredValue;
        // Reset the initialization flag so it is re-initialized
        delete selectElement.dataset.initialized;
    }

    // Insert the modified HTML after the original question-item
    item.insertAdjacentHTML('afterend', tempContainer.innerHTML);

    // Reinitialize the select elements (new duplicated select will be initialized)
    initQuestionSelects();
    moreActionMenu();
}
function swapPatternQuestion(questionElement,type) {

    let question = {
        QID: questionElement.id.replace('q', ''),
        QTypeID: type,
        QContent: questionElement.querySelector('.editable-content').innerText,
        children: []
    };
    const currentSelect = questionElement.querySelector('.form-select').dataset.qtype;
    if (type === "MULTIPLE_CHOICE") {
        if (currentSelect === "CHECKBOX" || currentSelect === "DROPDOWN") {
        question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
            QTypeID: "MULTIPLE_CHOICE_OPTION",
            QContent: input.querySelector('.editable-option-content')?.innerText.trim()
        }));
        } else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "MULTIPLE_CHOICE_OPTION",
                    QContent: colContent
                };
            })
        }
    } else if (type === "CHECKBOX") {
        if (currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "CHECKBOX_OPTION",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        } else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "CHECKBOX_OPTION",
                    QContent: colContent
                };
            })
        }
    } else if (type === "GRID_MULTIPLE_CHOICE") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "GRID_MC_COLUMN",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_CHECKBOX") {
            question.children = [
                ...Array.from(questionElement.querySelectorAll('.row-container .row-container-item')).map(rowItem => {
                    const rowContent = rowItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_MC_ROW",
                        QContent: rowContent
                    };
                }),
                ...Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                    const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                    return {
                        QTypeID: "GRID_MC_COLUMN",
                        QContent: colContent
                    };
                })
            ];
        }
    } else if (type === "GRID_CHECKBOX") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE" || currentSelect === "DROPDOWN") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "GRID_CHECKBOX_COLUMN",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_MULTIPLE_CHOICE") {
        question.children = [
          ...Array.from(questionElement.querySelectorAll('.row-container .row-container-item')).map(rowItem => {
            const rowContent = rowItem.querySelector('.editable-option-content')?.innerText.trim();
            return {
              QTypeID: "GRID_CHECKBOX_ROW",
              QContent: rowContent
            };
          }),
          ...Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
            const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
            return {
              QTypeID: "GRID_CHECKBOX_COLUMN",
              QContent: colContent
            };
          })
        ];
        }
    } else if (type === "DROPDOWN") {
        if (currentSelect === "CHECKBOX" || currentSelect === "MULTIPLE_CHOICE") {
            question.children = Array.from(questionElement.querySelectorAll('.option-container .option-item')).map(input => ({
                QTypeID: "DROPDOWN_OPTION",
                QContent: input.querySelector('.editable-option-content')?.innerText.trim()
            }));
        }else if (currentSelect === "GRID_MULTIPLE_CHOICE" || currentSelect === "GRID_CHECKBOX") {
            question.children = Array.from(questionElement.querySelectorAll('.column-container .column-container-item')).map(colItem => {
                const colContent = colItem.querySelector('.editable-option-content')?.innerText.trim();
                return {
                    QTypeID: "DROPDOWN_OPTION",
                    QContent: colContent
                };
            })
        }

    }
    questionElement.outerHTML = renderQuestion(question);
    initQuestion();
}
function renderQuestion(question) {
    const descriptionItem = question.children.find(option => option.QTypeID === "DESCRIPTION") || null;
    let html = `<div class="question-item hover-effect flex flex-column align-items-start"">
    <div class="drag-handle me-2 text-center" style="cursor: move;">
        <img src="/public/icons/grip-dots.svg" alt="Grip Dots" style="width: 24px; height: 24px" />
    </div>
        <div class="question-content d-flex align-items-start gap-2 mb-1">
          ${question.QContent ? `
            <div class="editable-content" contenteditable="true" data-placeholder="${question.QTypeID==='SUBTITLE' ? 'Tiêu đề' :'Câu hỏi'}">
                 ${question.QContent}
            </div>`:
            `<div class="editable-content" contenteditable="true" data-placeholder="${question.QTypeID==='SUBTITLE' ? 'Tiêu đề' : 'Câu hỏi'}"></div>`}
          <select class="form-select" data-qtype="${question.QTypeID}">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>


        ${descriptionItem ? `<div class="question-description">
               ${descriptionItem.QContent ? `
        <div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả">
            ${descriptionItem.QContent}
        </div>` :
        `<div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả"></div>`}
        </div> ` : ""}


    <div class="question-answer">`;
    if (question.QTypeID === "MULTIPLE_CHOICE") {
        html += patternQuestionMultipleChoice(question);
    } else if (question.QTypeID === "SHORT_TEXT") {
    } else if (question.QTypeID === "LONG_TEXT") {
    } else if (question.QTypeID === "CHECKBOX") {
        html += patternQuestionCheckBox(question);
    } else if (question.QTypeID === "GRID_MULTIPLE_CHOICE") {
        html += patternQuestionGridMultipleChoice(question);
    } else if (question.QTypeID === "GRID_CHECKBOX") {
        html += patternQuestionGridCheckBox(question);
    } else if (question.QTypeID === "DROPDOWN") {
        html += patternQuestionDropdown(question);
    }
    //Action button
    html += `<div class="d-flex justify-content-end mt-2 actions_container px-2 pt-2 gap-2">
            <img src="/public/icons/trashcan.svg" alt="Delete" class="delete-question-handle" style="cursor: pointer; width: 34px; height: 34px;">
            <img src="/public/icons/copy.svg" alt="Duplicate" class="duplicate-question-handle" style="cursor: pointer; width: 34px; height: 34px;">

            ${question.QTypeID === "SUBTITLE" ? "" : `            
            <label class="switch">
              <input type="checkbox">
              <span class="slider round"></span>
            </label>
            <span>Bắt buộc</span>`}
            <div class="more-action justify-content-center align-items-center">
                <img src="/public/icons/three-dots-vertical.svg"  style="cursor: pointer; width: 28px; height: 28px;" alt="About action">
            </div>


    </div>`;
    html += `</div>
          <div class="hover-zone"></div>
              <div class="button-group">
                    <button class="btn-add-title-description">Thêm tiêu đề và mô tả</button>
                    <button class="btn-add-question">Thêm câu hỏi</button>
              </div>
            </div>`;
    return html;

}
function addQuestionItem() {
    const question = {
        QContent: "",
        QTypeID: "MULTIPLE_CHOICE",
        children: [
            {
                QTypeID: "MULTIPLE_CHOICE_OPTION",
                QContent: "Câu trả lời 1"

            }
        ]
    };
    return renderQuestion(question);
}
function addTitleDescription() {
    const question = {
        QTypeID: "SUBTITLE",
        children: [
            {
                QTypeID: "DESCRIPTION",
                QContent: ""
            }
        ]
    }
    return renderQuestion(question);
}
function moreActionMenu() {
    document.querySelectorAll('.more-action').forEach(item => {
        item.addEventListener('click', (e) => {
            // If menu box already exists, remove it and exit.
            const existingMenuBox = document.getElementById('moreActionMenu');
            if (existingMenuBox) {
                existingMenuBox.remove();
                return;
            }

            e.stopPropagation();
            // Add click animation class.
            item.classList.add('clicked');
            setTimeout(() => item.classList.remove('clicked'), 400);

            // Create the menu box element.
            const menuBox = document.createElement('div');
            menuBox.id = 'moreActionMenu';
            menuBox.classList.add('menu-box');

            const questionItem = item.closest('.question-item');

            // Check if any question-item contains a question-description.
            const hasDescription = !!questionItem.querySelector('.question-description');

            // Set the content for the menu item including the checkmark if condition is met.
            let menuItemContent;
            if (hasDescription) {
                menuItemContent = `
                <div class="menu-item">
                    <span class="checkmark"><i class="fas fa-check"></i></span>
                    <span class="menu-label">Mô tả</span>
                </div>`;
                    } else {
                        menuItemContent = `
                <div class="menu-item">
                    <span class="checkmark"></span>
                    <span class="menu-label">Mô tả</span>
                </div>`;
                    }
            menuBox.innerHTML = menuItemContent;
            // Position the menu box relative to the clicked element.
            const rect = item.getBoundingClientRect();
            menuBox.style.top = (rect.bottom + window.scrollY) + 'px';
            menuBox.style.left = (rect.left + window.scrollX) + 'px';

            document.body.appendChild(menuBox);
            setTimeout(() => menuBox.classList.add('show'), 0);
            const menuItem = menuBox.querySelector('.menu-item');
            if (menuItem) {
                menuItem.addEventListener('click', function(ev) {
                    ev.stopPropagation();
                    const questionContent = questionItem.querySelector('.question-content');
                    if (!hasDescription){
                        const questionDescription = document.createElement('div');
                        questionDescription.classList.add('question-description');
                        questionDescription.innerHTML = `
                            <div class="editable-description-content" contentEditable="true" data-placeholder="Mô tả"></div>
                        `;
                        if (questionContent){
                            questionContent.insertAdjacentElement('afterend', questionDescription);
                        }
                    }else {
                        const questionDescription = questionItem.querySelector('.question-description');
                        if (questionDescription) {
                            questionDescription.remove();
                        }
                    }
                    menuBox.classList.remove('show');
                    setTimeout(() => menuBox.remove(), 300);
                });
            }
            // Close the menu box when clicking outside of it.
            document.addEventListener('click', function onDocClick(ev) {
                if (!menuBox.contains(ev.target) && ev.target !== item) {
                    menuBox.classList.remove('show');
                    setTimeout(() => menuBox.remove(), 300);
                    document.removeEventListener('click', onDocClick);
                }
            });
        });
    });
}
function patternQuestionCheckBox(question) {
    const count = question.children.filter(option => option.QTypeID === "CHECKBOX_OPTION").length;
    const isHaveAnotherOption = question.children.some(option => option.QTypeID === "ORDER_OPTION");
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count,CheckBoxIcon);
        html += `</div>`;
        html += `<div class="create-new-container">`
        html += buildOptionWrapper({icon: CheckBoxIcon});
        html += `</div>`
        return html;
    }
        question.children.forEach(option => {
            html += buildOptionHtml(option.QContent ,count ,CheckBoxIcon);
        });
        html += `</div>`;
        html += `<div class="create-new-container">`
    // html += buildAnotherOptionHtml("Thêm câu trả lời khác", CheckBoxIcon);
        html += isHaveAnotherOption ? buildAnotherOptionHtml("Khác",CheckBoxIcon) : ""
        html += buildOptionWrapper({
            icon: CheckBoxIcon,
            orderContent: !isHaveAnotherOption
        })
        html+=`</div>`;
        return html;
    }
function patternQuestionMultipleChoice(question){
    const count = question.children.filter(option => option.QTypeID === "MULTIPLE_CHOICE_OPTION").length;
    const isHaveAnotherOption = question.children.some(option => option.QTypeID === "ORDER_OPTION");
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count,MCIcon);
        html += `</div>`;
        html += `<div class="create-new-container">`
        html += buildOptionWrapper({icon: MCIcon});
        html += `</div>`
        return html;
    }
    question.children.map(option => {
        html += buildOptionHtml(option.QContent, count,MCIcon);
    });
    html += `</div>`;
    html += `<div class="create-new-container">`
    html += isHaveAnotherOption ? buildAnotherOptionHtml("Khác",MCIcon) : ""
    html += buildOptionWrapper({
        icon: MCIcon,
        orderContent: !isHaveAnotherOption
    })
    html+=`</div>`;
    return html;
}
function patternQuestionDropdown(question) {
    const count = question.children.filter(option => option.QTypeID === "DROPDOWN_OPTION").length;
    let html = `<div class="option-container" id="option-container">`;
    if (!question.children || !Array.isArray(question.children) || question.children.length === 0) {
        html += buildOptionHtml("Câu trả lời 1", count);
        html += `</div>`;
        html += `<div>`
        html += buildOptionWrapper();
        html += `</div>`
        return html;
    }
    question.children.forEach(option => {
        html += buildOptionHtml(option.QContent, count)
    });
    html += `</div>`;
    html += `<div>`
    html += buildOptionWrapper()
    html+=`</div>`;
    return html;
}
function patternQuestionGridMultipleChoice(question) {
    let html = `<div class="grid-container d-flex flex-row" style="margin: 5px 0 0 0; padding: 0;">
`;
    html += `    
    <div class="grid-content flex-grow-1">
        <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Hàng</div>
    <div class="row-container" id="row-container">
`;
    const countRows = question.children.filter(option => option.QTypeID === "GRID_MC_ROW").length;
    const countColumns = question.children.filter(option => option.QTypeID === "GRID_MC_COLUMN").length;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_ROW") {
            html += buildGridHtml(option.QContent, countRows, "row-container-item", "grid-row-drag-handle","hover-grid-row-effect");
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-row-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-row-content",
        orderContent: false,
        text: "Thêm hàng"
    })
    html +=`</div>`;
    html += `<div class="grid-content flex-grow-1">
    <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Cột</div>
    <div class="column-container" id="column-container"> 
`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_COLUMN") {
            html += buildGridHtml(option.QContent, countColumns, "column-container-item", "grid-column-drag-handle","hover-grid-column-effect",MCIcon);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-column-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-column-content",
        icon: MCIcon,
        orderContent: false,
        text: "Thêm cột"
    })
    html += `</div></div>`;
    return html;
}
function patternQuestionGridCheckBox(question) {
    let html = `<div class="grid-container d-flex flex-row" style="margin: 5px 0 0 0; padding: 0;">
`;
    html += `    
    <div class="grid-content flex-grow-1" >
        <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Hàng</div>
    <div class="row-container" style="width: 50%;" id="row-container">
`;
    const countRows = question.children.filter(option => option.QTypeID === "GRID_CHECKBOX_ROW").length;
    const countColumns = question.children.filter(option => option.QTypeID === "GRID_CHECKBOX_COLUMN").length;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_ROW") {
            html += buildGridHtml(option.QContent, countRows, "row-container-item", "grid-row-drag-handle","hover-grid-row-effect");
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-row-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-row-content",
        orderContent: false,
        text: "Thêm hàng"
    })
    html += `</div>`;
    html += `<div class="grid-content flex-grow-1">
    <div style="font-weight: bold; font-size: 18px;padding-left: 10px">Cột</div>
    <div class="column-container" style="width: 50%;" id="column-container">
`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_COLUMN") {
            html += buildGridHtml(option.QContent, countColumns, "column-container-item", "grid-column-drag-handle","hover-grid-column-effect",CheckBoxIcon);
        }
    });

    html += `</div>`;
    html += buildOptionWrapper({
        wrapperClass: "create-new-grid-column-wrapper flex-xxl-grow-1 flex flex-row",
        editableClass: "new-editable-grid-column-content",
        icon: CheckBoxIcon,
        orderContent: false,
        text: "Thêm cột"
    })
    html += `</div></div>`;


    return html;
}
function buildOptionHtml(content, count ,icon=""){
    return ` <div class="option-item d-flex flex-row align-items-center hover-option-item-effect" style="margin: 5px 0 0 0; padding: 0;">
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
            </div>
            `;
}
function buildGridHtml(content, count, contentClassed, dragHandleClassed,effectClassed ,icon=""){
return ` <div class="${contentClassed} d-flex flex-row align-items-center ${effectClassed}" style="margin: 5px 0 0 0; padding: 0;">
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
buildAnotherOptionHtml = function (content, icon="") {
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
// Function to load question types from the API once
async function loadQuestionTypes() {
    // Only fetch if it hasn't been fetched already
    if (!globalQuestionTypes) {
        try {
            const response = await fetch('/api/question_type', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load question types');
            }
            globalQuestionTypes = await response.json();
        } catch (error) {
            console.error(error);
        }
    }
}

async function loadTypesForm() {
    // Only fetch if it hasn't been fetched already
    if (!globalTypesForm) {
        try {
            const response = await fetch('/api/form_type', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load question types');
            }
            globalTypesForm = await response.json();
        } catch (error) {
            console.error(error);
        }
    }
}

// Function to load major from the API once
async function loadMajor() {
    // Only fetch if it hasn't been fetched already
    if (!globalMajor) {
        try {
            const response = await fetch('/api/major', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load major');
            }
            globalMajor = await response.json();
        } catch (error) {
            console.error(error);
        }
    }
}

// Function to load period from the API once
async function loadPeriod() {
    // Only fetch if it hasn't been fetched already
    if (!globalPeriod) {
        try {
            const response = await fetch('/api/period', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load period');
            }
            globalPeriod = await response.json();
        } catch (error) {
            console.error(error);
        }
    }
}


// Function to populate a given select element using the global question types
function populateSelect(selectElement, currentQTypeID) {
    if (!globalQuestionTypes) return;
    // Clear any existing options
    selectElement.innerHTML = '';

    // Iterate over the global question types array and append options
    globalQuestionTypes['data'].forEach(qt => {
        const option = document.createElement('option');
        option.value = qt.QTypeID;
        option.textContent = qt.TypeName;
        // Select the option if its value matches the current question's QTypeID
        if (qt.QTypeID === currentQTypeID) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}
function convertHTMLQuestionToJsonData(){
  const questionContainer = document.getElementById('questionsContainer');
  const questions = [];
  // Loop through each question-item with an index.
  questionContainer.querySelectorAll('.question-item').forEach((questionItem, qIdx) => {
    const questionIndex = qIdx + 1;
    const type = questionItem.querySelector('.form-select').value;
    const question = {
      QContent: questionItem.querySelector('.editable-content').innerText,
      QTypeID: type,
      QIndex: questionIndex,
      children: []
    };

    let childIndex = 1;
    // Process description if available.
    const descriptionItem = questionItem.querySelector('.question-description');
    if (descriptionItem) {
      question.children.push({
        QTypeID: "DESCRIPTION",
        QContent: descriptionItem.querySelector('.editable-description-content').innerText,
        QIndex: questionIndex + '.' + childIndex
      });
      childIndex++;
    }

    // Process option items.
    const optionContainer = questionItem.querySelector('.option-container');
    if (optionContainer) {
      optionContainer.querySelectorAll('.option-item').forEach(optionItem => {
        question.children.push({
          QTypeID: type + "_OPTION",
          QContent: optionItem.querySelector('.editable-option-content').innerText,
          QIndex: questionIndex + '.' + childIndex
        });
        childIndex++;
      });
    }

    // Process grid container rows and columns.
// Process grid container rows and columns.
        const gridContainer = questionItem.querySelector('.grid-container');
        if (gridContainer) {
          const rowContainer = gridContainer.querySelector('.row-container');
          let rowBase = "";
          if (rowContainer) {
            let rowCounter = 1;
            rowContainer.querySelectorAll('.row-container-item').forEach(rowItem => {
              const currentRowIndex = questionIndex + '.' + rowCounter;
              question.children.push({
                QTypeID: type === "GRID_MULTIPLE_CHOICE" ? "GRID_MC_ROW" : "GRID_CHECKBOX_ROW",
                QContent: rowItem.querySelector('.editable-option-content').innerText,
                QIndex: currentRowIndex
              });
              // Store the first row index to be used as the base for column indexes.
              if (rowCounter === 1) {
                rowBase = currentRowIndex;
              }
              rowCounter++;
            });
          }
          // If no row exists, use questionIndex with an extra .1 as base.
          const colBase = rowBase || (questionIndex + '.1');
          const columnContainer = gridContainer.querySelector('.column-container');
          if (columnContainer) {
            let colCounter = 1;
            columnContainer.querySelectorAll('.column-container-item').forEach(colItem => {
              question.children.push({
                QTypeID: type === "GRID_MULTIPLE_CHOICE" ? "GRID_MC_COLUMN" : "GRID_CHECKBOX_COLUMN",
                QContent: colItem.querySelector('.editable-option-content').innerText,
                QIndex: colBase + '.' + colCounter
              });
              colCounter++;
            });
          }
        }

    // Process another items.
    const anotherItems = questionItem.querySelectorAll('.another-item');
    if (anotherItems) {
      anotherItems.forEach(item => {
        question.children.push({
          QTypeID: "ANOTHER_OPTION",
          QContent: item.querySelector('.another-content').innerText,
          QIndex: questionIndex + '.' + childIndex
        });
        childIndex++;
      });
    }

    questions.push(question);
  });
  console.log(questions);
  return questions;
}
let MCIcon = `<div class="new-option-icon">
                <div class="custom-container">
                  <div class="custom-icon" style="
                      width: 24px;
                      height: 24px;
                      -webkit-border-radius: 50%;
                      border-radius: 50%;
                      border: 2px solid rgba(0, 0, 0, .26);
                  " aria-disabled="false"></div>
                </div>
              </div>
    `;
let CheckBoxIcon = `<div class="new-option-icon">
                <div class="custom-container">
                  <div class="custom-icon" style="
                      width: 24px;
                      height: 24px;
                      -webkit-border-radius: 3px;
                      border-radius: 3px;
                      border: 2px solid rgba(0, 0, 0, .26);
                  " aria-disabled="false"></div>
                </div>
              </div>
    `;
let isDragging = false;
let draggedElement = null;
let globalStatus = 0;
let globalQuestionTypes = null;
let globalTypesForm = null;
let globalMajor = null;
let globalPeriod = null;
let isGlobalClickListenerAdded = false;


