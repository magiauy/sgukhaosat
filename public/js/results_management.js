document.addEventListener('DOMContentLoaded', function() {
    let currentFormId = null;
    let formQuestions = [];
    let submissionsChart = null;
    

    loadForms();

    document.getElementById('form-selector').addEventListener('change', function() {
        const formId = this.value;
        if (formId) {
            currentFormId = formId;
            loadFormDetails(formId);
            loadFormResults(formId);
        } else {
            resetDashboard();
        }
    });
    
    document.getElementById('btn-export-results').addEventListener('click', function() {
        if (currentFormId) {
            exportResults(currentFormId);
        } else {
            showAlert('Please select a survey first', 'warning');
        }
    });
    

    document.getElementById('individual-tab').addEventListener('click', function() {
        if (currentFormId) {
            loadIndividualResponses(currentFormId);
        }
    });
    
    document.getElementById('analytics-tab').addEventListener('click', function() {
        if (currentFormId) {
            loadAnalytics(currentFormId);
        }
    });
});

/**
 * Load available forms for the selector
 */
function loadForms() {

    fetch('/api/admin/forms/pagination?page=1&limit=100')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load forms');
            }
            return response.json();
        })
        .then(data => {
            if (data.status && data.data && data.data.forms) {
                populateFormSelector(data.data.forms);
            } else {
                throw new Error(data.message || 'No forms available');
            }
        })
        .catch(error => {
            showAlert(`Error: ${error.message}`, 'danger');
        });
}

/**
 * Populate form selector with available forms
 */
function populateFormSelector(forms) {
    const selector = document.getElementById('form-selector');
    
     
    selector.innerHTML = '';
    
     
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a survey';
    selector.appendChild(defaultOption);
    
     
    forms.forEach(form => {
        const option = document.createElement('option');
        option.value = form.FID;
        option.textContent = form.FName;
        selector.appendChild(option);
    });
}

/**
 * Load form details and questions
 */
function loadFormDetails(formId) {
    fetch(`/api/admin/form/${formId}`)
        .then(response => {
            if (!response.ok) {
                resetDashboard();
                throw new Error('Failed to load form details');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.status && data.data) {
                formQuestions = data.data.questions || [];
            } else {
                throw new Error(data.message || 'Failed to load form data');
            }
        })
        .catch(error => {
            showAlert(`Error: ${error.message}`, 'danger');
        });
}

/**
 * Load form results summary
 */
function loadFormResults(formId) {
     
    document.getElementById('summary-loading').style.display = 'inline-block';
    document.getElementById('select-form-message').style.display = 'none';
    
     
    fetch(`/api/result/count?formId=${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load result count');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                updateResultsSummary(formId, data.data);
                 
                const activeTab = document.querySelector('.nav-link.active');
                if (activeTab.id === 'summary-tab') {
                    loadQuestionsSummary(formId);
                } else if (activeTab.id === 'individual-tab') {
                    loadIndividualResponses(formId);
                } else if (activeTab.id === 'analytics-tab') {
                    loadAnalytics(formId);
                }
            } else {
                throw new Error(data.message || 'Failed to load result count');
            }
        })
        .catch(error => {
            document.getElementById('summary-loading').style.display = 'none';
            document.getElementById('select-form-message').textContent = 'Error loading results';
            document.getElementById('select-form-message').style.display = 'block';
            showAlert(`Error: ${error.message}`, 'danger');
        });
}

/**
 * Update the results summary cards
 */
function updateResultsSummary(formId, count) {
    document.getElementById('total-submissions').textContent = count;
    
     
    fetch(`/api/result/form?formId=${formId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data && data.data.length > 0) {
                 
                const sortedResults = [...data.data].sort((a, b) => {
                    return new Date(b.Date) - new Date(a.Date);
                });
                
                if (sortedResults.length > 0) {
                    const lastDate = new Date(sortedResults[0].Date);
                    document.getElementById('last-submission').textContent = lastDate.toLocaleString();
                }
                
                 
                document.getElementById('completion-rate').textContent = '100%';
                
                 
                document.getElementById('average-time').textContent = 'N/A';
            }
        })
        .catch(error => {
            console.error('Error fetching results:', error);
        });
}

