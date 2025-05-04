async function fetchFormData(formId) {
    const response = await fetch(`/api/form?id=${formId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

document.addEventListener('DOMContentLoaded', async function() {
  const path = window.location.pathname;
  if (path.match(/\/form\/(\d+)/)) {
    const matches = path.match(/\/form\/(\d+)/);
    const formId = parseInt(matches[1], 10);
    // Perform any actions with formId here
    console.log('Form ID:', formId);
    const formData = await fetchFormData(formId);
      renderSurvey(formData['data']);
  }
});

// Explanation:
// 1. Removes all drag handles, edit controls, and contenteditable features.
// 2. Builds a basic read-only display for survey form data.
// 3. Replaces interactive form fields with plain text or read-only inputs.


async function fetchSurveyData() {
    const response = await fetch(`${config.apiUrl}/admin/form/3`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`,

        },
    });

    const data = await response.json();
    console.log(data['data'])
    renderSurvey(data['data'])
}

function renderSurvey(data) {
    let surveyHtml = `
        <div class="survey-body container py-4 px-3" style="max-width: 720px">
            <div class="text-center mb-4">
                <h2 class="fw-bold text-primary">${data.form.FName}</h2>
                <hr>
            </div>
            <div id="questionsContainer" class="d-flex flex-column gap-4">
    `;

    data.questions.forEach(question => {
        surveyHtml += renderQuestion(question);
    });

    surveyHtml += `
            </div>
            <div class="text-center mt-5">
                <button class="btn btn-success px-5 py-2 fw-bold btn-submit-form">Gửi khảo sát</button>
            </div>
        </div>
    `;

    document.querySelector(".form-content").innerHTML = surveyHtml;
    document.querySelector(".btn-submit-form").addEventListener("click", function() {




        alert("Cảm ơn bạn đã tham gia khảo sát!");
    });
}


function renderQuestion(question) {
    const descriptionItem = question.children.find(option => option.QTypeID === "DESCRIPTION") || null;

    let html = `
        <div class="card shadow-sm p-3 rounded question-item" id="q${question.QID}">
            <p class="fw-semibold">${question.QIndex}. ${question.QContent}</p>
    `;
    if (descriptionItem) {

        html += `
        <p>${descriptionItem.QContent}</p>`;
        
        
    }

    switch (question.QTypeID) {
        case "MULTIPLE_CHOICE":
            html += patternQuestionMultipleChoice(question);
            break;
        case "SHORT_TEXT":
            html += `<input type="text" class="form-control mt-2" placeholder="Nhập câu trả lời">`;
            break;
        case "LONG_TEXT":
            html += `<textarea class="form-control mt-2" rows="3" placeholder="Nhập câu trả lời"></textarea>`;
            break;
        case "CHECKBOX":
            html += patternQuestionCheckBox(question);
            break;
        case "GRID_MULTIPLE_CHOICE":
            html += patternQuestionGridMultipleChoice(question);
            break;
        case "GRID_CHECKBOX":
            html += patternQuestionGridCheckBox(question);
            break;
        case "DROPDOWN":
            html += patternQuestionDropdown(question);
            break;
    }

    html += `</div>`;
    return html;
}


function  patternQuestionDropdown(question) {
    let options = question.children.map(option => `
        <option value="${option.QContent}">${option.QContent}</option>
    `).join('');

    return `
        <select class="form-select mt-2">
            <option selected disabled>Chọn câu trả lời</option>
            ${options}
        </select>
    `;
}
// function patternQuestionCheckBox(question) {
//     return question.children.map(option => `
//         <div class="form-check d-flex align-items-center gap-2 mt-1">
//             <input class="form-check-input custom-checkbox" type="checkbox" id="q${option.QID}" value="${option.QContent}">
//             <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
//         </div>
//     `).join('');
// }
//
// function patternQuestionMultipleChoice(question) {
//     return question.children.map(option => `
//         <div class="form-check d-flex align-items-center gap-2 mt-1">
//             <input class="form-check-input custom-radio" type="radio" name="q${question.QID}" id="q${option.QID}" value="${option.QContent}">
//             <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
//         </div>
//     `).join('');
// }
function patternQuestionCheckBox(question) {
    const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION");
    const anotherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

    const optionsHtml = options
        .map(option => `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-checkbox" type="checkbox" name="q${question.QID}" id="q${option.QID}" value="${option.QContent}">
        <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
    </div>
  `)
        .join('');

    const anotherHtml = anotherOption ? `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-checkbox" type="checkbox" name="q${question.QID}" id="q${anotherOption.QID}" value="${anotherOption.QContent}">
        <label class="form-check-label" for="q${anotherOption.QID}">${anotherOption.QContent}</label>
        <input type="text" class="form-control ms-2" placeholder="Enter custom answer">
    </div>
  ` : '';

    return optionsHtml + anotherHtml;
}

function patternQuestionMultipleChoice(question) {
  const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION");
  const anotherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

const optionsHtml = options
  .map(option => `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-radio" type="radio" name="q${question.QID}" id="q${option.QID}" value="${option.QContent}">
        <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
    </div>
  `)
  .join('');

const anotherHtml = anotherOption ? `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-radio" type="radio" name="q${question.QID}" id="q${anotherOption.QID}" value="${anotherOption.QContent}">
        <label class="form-check-label" for="q${anotherOption.QID}">${anotherOption.QContent}</label>
        <input type="text" class="form-control ms-2" placeholder="Enter custom answer">
    </div>
  ` : '';

  return optionsHtml + anotherHtml;
}

function patternQuestionGridMultipleChoice(question) {
    let columns = question.children.filter(c => c.QTypeID === "GRID_MC_COLUMN");
    let rows = question.children.filter(c => c.QTypeID === "GRID_MC_ROW");

    let html = `
      <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered align-middle text-center">
          <thead class="table-light">
            <tr>
              <th scope="col" class="text-start">Question</th>
    `;
    columns.forEach(col => {
        html += `<th scope="col">${col.QContent}</th>`;
    });
    html += `</tr></thead><tbody>`;

    rows.forEach(row => {
        html += `<tr><th scope="row" class="text-start">${row.QContent}</th>`;
        columns.forEach(col => {
            html += `
              <td>
                <input type="radio"
                       class="form-check-input custom-radio"
                       name="q${row.QID}"
                       id="q${row.QID}_${col.QID}"
                       value="${col.QContent}">
              </td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}


function patternQuestionGridCheckBox(question) {
    let columns = question.children.filter(c => c.QTypeID === "GRID_CHECKBOX_COLUMN");
    let rows = question.children.filter(c => c.QTypeID === "GRID_CHECKBOX_ROW");

    let html = `
      <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered align-middle text-center">
          <thead class="table-light">
            <tr>
              <th scope="col" class="text-start">Question</th>
    `;
    columns.forEach(col => {
        html += `<th scope="col">${col.QContent}</th>`;
    });
    html += `</tr></thead><tbody>`;

    rows.forEach(row => {
        html += `<tr><th scope="row" class="text-start">${row.QContent}</th>`;
        columns.forEach(col => {
            html += `
              <td>
                <input type="checkbox"
                       class="form-check-input custom-checkbox"
                       name="q${row.QID}[]"
                       id="q${row.QID}_${col.QID}"
                       value="${col.QContent}">
              </td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}
