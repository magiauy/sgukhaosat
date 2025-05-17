import {callApi} from "./apiService.js";
    document.addEventListener('DOMContentLoaded', async function() {
        Loader.show();
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = urlParams.get('auth');
        if (authToken) {
            // Remove the auth parameter from URL without page refresh
            const url = new URL(window.location);
            url.searchParams.delete('auth');
            window.history.replaceState({}, document.title, url);

            // You can still process the token if needed
            try {
                // Process auth token here if needed
                // This code will run after removing from URL
            } catch (error) {
                console.error('Error processing auth token:', error);
            }
        }
        if (path.match(/\/form\/(\d+)/)) {
        const matches = path.match(/\/form\/(\d+)/);
        const formId = parseInt(matches[1], 10);

        try {
        console.log('Form ID:', formId);
        const formData = await callApi(`/form?id=${formId}`);
        // console.log('Form data:', formData);
        renderSurvey(formData['data']);
        } catch (error) {
        console.error('Error loading form:', error);
        } finally {
            setTimeout(() => Loader.hide(), 600);
            // Loader.hide();
        }
    }
    });

    // Explanation:
    // 1. Removes all drag handles, edit controls, and contenteditable features.
    // 2. Builds a basic read-only display for survey form data.
    // 3. Replaces interactive form fields with plain text or read-only inputs.
    async function renderSurvey(data) {
        let surveyHtml = `
        <form id="survey-form" onsubmit="return false;">
            <div id="survey-body" class="survey-body container py-4 px-3" style="max-width: 720px">
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
                        <button type="button" class="btn btn-success px-5 py-2 fw-bold btn-submit-form">Gửi khảo sát</button>
                    </div>
                </div>
            </form>
        `;

        document.querySelector(".form-content").innerHTML = surveyHtml;
        const userId = await getCurrentUser();
        document.querySelector(".btn-submit-form").addEventListener("click", () => {
            const form = document.getElementById('survey-form');
            if(!form.checkValidity()) {
                showError('Vui lòng điền đầy đủ thông tin khảo sát');
                const firstInvalidElement = form.querySelector(':invalid');
                if (firstInvalidElement) {
                    firstInvalidElement.focus();
                }
                return;
            }
            submitSurvey(data.form.FID, userId);
        });  
    }