/**
 * Load summary of question responses
 */
function loadQuestionsSummary(formId) {
     
    document.getElementById('summary-loading').style.display = 'none';
    
     
    const container = document.getElementById('questions-summary');
    container.innerHTML = '';
    
     
    if (formQuestions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No questions available in this survey.</div>';
        return;
    }
    
     
    formQuestions.forEach((question, index) => {
         
        if (question.QTypeID === 'SUBTITLE') {
            return;
        }
        
         
        const card = document.createElement('div');
        card.className = 'card mb-4';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.textContent = `Question ${index + 1}: ${question.QContent}`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.innerHTML = `<div class="text-center"><div class="spinner-border" role="status"></div></div>`;
        
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        container.appendChild(card);
        
         
        loadQuestionStatistics(formId, question.QID, cardBody, question.QTypeID);
    });
}

/**
 * Load statistics for a specific question
 */
function loadQuestionStatistics(formId, questionId, container, questionType) {
    fetch(`/api/answer/statistics?formId=${formId}&questionId=${questionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load question statistics');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                displayQuestionStatistics(data.data, container, questionType);
            } else {
                throw new Error(data.message || 'Failed to load question statistics');
            }
        })
        .catch(error => {
            container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
}

/**
 * Display statistics for a question
 */
function displayQuestionStatistics(statistics, container, questionType) {
     
    container.innerHTML = '';
    
     
    if (statistics.length === 0) {
        container.innerHTML = '<p class="text-muted">No responses for this question yet.</p>';
        return;
    }
    
    if (questionType === 'MULTIPLE_CHOICE' || questionType === 'CHECKBOX') {
         
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '300px';
        container.appendChild(chartContainer);
        
        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
        
         
        const labels = statistics.map(stat => stat.AContent);
        const counts = statistics.map(stat => stat.count);
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Responses',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
         
        const table = document.createElement('table');
        table.className = 'table table-sm mt-3';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Response</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        const totalResponses = counts.reduce((sum, count) => sum + parseInt(count), 0);
        
        statistics.forEach(stat => {
            const percentage = ((stat.count / totalResponses) * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.AContent}</td>
                <td>${stat.count}</td>
                <td>${percentage}%</td>
            `;
            tbody.appendChild(row);
        });
        
        container.appendChild(table);
    } else if (questionType === 'GRID_MULTIPLE_CHOICE' || questionType === 'GRID_CHECKBOX') {
        container.innerHTML = '<p>Grid responses are shown in the table below:</p>';
        
        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Row</th>
                    <th>Column</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        statistics.forEach(stat => {
            try {
                const content = JSON.parse(stat.AContent);
                const row = document.createElement('tr');
                
                if (content.columns) {
                     
                    content.columns.forEach(column => {
                        row.innerHTML = `
                            <td>${content.row}</td>
                            <td>${column}</td>
                            <td>${stat.count}</td>
                        `;
                        tbody.appendChild(row.cloneNode(true));
                    });
                } else {
                     
                    row.innerHTML = `
                        <td>${content.row}</td>
                        <td>${content.column}</td>
                        <td>${stat.count}</td>
                    `;
                    tbody.appendChild(row);
                }
            } catch (error) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="3">Error parsing response: ${stat.AContent}</td>
                `;
                tbody.appendChild(row);
            }
        });
        
        container.appendChild(table);
    } else if (questionType === 'SHORT_ANSWER' || questionType === 'LONG_ANSWER') {
         
        const responseList = document.createElement('div');
        responseList.className = 'list-group';
        
        statistics.forEach((stat, index) => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Response ${index + 1}</h6>
                    <small>Count: ${stat.count}</small>
                </div>
                <p class="mb-1">${stat.AContent}</p>
            `;
            responseList.appendChild(item);
        });
        
        container.appendChild(responseList);
    }
}

