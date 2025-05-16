document.addEventListener('DOMContentLoaded', async function() {
    const pathParts = window.location.pathname.split('/');
    formId = pathParts[pathParts.length - 1];

    const userId = await getCurrentUser(); 
    // console.log('User ID:', userId);
    if (!formId) {
        showError('Khong tim duoc form ID.');
        return;
    }
    
    loadSurveyForm(formId);
    
    document.getElementById('btn-submit-survey').addEventListener('click', function() {
        submitSurvey(formId, userId);
    });
    
    document.getElementById('btn-go-home').addEventListener('click', function() {
        window.location.href = '/';
    });
});

/**
 * Get the current logged-in user
 */
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
            alert('User data not found in response');
            throw new Error('User data not found in response');
        }
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        return null; 
    }
}

/**
 * Load the survey form details and questions
 */
function loadSurveyForm(formId) {
    fetch(`/api/admin/form/${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load form');
            }
            return response.json();
        })
        .then(data => {
            if (data.status && data.data) {
         
                displayFormDetails(data.data.form);
                
                renderQuestions(data.data.questions);
            } else {
                throw new Error(data.message || 'Failed to load form data');
            }
        })
        .catch(error => {
            showError(`Error: ${error.message}`);
        });
}

/**
 * Display form title, description, etc.
 */
function displayFormDetails(form) {
    document.getElementById('form-title').textContent = form.FName || 'Survey Form';
    document.getElementById('form-description').textContent = form.Note || '';
    
     
    const statusBadge = document.getElementById('form-status');
    if (form.Status === 'active' || form.Status === '1') {
        statusBadge.classList.add('bg-success');
        statusBadge.textContent = 'Active';
    } else {
        statusBadge.classList.add('bg-secondary');
        statusBadge.textContent = 'Inactive';
    }
}

/**
 * Render survey questions based on their type
 */
function renderQuestions(questions) {
    const container = document.getElementById('survey-container');
    container.innerHTML = '';  
    
    if (!questions || questions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No questions available in this survey.</div>';
        return;
    }
    
     
    const form = document.createElement('form');
    form.id = 'survey-form';
    form.className = 'needs-validation';
    form.noValidate = true;
    
     
    const sortedQuestions = [...questions].sort((a, b) => {
        const aIdx = a.QIndex ? a.QIndex.toString() : '0';
        const bIdx = b.QIndex ? b.QIndex.toString() : '0';
        return aIdx.localeCompare(bIdx, undefined, { numeric: true });
    });
    
     
    sortedQuestions.forEach((question, index) => {
        if (question.QTypeID === 'SUBTITLE') {
             
            const subtitle = document.createElement('div');
            subtitle.className = 'mb-4 mt-4';
            subtitle.innerHTML = `
                <h4 class="border-bottom pb-2">${question.QContent || 'Section'}</h4>
            `;
            
             
            const description = question.children.find(child => child.QTypeID === 'DESCRIPTION');
            if (description) {
                const descElement = document.createElement('div');
                descElement.className = 'text-muted mb-3';
                descElement.textContent = description.QContent || '';
                subtitle.appendChild(descElement);
            }
            
            form.appendChild(subtitle);
        } else if (question.QTypeID === 'MULTIPLE_CHOICE') {
            form.appendChild(renderMultipleChoice(question, index));
        } else if (question.QTypeID === 'CHECKBOX') {
            form.appendChild(renderCheckboxGroup(question, index));
        } else if (question.QTypeID === 'SHORT_ANSWER') {
            form.appendChild(renderShortAnswer(question, index));
        } else if (question.QTypeID === 'LONG_ANSWER') {
            form.appendChild(renderLongAnswer(question, index));
        } else if (question.QTypeID === 'GRID_MULTIPLE_CHOICE') {
            form.appendChild(renderGridMultipleChoice(question, index));
        } else if (question.QTypeID === 'GRID_CHECKBOX') {
            form.appendChild(renderGridCheckbox(question, index));
        }
    });
    
    container.appendChild(form);
}

/**
 * Render a multiple choice question
 */
function renderMultipleChoice(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'MULTIPLE_CHOICE';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
    const options = question.children.filter(child => child.QTypeID === 'MC_OPTION');
    
    options.forEach((option, optionIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check mb-2';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'form-check-input';
        input.name = `question_${question.QID}`;
        input.id = `option_${question.QID}_${optionIndex}`;
        input.value = option.QID;
        input.dataset.content = option.QContent;
        input.required = true;
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `option_${question.QID}_${optionIndex}`;
        label.textContent = option.QContent;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        questionDiv.appendChild(optionDiv);
    });
    
     
    const anotherOption = question.children.find(child => child.QTypeID === 'ANOTHER_OPTION');
    if (anotherOption) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'form-check mb-2';
        
        const otherInput = document.createElement('input');
        otherInput.type = 'radio';
        otherInput.className = 'form-check-input';
        otherInput.name = `question_${question.QID}`;
        otherInput.id = `option_${question.QID}_other`;
        otherInput.value = 'other';
        
        const otherLabel = document.createElement('label');
        otherLabel.className = 'form-check-label';
        otherLabel.htmlFor = `option_${question.QID}_other`;
        otherLabel.textContent = anotherOption.QContent || 'Other:';
        
        const otherTextField = document.createElement('input');
        otherTextField.type = 'text';
        otherTextField.className = 'form-control mt-1 d-none';
        otherTextField.id = `other_text_${question.QID}`;
        otherTextField.placeholder = 'Please specify';
        
        otherInput.addEventListener('change', function() {
            if (this.checked) {
                otherTextField.classList.remove('d-none');
                otherTextField.focus();
            } else {
                otherTextField.classList.add('d-none');
            }
        });
        
        otherDiv.appendChild(otherInput);
        otherDiv.appendChild(otherLabel);
        otherDiv.appendChild(otherTextField);
        questionDiv.appendChild(otherDiv);
    }
    
    return questionDiv;
}

/**
 * Render a checkbox group question
 */
function renderCheckboxGroup(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'CHECKBOX';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
    const options = question.children.filter(child => child.QTypeID === 'CHECKBOX_OPTION');
    
    options.forEach((option, optionIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check mb-2';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        input.name = `question_${question.QID}[]`;
        input.id = `option_${question.QID}_${optionIndex}`;
        input.value = option.QID;
        input.dataset.content = option.QContent;
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `option_${question.QID}_${optionIndex}`;
        label.textContent = option.QContent;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        questionDiv.appendChild(optionDiv);
    });
    
     
    const anotherOption = question.children.find(child => child.QTypeID === 'ANOTHER_OPTION');
    if (anotherOption) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'form-check mb-2';
        
        const otherInput = document.createElement('input');
        otherInput.type = 'checkbox';
        otherInput.className = 'form-check-input';
        otherInput.name = `question_${question.QID}[]`;
        otherInput.id = `option_${question.QID}_other`;
        otherInput.value = 'other';
        
        const otherLabel = document.createElement('label');
        otherLabel.className = 'form-check-label';
        otherLabel.htmlFor = `option_${question.QID}_other`;
        otherLabel.textContent = anotherOption.QContent || 'Other:';
        
        const otherTextField = document.createElement('input');
        otherTextField.type = 'text';
        otherTextField.className = 'form-control mt-1 d-none';
        otherTextField.id = `other_text_${question.QID}`;
        otherTextField.placeholder = 'Please specify';
        
        otherInput.addEventListener('change', function() {
            if (this.checked) {
                otherTextField.classList.remove('d-none');
                otherTextField.focus();
            } else {
                otherTextField.classList.add('d-none');
            }
        });
        
        otherDiv.appendChild(otherInput);
        otherDiv.appendChild(otherLabel);
        otherDiv.appendChild(otherTextField);
        questionDiv.appendChild(otherDiv);
    }
    
    return questionDiv;
}

/**
 * Render a short answer question
 */
function renderShortAnswer(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'SHORT_ANSWER';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'mb-3';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.id = `question_${question.QID}`;
    input.name = `question_${question.QID}`;
    input.placeholder = 'Your answer';
    input.required = true;
    
    inputGroup.appendChild(input);
    questionDiv.appendChild(inputGroup);
    
    return questionDiv;
}

/**
 * Render a long answer question
 */
function renderLongAnswer(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'LONG_ANSWER';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'mb-3';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.id = `question_${question.QID}`;
    textarea.name = `question_${question.QID}`;
    textarea.placeholder = 'Your answer';
    textarea.rows = 4;
    textarea.required = true;
    
    inputGroup.appendChild(textarea);
    questionDiv.appendChild(inputGroup);
    
    return questionDiv;
}

/**
 * Render a grid of multiple choice questions
 */
function renderGridMultipleChoice(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'GRID_MULTIPLE_CHOICE';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
     
    const rows = question.children.filter(child => child.QTypeID === 'GRID_MC_ROW');
    const columns = question.children.filter(child => child.QTypeID === 'GRID_MC_COLUMN');
    
    if (rows.length === 0 || columns.length === 0) {
        const warning = document.createElement('div');
        warning.className = 'alert alert-warning';
        warning.textContent = 'This grid question is not properly configured.';
        questionDiv.appendChild(warning);
        return questionDiv;
    }
    
     
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    
     
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
     
    const cornerCell = document.createElement('th');
    cornerCell.scope = 'col';
    headerRow.appendChild(cornerCell);
    
     
    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = column.QContent;
        th.dataset.columnId = column.QID;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
     
    const tbody = document.createElement('tbody');
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
         
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = row.QContent;
        th.dataset.rowId = row.QID;
        tr.appendChild(th);
        
         
        columns.forEach(column => {
            const td = document.createElement('td');
            td.className = 'text-center';
            
            const radioContainer = document.createElement('div');
            radioContainer.className = 'form-check d-flex justify-content-center';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'form-check-input';
            input.name = `grid_${question.QID}_row_${row.QID}`;
            input.id = `grid_${question.QID}_${row.QID}_${column.QID}`;
            input.value = column.QID;
            input.dataset.rowContent = row.QContent;
            input.dataset.columnContent = column.QContent;
            
            radioContainer.appendChild(input);
            td.appendChild(radioContainer);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    questionDiv.appendChild(table);
    
    return questionDiv;
}

/**
 * Render a grid of checkbox questions
 */
function renderGridCheckbox(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4 question-container';
    questionDiv.dataset.questionId = question.QID;
    questionDiv.dataset.questionType = 'GRID_CHECKBOX';
    
    const questionTitle = document.createElement('h5');
    questionTitle.className = 'mb-3';
    questionTitle.textContent = `${index + 1}. ${question.QContent}`;
    questionDiv.appendChild(questionTitle);
    
     
    const rows = question.children.filter(child => child.QTypeID === 'GRID_CHECKBOX_ROW');
    const columns = question.children.filter(child => child.QTypeID === 'GRID_CHECKBOX_COLUMN');
    
    if (rows.length === 0 || columns.length === 0) {
        const warning = document.createElement('div');
        warning.className = 'alert alert-warning';
        warning.textContent = 'This grid question is not properly configured.';
        questionDiv.appendChild(warning);
        return questionDiv;
    }
    
     
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    
     
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
     
    const cornerCell = document.createElement('th');
    cornerCell.scope = 'col';
    headerRow.appendChild(cornerCell);
    
     
    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = column.QContent;
        th.dataset.columnId = column.QID;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
     
    const tbody = document.createElement('tbody');
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
         
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = row.QContent;
        th.dataset.rowId = row.QID;
        tr.appendChild(th);
        
         
        columns.forEach(column => {
            const td = document.createElement('td');
            td.className = 'text-center';
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'form-check d-flex justify-content-center';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'form-check-input';
            input.name = `grid_${question.QID}_row_${row.QID}[]`;
            input.id = `grid_${question.QID}_${row.QID}_${column.QID}`;
            input.value = column.QID;
            input.dataset.rowContent = row.QContent;
            input.dataset.columnContent = column.QContent;
            
            checkboxContainer.appendChild(input);
            td.appendChild(checkboxContainer);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    questionDiv.appendChild(table);
    
    return questionDiv;
}

/**
 * Collect answers from form and submit to API
 */
function submitSurvey(formId, userId) {
    if (!formId){
        showError('Khong tim duoc form ID.');
        return;
    }
    if (!userId) {
        showError('Ban can dang nhap.');
        return;
    }

     
    const form = document.getElementById('survey-form');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showError('Please complete all required fields before submitting.');
        return;
    }
    
    const questionContainers = document.querySelectorAll('.question-container');
    const answers = [];
    
    questionContainers.forEach(container => {
        const questionId = container.dataset.questionId;
        const questionType = container.dataset.questionType;
        
        if (questionType === 'MULTIPLE_CHOICE') {
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
        } else if (questionType === 'CHECKBOX') {
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
        } else if (questionType === 'SHORT_ANSWER' || questionType === 'LONG_ANSWER') {
            const input = document.getElementById(`question_${questionId}`);
            if (input && input.value.trim()) {
                answers.push({
                    QID: questionId,
                    AContent: input.value.trim()
                });
            }
        } else if (questionType === 'GRID_MULTIPLE_CHOICE') {
             
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
        } else if (questionType === 'GRID_CHECKBOX') {
            const rowHeaders = container.querySelectorAll('th[data-row-id]');
            rowHeaders.forEach(row => {
                const rowId = row.dataset.rowId;
                const selectedOptions = container.querySelectorAll(`input[name="grid_${questionId}_row_${rowId}[]"]:checked`);
                
                if (selectedOptions.length > 0) {
                    const checkedColumns = Array.from(selectedOptions).map(option => option.dataset.columnContent);
                    
                    answers.push({
                        QID: rowId,
                        AContent: JSON.stringify({
                            row: row.textContent,
                            columns: checkedColumns
                        })
                    });
                }
            });
        }
    });
    
    const submitData = {
        formId: formId,
        userId: userId,
        answers: answers
    };
    
     
    fetch(`${config.apiUrl}/submit-survey`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit survey');
        }
        return response.json();
    })
    .then(data => {
        if (data.status) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        } else {
            throw new Error(data.message || 'Failed to submit survey');
        }
    })
    .catch(error => {
        showError(`Error: ${error.message}`);
    });
}

/**
 * Display error message
 */
function showError(message) {
    const container = document.getElementById('survey-container');
    
    const existingError = document.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    
    container.insertAdjacentElement('beforebegin', errorDiv);
    
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}