async function getCurrentUser() {
    try {
        const response = await fetch(`${config.apiUrl}/me`, {
            method: "POST",
            credentials: "include",
        });
        
        if(!response.ok) {
            throw new Error('Failed to fetch user data (check auth)');
        }

        const reData = await response.json();
        console.log('User data:', reData);
        // if (!reData) alert('No data found in response');
        // if (!reData.data) alert('No data found in response.data');
        // if (reData.data.user.email) alert('User email: ' + reData.data.user.email);

        if(reData && reData.data) {  
            const userInfo = reData.data.user;
            return userInfo.email || null;
        } else {
            // console.error('User data structure:', data);
            throw new Error('User data not found in response');
        }
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        return null; 
    }
}
function validateRequired() {
    const multipleChoiceQuestions = document.querySelectorAll('input[type="radio"][data-required="true"]');
    
    let isValid = true;
    let firstInvalidElement = null;
    
    multipleChoiceQuestions.forEach(radio => {
        const questionContainer = radio.closest('.questionContainer');
        if (questionContainer) {
            const checked = questionContainer.querySelector('input[type="radio"]:checked');
            if (!checked) {
                isValid = false;
                if (!questionContainer.querySelector('.invalid-feedback')) {
                    const feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback d-block';
                    feedback.textContent = 'Vui lòng chọn một tùy chọn';
                    questionContainer.appendChild(feedback);
                }
                
                // Store the first radio button in this group for focusing
                if (!firstInvalidElement) {
                    firstInvalidElement = questionContainer.querySelector('input[type="radio"]');
                }
            }
        }
    });
    
    const checkboxGroups = document.querySelectorAll('input[type="checkbox"][data-required="true"]');
    
    const groupNames = new Set();
    checkboxGroups.forEach(checkbox => {
        groupNames.add(checkbox.name);
    });
    
    groupNames.forEach(name => {
        const checked = document.querySelectorAll(`input[name="${name}"]:checked`).length > 0;
        if (!checked) {
            isValid = false;
            const container = document.querySelector(`input[name="${name}"]`).closest('.questionContainer');
            if (container && !container.querySelector('.invalid-feedback')) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback d-block';
                feedback.textContent = 'Vui lòng chọn ít nhất một tùy chọn';
                container.appendChild(feedback);
            }
            
            if (!firstInvalidElement) {
                firstInvalidElement = document.querySelector(`input[name="${name}"]`);
            }
        }
    });
    
    if (!isValid && firstInvalidElement) {
        firstInvalidElement.focus();
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}
function submitSurvey(formId, userId) {
    if (!formId){
        showError('Không tìm được form ID.');
        return;
    }
    if (!userId) {
        showError('Bạn cần đăng nhập.');
        sleep(1000).then(() => {
            window.location.href = '/login';
        });
        return;
    }
    
    // Validate required checkbox groups
    if (!validateRequired()) {
        showError('Vui lòng điền đầy đủ thông tin khảo sát');
        return;
    }
    const questionContainers = document.querySelectorAll('.questionContainer');
    const answers = [];
    
    questionContainers.forEach(container => {
        const questionId = container.dataset.questionId;
        const questionType = container.dataset.questionType;
        
        switch(questionType) {
            case 'MULTIPLE_CHOICE':
                const selectedOption = container.querySelector(`input[name="question_${questionId}"]:checked`);
                if (selectedOption) {
                    if (selectedOption.value === 'other') {
                        const otherText = document.getElementById(`other_text_${questionId}`).value.trim();
                        answers.push({
                            QID: questionId,
                            AContent: otherText || 'Other'
                        });
                    } else {
                        answers.push({
                            QID: questionId,
                            AContent: selectedOption.dataset.content
                        });
                    }
                }
                break;
                
            case 'CHECKBOX':
                const selectedOptions = container.querySelectorAll(`input[name="question_${questionId}[]"]:checked`);
                const checkedValues = [];
                
                selectedOptions.forEach(option => {
                    if (option.value === 'other') {
                        const otherText = document.getElementById(`other_text_${questionId}`).value.trim();
                        checkedValues.push(otherText || 'Other');
                    } else {
                        checkedValues.push(option.dataset.content);
                    }
                });
                
                if (checkedValues.length > 0) {
                    answers.push({
                        QID: questionId,
                        AContent: checkedValues
                    });
                }
                break;
                
            case 'SHORT_TEXT':
            case 'LONG_TEXT':
                const input = document.getElementById(`question_${questionId}`);
                if (input && input.value.trim()) {
                    answers.push({
                        QID: questionId,
                        AContent: input.value.trim()
                    });
                }
                break;
                
            case 'DROPDOWN':
                const select = document.getElementById(`question_${questionId}`);
                if (select && select.value && select.value !== 'Chọn câu trả lời') {
                    const selectedOption = select.options[select.selectedIndex];
                    answers.push({
                        QID: questionId,
                        AContent: selectedOption.dataset.content
                    });
                }
                break;
                
            case 'GRID_MULTIPLE_CHOICE':
                const rowHeaders = container.querySelectorAll('th[data-row-id]');
                rowHeaders.forEach(row => {
                    const rowId = row.dataset.rowId;
                    const selectedOption = container.querySelector(`input[name="grid_${questionId}_row_${rowId}"]:checked`);
                    
                    if (selectedOption) {
                        answers.push({
                            QID: rowId,
                            AContent: JSON.stringify({
                                row: selectedOption.dataset.rowContent,
                                column: selectedOption.dataset.columnContent
                            })
                        });
                    }
                });
                break;
                
            case 'GRID_CHECKBOX':
                const gridRowHeaders = container.querySelectorAll('th[data-row-id]');
                gridRowHeaders.forEach(row => {
                    const rowId = row.dataset.rowId;
                    const selectedCheckboxes = container.querySelectorAll(`input[name="grid_${questionId}_row_${rowId}[]"]:checked`);
                    
                    if (selectedCheckboxes.length > 0) {
                        const checkedColumns = Array.from(selectedCheckboxes).map(option => option.dataset.columnContent);
                        
                        answers.push({
                            QID: rowId,
                            AContent: JSON.stringify({
                                row: row.textContent,
                                columns: checkedColumns
                            })
                        });
                    }
                });
                break;
        }
    });
    if (answers.length === 0) {
        showError('Vui lòng điền đầy đủ thông tin khảo sát');
        return;
    }
    const submitData = {
        formId: formId,
        userId: userId,
        answers: answers
    };
    
    console.log('Submitting data:', submitData);
    
    fetch(`${config.apiUrl}/submit-survey`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Gửi khảo sát thất bại (mã lỗi: ' + response.status + ')');
        }
        return response.json();
    })
    .then(data => {
        if (data.status) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            setTimeout(() => {
                successModal.hide();
                window.location.href = '/';
            }, 2000);
        } else {
            throw new Error(data.message || 'Gửi khảo sát thất bại');
        }
    })
    .catch(error => {
        showError(`Error: ${error.message}`);
    });
}

function showError(message) {
    const container = document.getElementById('survey-body');
    
    const existingError = document.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    
    container.insertAdjacentElement('beforebegin', errorDiv);
    
    errorDiv.scrollIntoView({ bhavior: 'smooth' });
}