/**
 * Load individual responses for the selected form
 */
function loadIndividualResponses(formId) {
    fetch(`/api/result/form?formId=${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load individual responses');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                displayIndividualResponses(data.data);
            } else {
                throw new Error(data.message || 'Failed to load individual responses');
            }
        })
        .catch(error => {
            showAlert(`Error: ${error.message}`, 'danger');
        });
}

/**
 * Display individual responses in the table
 */
function displayIndividualResponses(responses) {
    const tbody = document.querySelector('#responses-table tbody');
    tbody.innerHTML = '';
    
    if (!responses || responses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">No responses available</td>`;
        tbody.appendChild(row);
        return;
    }
    
    responses.forEach(response => {
        const row = document.createElement('tr');
        const date = new Date(response.Date).toLocaleString();
        
        row.innerHTML = `
            <td>${response.RID}</td>
            <td>${response.email || response.UID}</td>
            <td>${date}</td>
            <td>
                <button class="btn btn-sm btn-primary view-response" data-id="${response.RID}">View</button>
                <button class="btn btn-sm btn-danger delete-response" data-id="${response.RID}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
     
    document.querySelectorAll('.view-response').forEach(button => {
        button.addEventListener('click', function() {
            const responseId = this.dataset.id;
            viewResponseDetails(responseId);
        });
    });
    
    document.querySelectorAll('.delete-response').forEach(button => {
        button.addEventListener('click', function() {
            const responseId = this.dataset.id;
            if (confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
                deleteResponse(responseId);
            }
        });
    });
}

/**
 * View details of a specific response
 */
function viewResponseDetails(responseId) {
    const modal = new bootstrap.Modal(document.getElementById('responseDetailModal'));
    modal.show();
    
    const modalBody = document.getElementById('response-detail-content');
    
    fetch(`/api/answer/result?resultId=${responseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load response details');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                displayResponseDetails(data.data, modalBody);
            } else {
                throw new Error(data.message || 'Failed to load response details');
            }
        })
        .catch(error => {
            modalBody.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
}

/**
 * Display response details in the modal
 */
function displayResponseDetails(answers, container) {
    container.innerHTML = '';
    
    if (!answers || answers.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No answers in this response.</div>';
        return;
    }
    
     
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Question</th>
                <th>Answer</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    answers.forEach(answer => {
        const row = document.createElement('tr');
        
        let displayAnswer = answer.AContent;
        
         
        try {
            const jsonContent = JSON.parse(answer.AContent);
            if (typeof jsonContent === 'object') {
                if (jsonContent.columns) {
                     
                    displayAnswer = `${jsonContent.row}: ${jsonContent.columns.join(', ')}`;
                } else if (jsonContent.row && jsonContent.column) {
                     
                    displayAnswer = `${jsonContent.row}: ${jsonContent.column}`;
                }
            }
        } catch (e) {
             
        }
        
        row.innerHTML = `
            <td>${answer.QContent || 'Unknown question'}</td>
            <td>${displayAnswer}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    container.appendChild(table);
}

/**
 * Delete a response
 */
function deleteResponse(responseId) {
    fetch(`/api/result?id=${responseId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete response');
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                showAlert('Response deleted successfully', 'success');
                 
                loadIndividualResponses(currentFormId);
                 
                loadFormResults(currentFormId);
            } else {
                throw new Error(data.message || 'Failed to delete response');
            }
        })
        .catch(error => {
            showAlert(`Error: ${error.message}`, 'danger');
        });
}

/**
 * Load analytics data
 */
function loadAnalytics(formId) {
    const container = document.getElementById('question-charts-container');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Loading analytics...</p></div>';
    
    fetch(`/api/result/form?formId=${formId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data) {
                createSubmissionsChart(data.data);
                
                createQuestionCharts(formId, formQuestions, container);
            }
        })
        .catch(error => {
            container.innerHTML = `<div class="alert alert-danger">Error loading analytics: ${error.message}</div>`;
        });
}

/**
 * Create submissions over time chart
 */
function createSubmissionsChart(results) {
     
    const submissionsByDate = {};
    
    results.forEach(result => {
        const date = new Date(result.Date).toLocaleDateString();
        submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });
    
     
    const sortedDates = Object.keys(submissionsByDate).sort((a, b) => new Date(a) - new Date(b));
    
     
    const labels = sortedDates;
    const data = sortedDates.map(date => submissionsByDate[date]);
    
     
    const ctx = document.getElementById('submissions-chart').getContext('2d');
    
    if (window.submissionsChart) {
        window.submissionsChart.destroy();
    }
    
    window.submissionsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Submissions',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Create charts for individual questions
 */
function createQuestionCharts(formId, questions, container) {
     
    container.innerHTML = '';
    
     
    const filteredQuestions = questions.filter(q => q.QTypeID !== 'SUBTITLE');
    
    if (filteredQuestions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No questions available for analytics.</div>';
        return;
    }
    
     
    filteredQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-4';
        
        questionDiv.innerHTML = `
            <div class="card-header">
                Question ${index + 1}: ${question.QContent}
            </div>
            <div class="card-body">
                <div class="chart-container" style="position: relative; height:300px;">
                    <canvas id="question-chart-${question.QID}"></canvas>
                </div>
            </div>
        `;
        
        container.appendChild(questionDiv);
        
         
        fetch(`/api/answer/statistics?formId=${formId}&questionId=${question.QID}`)
            .then(response => response.json())
            .then(data => {
                if (data.status && data.data) {
                    createQuestionChart(question.QID, data.data, question.QTypeID);
                }
            })
            .catch(error => {
                console.error(`Error loading statistics for question ${question.QID}:`, error);
                const chartContainer = document.querySelector(`#question-chart-${question.QID}`).parentNode;
                chartContainer.innerHTML = `<div class="alert alert-danger">Error loading chart data</div>`;
            });
    });
}

