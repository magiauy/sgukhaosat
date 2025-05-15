import { initQuestion } from "../question/questionInitializer.js";
import { addTitleDescription, addQuestionItem, renderQuestion } from "../question/questionRenderer.js";
import { clearBrTag} from "../utils/contentHelpers.js";
import {setupPasteHandlers} from "../utils/editableContent.js";
import {callApi} from "../../apiService.js";

function showSurvey(surveyHtml) {
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
    document.getElementById('fname').value = form.FName;
    document.getElementById('note').value = form.Note;
    document.getElementById('limit').value = form.Limit;
    document.getElementById('typeid').value = form.TypeID;
    document.getElementById('majorid').value = form.MajorID;
    document.getElementById('periodid').value = form.PeriodID;
}

function renderSurvey(data=null) {
    let question = data?.questions || [];
    let surveyHtml = "";

    if (data && data.form && data.questions && data.questions.length > 0) {
        // Render form with data
        surveyHtml = buildFormHtml(data.form);
        surveyHtml += `<div id="questionsContainer">`;
        question.forEach(question => {
            surveyHtml += renderQuestion(question);
        });
        surveyHtml += `</div>`;
    } else {
        // Default form
        surveyHtml = buildDefaultFormHtml();
        surveyHtml += `<div id="questionsContainer" style="max-width: 700px;">`;
        surveyHtml += addTitleDescription();
        surveyHtml += addQuestionItem();
        surveyHtml += `</div>`;
    }

    showSurvey(surveyHtml);
    initQuestion();
    initForm(data?.form || {});

    clearBrTag();
    setupPasteHandlers();
}



function buildFormHtml(form) {
    return `<div class="editor-container" style="min-width: 700px; margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
  <form id="editorForm">
    <!-- Tên FName -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="fname">Tên Khảo sát:</label>
      <input type="text" id="fname" name="fname" class="form-control" placeholder="Nhập tên khảo sát" value="${form.FName || ''}">
    </div>

    <!-- Two select elements in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="typeid">Loại hình khảo sát:</label>
        <select id="typeid" name="typeid" class="form-control">
        </select>
      </div>
      <div style="flex: 1;">
        <label for="majorid">Khối Ngành:</label>
        <select id="majorid" name="majorid" class="form-control">
        </select>
      </div>
    </div>

    <!-- Select and spinner in one row -->
    <div class="form-group" style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div style="flex: 1;">
        <label for="periodid">Chu Kỳ:</label>
        <select id="periodid" name="periodid" class="form-control">
        </select>
      </div>
      <div style="flex: 1;">
        <label for="limit">Giới hạn:</label>
        <input type="number" id="limit" name="limit" class="form-control" placeholder="Nhập giới hạn" min="0" value="${form.Limit || 0}">
      </div>
    </div>

    <!-- Textarea for Note -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="note">Ghi chú:</label>
      <textarea id="note" name="note" rows="4" class="form-control" placeholder="Nhập ghi chú">${form.Note || ''}</textarea>
    </div>

    <!-- File input -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="file">Tệp đính kèm:</label>
      <input type="file" id="file" name="file" class="form-control-file">
    </div>
  </form>
</div>`;
}

function buildDefaultFormHtml() {
    return `<div class="editor-container" style="min-width: 700px; margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
  <form id="editorForm">
    <!-- Default fields -->
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="fname">Tên Khảo sát:</label>
      <input type="text" id="fname" name="fname" class="form-control" placeholder="Nhập tên khảo sát" value="Default Survey Name">
    </div>
    <!-- Other default fields omitted for brevity -->
    <!-- ... -->
  </form>
</div>`;
}


export { showSurvey, initForm, renderSurvey };