function renderQuestion(question) {
    // console.log('Rendering question:', question);
    const descriptionItem = question.children.find(option => option.QTypeID === "DESCRIPTION") || null;
    const isRequired = question.QRequired === true || question.QRequired === 1;

    let html = `
        <div class="card shadow-sm p-3 rounded question-item questionContainer" id="q${question.QID}" data-question-id="${question.QID}" data-question-type="${question.QTypeID}" >
            <p class="fw-semibold">${question.QIndex}. ${question.QContent}${isRequired ? ' <span class="text-danger">*</span>' : ''}</p>
    `;
    if (descriptionItem) {
        html += `
        <p>${descriptionItem.QContent}</p>`;
    }

    switch (question.QTypeID) {
        case "MULTIPLE_CHOICE":
            html += patternQuestionMultipleChoice(question, isRequired);
            break;
        case "SHORT_TEXT":
            html += `<input type="text" class="form-control mt-2" id="question_${question.QID}" name="question_${question.QID}" placeholder="Nhập câu trả lời"${isRequired ? ' required' : ''}>`;
            break;
        case "LONG_TEXT":
            html += `<textarea class="form-control mt-2" id="question_${question.QID}" name="question_${question.QID}" rows="3" placeholder="Nhập câu trả lời"${isRequired ? ' required' : ''}></textarea>`;
            break;
        case "CHECKBOX":
            html += patternQuestionCheckBox(question, isRequired);
            break;
        case "GRID_MULTIPLE_CHOICE":
            html += patternQuestionGridMultipleChoice(question, isRequired);
            break;
        case "GRID_CHECKBOX":
            html += patternQuestionGridCheckBox(question, isRequired);
            break;
        case "DROPDOWN":
            html += patternQuestionDropdown(question, isRequired);
            break;
    }

    html += `</div>`;
    return html;
}


function patternQuestionDropdown(question, isRequired) {
    let options = question.children.map(option => `
        <option value="${option.QID}" data-content="${option.QContent}">${option.QContent}</option>
    `).join('');

    return `
        <select class="form-select mt-2" id="question_${question.QID}" name="question_${question.QID}"${isRequired ? ' required' : ''}>
            <option selected disabled>Chọn câu trả lời</option>
            ${options}
        </select>
    `;
}

function patternQuestionCheckBox(question) {
    const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION");
    const anotherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

    const optionsHtml = options
        .map(option => `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-checkbox" 
               type="checkbox" 
               name="question_${question.QID}[]" 
               id="q${option.QID}" 
               value="${option.QID}"
               data-content="${option.QContent}"
               data-required="${question.QRequired ? 'true' : 'false'}">
        <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
    </div>
  `)
        .join('');

    const anotherHtml = anotherOption ? `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-checkbox" 
               type="checkbox" 
               name="question_${question.QID}[]" 
               id="q${anotherOption.QID}" 
               value="other"
               data-content="${anotherOption.QContent}"
               data-required="${question.QRequired ? 'true' : 'false'}">
        <label class="form-check-label" for="q${anotherOption.QID}">${anotherOption.QContent}</label>
        <input type="text" 
               class="form-control ms-2" 
               id="other_text_${question.QID}"
               placeholder="Enter custom answer">
    </div>
  ` : '';

    return optionsHtml + anotherHtml;
}

function patternQuestionMultipleChoice(question, isRequired) {
    console.log('Rendering question:', question);
  const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION");
  const anotherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

  const optionsHtml = options
    .map(option => `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-radio" 
               type="radio" 
               name="question_${question.QID}" 
               id="q${option.QID}" 
               value="${option.QID}"
               data-content="${option.QContent}"
               data-required="${isRequired ? 'true' : 'false'}">
        <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
    </div>
  `)
    .join('');

  const anotherHtml = anotherOption ? `
    <div class="form-check d-flex align-items-center gap-2 mt-1">
        <input class="form-check-input custom-radio" 
               type="radio" 
               name="question_${question.QID}" 
               id="q${anotherOption.QID}" 
               value="other"
               data-content="${anotherOption.QContent}">
        <label class="form-check-label" for="q${anotherOption.QID}">${anotherOption.QContent}</label>
        <input type="text" 
               class="form-control ms-2" 
               id="other_text_${question.QID}"
               placeholder="Nhập câu trả lời khác">
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
        html += `<tr><th scope="row" class="text-start" data-row-id="${row.QID}">${row.QContent}</th>`;
        columns.forEach(col => {
            html += `
              <td>
                <input type="radio"
                       class="form-check-input custom-radio"
                       name="grid_${question.QID}_row_${row.QID}"
                       id="q${row.QID}_${col.QID}"
                       value="${col.QID}"
                       data-row-content="${row.QContent}"
                       data-column-content="${col.QContent}">
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
        html += `<tr><th scope="row" class="text-start" data-row-id="${row.QID}">${row.QContent}</th>`;
        columns.forEach(col => {
            html += `
              <td>
                <input type="checkbox"
                       class="form-check-input custom-checkbox"
                       name="grid_${question.QID}_row_${row.QID}[]"
                       id="q${row.QID}_${col.QID}"
                       value="${col.QID}"
                       data-row-content="${row.QContent}"
                       data-column-content="${col.QContent}">
              </td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}