/**
 * Create chart for a specific question
 */
function createQuestionChart(questionId, statistics, questionType) {
    if (statistics.length === 0) {
        const chartContainer = document.querySelector(`#question-chart-${questionId}`).parentNode;
        chartContainer.innerHTML = '<p class="text-muted">No data available for this question.</p>';
        return;
    }
    
    const ctx = document.getElementById(`question-chart-${questionId}`).getContext('2d');
    
    if (questionType === 'MULTIPLE_CHOICE' || questionType === 'CHECKBOX') {
         
        const labels = statistics.map(stat => stat.AContent);
        const data = statistics.map(stat => stat.count);
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Responses',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else if (questionType === 'GRID_MULTIPLE_CHOICE' || questionType === 'GRID_CHECKBOX') {
         
         
        const gridData = {};
        
        statistics.forEach(stat => {
            try {
                const content = JSON.parse(stat.AContent);
                
                if (content.columns) {
                     
                    if (!gridData[content.row]) {
                        gridData[content.row] = {};
                    }
                    
                    content.columns.forEach(column => {
                        gridData[content.row][column] = (gridData[content.row][column] || 0) + parseInt(stat.count);
                    });
                } else if (content.row && content.column) {
                     
                    if (!gridData[content.row]) {
                        gridData[content.row] = {};
                    }
                    
                    gridData[content.row][content.column] = parseInt(stat.count);
                }
            } catch (error) {
                console.error('Error parsing grid data:', error);
            }
        });
        
         
        const rows = Object.keys(gridData);
        let allColumns = new Set();
        
        rows.forEach(row => {
            Object.keys(gridData[row]).forEach(col => {
                allColumns.add(col);
            });
        });
        
        const columns = Array.from(allColumns);
        
         
        const datasets = rows.map((row, index) => {
            return {
                label: row,
                data: columns.map(col => gridData[row][col] || 0),
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
            };
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: columns,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } else if (questionType === 'SHORT_ANSWER' || questionType === 'LONG_ANSWER') {
         
        const chartContainer = document.querySelector(`#question-chart-${questionId}`).parentNode;
        
         
        const table = document.createElement('div');
        table.className = 'table-responsive';
        table.innerHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Answer</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        
        const tbody = table.querySelector('tbody');
        
        statistics.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.AContent}</td>
                <td>${stat.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        chartContainer.innerHTML = '';
        chartContainer.appendChild(table);
    }
}

/**
 * Export results to CSV
 */
function exportResults(formId) {
    fetch(`/api/result/form?formId=${formId}`)
        .then(response => response.json())
        .then(async data => {
            if (data.status && data.data && data.data.length > 0) {
                const results = data.data;
                
                 
                const formResponse = await fetch(`/api/admin/form/${formId}`);
                const formData = await formResponse.json();
                const form = formData.data.form;
                const questions = formData.data.questions;
                
                 
                let csv = `"Form: ${form.FName}"\n`;
                csv += `"Date Exported: ${new Date().toLocaleString()}"\n\n`;
                
                 
                csv += '"Response ID","Respondent","Date"';
                
                 
                const filteredQuestions = questions.filter(q => q.QTypeID !== 'SUBTITLE');
                filteredQuestions.forEach(question => {
                    csv += `,"${question.QContent}"`;
                });
                
                csv += '\n';
                
                 
                for (const result of results) {
                     
                    const answersResponse = await fetch(`/api/answer/result?resultId=${result.RID}`);
                    const answersData = await answersResponse.json();
                    const answers = answersData.data || [];
                    
                     
                    const answerMap = {};
                    answers.forEach(answer => {
                        answerMap[answer.QID] = answer.AContent;
                    });
                    
                     
                    csv += `"${result.RID}","${result.email || result.UID}","${new Date(result.Date).toLocaleString()}"`;
                    
                     
                    filteredQuestions.forEach(question => {
                        let answerContent = answerMap[question.QID] || '';
                        
                         
                        try {
                            const jsonContent = JSON.parse(answerContent);
                            if (typeof jsonContent === 'object') {
                                if (jsonContent.columns) {
                                    answerContent = `${jsonContent.row}: ${jsonContent.columns.join(', ')}`;
                                } else if (jsonContent.row && jsonContent.column) {
                                    answerContent = `${jsonContent.row}: ${jsonContent.column}`;
                                }
                            }
                        } catch (e) {
                             
                        }
                        
                         
                        answerContent = answerContent.replace(/"/g, '""');
                        csv += `,"${answerContent}"`;
                    });
                    
                    csv += '\n';
                }
                
                 
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `survey_results_${formId}_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showAlert('No results to export', 'warning');
            }
        })
        .catch(error => {
            showAlert(`Error exporting results: ${error.message}`, 'danger');
        });
}

/**
 * Reset dashboard to initial state
 */
function resetDashboard() {
    document.getElementById('total-submissions').textContent = '0';
    document.getElementById('completion-rate').textContent = '0%';
    document.getElementById('average-time').textContent = 'N/A';
    document.getElementById('last-submission').textContent = 'N/A';
    
    document.getElementById('questions-summary').innerHTML = `
        <div class="text-center py-5">
            <p id="select-form-message">Please select a survey to view results</p>
        </div>
    `;
    
    document.querySelector('#responses-table tbody').innerHTML = `
        <tr>
            <td colspan="4" class="text-center">Please select a survey to view responses</td>
        </tr>
    `;
    
    document.getElementById('question-charts-container').innerHTML = `
        <div class="text-center py-5">
            <p>Please select a survey to view analytics</p>
        </div>
    `;
    
     
    if (window.submissionsChart) {
        window.submissionsChart.destroy();
        window.submissionsChart = null;
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.className = 'position-fixed top-0 end-0 p-3';
    alertPlaceholder.style.zIndex = '5';
    document.body.appendChild(alertPlaceholder);
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertPlaceholder.appendChild(wrapper);
    
     
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
        alert.close();
    }, 5000);
}