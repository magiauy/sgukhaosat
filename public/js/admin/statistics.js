/**
 * Statistics Dashboard JavaScript
 * Handles API calls and data visualization for the statistics dashboard
 */

// Constants
import { callApi } from "../apiService.js";
const API_BASE_URL = '/v2/statistics';

// Charts
let responseChart = null;
let formResponseChart = null;
let questionDistributionChart = null;
let timeOfDayChart = null;

/**
 * Load dashboard overview statistics
 */
async function loadDashboardStats() {       
    // console.log(`${API_BASE_URL}/dashboard`);
    const data = await callApi(`${API_BASE_URL}/dashboard`, 'GET');
    console.log(data);  
    if (data.status) {
        document.getElementById('total-surveys').textContent = data.data.totalSurveys;
        document.getElementById('total-responses').textContent = data.data.totalResponses;
        document.getElementById('ongoing-surveys').textContent = data.data.activeSurveys;
        document.getElementById('completion-rate').textContent = `${data.data.completionRate}%`;
        
        // Update response trend chart
        createResponseChart(data.data.responsesByDate);
        
        // Update top forms list
        updateTopFormsList(data.data.responsesBySurvey);
        
        // Load additional metrics if available
        if (data.data.additionalMetrics) {
            updateAdditionalMetrics(data.data.additionalMetrics);
        }
    } else {
        showError('Failed to load dashboard statistics: ' + data.message);
    }
}

/**
 * Load form list for the dropdown
 */
async function loadFormList() {
    const data = await callApi(`${API_BASE_URL}/forms/responses`, 'GET');
    if (data.status) {
        const formSelect = document.getElementById('form-select');
        formSelect.innerHTML = '<option value="">Select a form</option>';
        
        data.data.forEach(form => {
            const option = document.createElement('option');
            option.value = form.formId;
            option.textContent = form.formName;
            formSelect.appendChild(option);
        });
        
        // Enable form selection
        formSelect.disabled = false;
        
        // Add change event listener
        formSelect.addEventListener('change', () => {
            const selectedFormId = formSelect.value;
            if (selectedFormId) {
                loadFormDetails(selectedFormId);
            } else {
                resetFormDetails();
            }
        });
    } else {
        showError('Failed to load form list: ' + data.message);
    }
}

/**
 * Load details for a specific form
 * @param {number} formId - Form ID to load details for
 */
async function loadFormDetails(formId) {
    document.getElementById('form-details-container').classList.remove('d-none');
    document.getElementById('form-loading').classList.remove('d-none');
    document.getElementById('form-details').classList.add('d-none');
    
    const data = await callApi(`${API_BASE_URL}/forms/${formId}`, 'GET');
    
    document.getElementById('form-loading').classList.add('d-none');
    document.getElementById('form-details').classList.remove('d-none');
    
    if (data.status) {
        displayFormDetails(data.data);
        
        // Load form response trend
        loadFormResponseTrend(formId);
        
        // Load question statistics if available
        loadQuestionStatistics(formId);
    } else {
        showError('Failed to load form details: ' + data.message);
    }
}

/**
 * Load response trend for a specific form
 * @param {number} formId - Form ID to load trend for
 */
async function loadFormResponseTrend(formId) {
    const timeframe = document.getElementById('trend-timeframe').value || 'daily';
    const days = document.getElementById('trend-period').value || '30';
    
    const data = await callApi(`${API_BASE_URL}/forms/${formId}/responses/trend?timeframe=${timeframe}&days=${days}`, 'GET');    
    if (data.status) {
        createFormResponseChart(data.data);
    } else {
        showError('Failed to load response trend: ' + data.message);
    }
}

/**
 * Load question statistics for a form
 * @param {number} formId - Form ID to load questions for
 */
async function loadQuestionStatistics(formId) {
    const data = await callApi(`${API_BASE_URL}/forms/${formId}/questions`, 'GET');
    
    if (data.status) {
        displayQuestionStatistics(data.data);
    } else {
        showError('Failed to load question statistics: ' + data.message);
    }
}

/**
 * Load time analysis statistics
 */
async function loadTimeAnalysis() {
    const data = await fetchAPI(`${API_BASE_URL}/time-analysis`);
    
    if (data.status) {
        createTimeAnalysisCharts(data.data);
    } else {
        showError('Failed to load time analysis: ' + data.message);
    }
}

/**
 * Create response trend chart
 * @param {Array} responseData - Response data by date
 */
function createResponseChart(responseData) {
    const ctx = document.getElementById('responseChart').getContext('2d');
    
    const labels = responseData.map(item => item.date);
    const counts = responseData.map(item => item.count);
    
    if (responseChart) {
        responseChart.destroy();
    }
    
    responseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Responses',
                data: counts,
                fill: false,
                borderColor: '#3f6ad8',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Create form response chart
 * @param {Object} data - Form response trend data
 */
function createFormResponseChart(data) {
    const ctx = document.getElementById('formResponseChart').getContext('2d');
    
    const labels = data.data.map(item => item.label);
    const counts = data.data.map(item => item.count);
    
    if (formResponseChart) {
        formResponseChart.destroy();
    }
    
    formResponseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Responses',
                data: counts,
                backgroundColor: '#4bc0c0',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Create time analysis charts
 * @param {Object} data - Time analysis data
 */
function createTimeAnalysisCharts(data) {
    // Time of day chart
    if (data.hourlyDistribution) {
        const ctx = document.getElementById('timeOfDayChart').getContext('2d');
        
        const labels = data.hourlyDistribution.map(item => item.hour);
        const counts = data.hourlyDistribution.map(item => item.count);
        
        if (timeOfDayChart) {
            timeOfDayChart.destroy();
        }
        
        timeOfDayChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Responses by Hour',
                    data: counts,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day (24-hour format)'
                        }
                    }
                }
            }
        });
    }
    
    // Update additional time analysis statistics
    const timeStats = document.getElementById('time-stats-details');
    let timeHtml = '';
    
    if (data.peakDay) {
        timeHtml += `<p><strong>Peak Day:</strong> ${data.peakDay.day} (${data.peakDay.count} responses)</p>`;
    }
    
    if (data.peakHour) {
        timeHtml += `<p><strong>Peak Hour:</strong> ${data.peakHour.hour}:00 (${data.peakHour.count} responses)</p>`;
    }
    
    if (data.averageCompletionTime) {
        timeHtml += `<p><strong>Average Completion Time:</strong> ${data.averageCompletionTime} seconds</p>`;
    }
    
    timeStats.innerHTML = timeHtml || 'No time analysis data available';
}

/**
 * Display form details in the UI
 * @param {Object} data - Form details data
 */
function displayFormDetails(data) {
    const formDetails = document.getElementById('form-details');
    
    const form = data.form;
    const totalResponses = data.totalResponses;
    const completionRate = data.completionRate;
    
    let html = `
    <div class="card mb-3">
        <div class="card-body">
            <h5 class="card-title">${form.FName}</h5>
            <p class="card-text">${form.Note || 'No description'}</p>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between">
                <span>Total Responses:</span>
                <strong>${totalResponses}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Target Responses:</span>
                <strong>${form.Limit || 'Unlimited'}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Completion Rate:</span>
                <strong>${completionRate}%</strong>
            </li>
        </ul>
    </div>`;
    
    // Show recent responses if available
    if (data.recentResponses && data.recentResponses.length > 0) {
        html += `
        <h6>Recent Responses:</h6>
        <ul class="list-group">`;
        
        data.recentResponses.forEach(response => {
            html += `
            <li class="list-group-item small">
                ${response.fullName || response.UID} - ${new Date(response.Date).toLocaleString()}
            </li>`;
        });
        
        html += `</ul>`;
    }
    
    formDetails.innerHTML = html;
}

/**
 * Display question statistics in the UI
 * @param {Object} data - Question statistics data
 */
function displayQuestionStatistics(data) {
    const questionsContainer = document.getElementById('question-stats');
    
    if (!data.questions || data.questions.length === 0) {
        questionsContainer.innerHTML = '<p>No question statistics available</p>';
        return;
    }
    
    let html = '';
    
    data.questions.forEach(question => {
        html += `
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0">Q: ${question.questionText}</h6>
            </div>
            <div class="card-body">`;
        
        // For multiple choice questions
        if (question.options && question.options.length > 0) {
            // Create chart
            html += `<div class="chart-container" style="height: 200px;">
                <canvas id="question-chart-${question.questionId}"></canvas>
            </div>`;
        } else {
            // For text responses
            html += `<p>Text responses: ${question.responseCount || 0}</p>`;
            
            if (question.textResponses && question.textResponses.length > 0) {
                html += `<ul class="list-group">`;
                question.textResponses.slice(0, 5).forEach(response => {
                    html += `<li class="list-group-item small">${response.text}</li>`;
                });
                html += `</ul>`;
                
                if (question.textResponses.length > 5) {
                    html += `<p class="small text-muted mt-2">${question.textResponses.length - 5} more responses...</p>`;
                }
            }
        }
        
        html += `</div>
        </div>`;
    });
    
    questionsContainer.innerHTML = html;
    
    // Create charts for multiple choice questions
    data.questions.forEach(question => {
        if (question.options && question.options.length > 0) {
            const canvas = document.getElementById(`question-chart-${question.questionId}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: question.options.map(opt => opt.text),
                        datasets: [{
                            data: question.options.map(opt => opt.count),
                            backgroundColor: [
                                '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                                '#5a5c69', '#858796', '#f8f9fc', '#d1d3e2', '#b7b9cc'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }
    });
}

/**
 * Update top forms list in the UI
 * @param {Array} formData - Form response data
 */
function updateTopFormsList(formData) {
    const listContainer = document.getElementById('top-forms-list');
    
    if (!formData || formData.length === 0) {
        listContainer.innerHTML = '<p>No form data available</p>';
        return;
    }
    
    let html = '<ul class="list-group">';
    
    formData.forEach(form => {
        const completionPercent = form.completionPercentage || 0;
        
        html += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${form.surveyName}
            <span class="badge bg-primary rounded-pill">${form.responseCount}</span>
        </li>`;
    });
    
    html += '</ul>';
    listContainer.innerHTML = html;
}

/**
 * Update additional metrics in the UI
 * @param {Object} metrics - Additional metrics data
 */
function updateAdditionalMetrics(metrics) {
    const metricsContainer = document.getElementById('additional-metrics');
    if (!metricsContainer) return;
    
    let html = '';
    
    if (metrics.averageResponseTime) {
        html += `<div class="col-md-4">
            <div class="card stats-card">
                <div class="stats-number">${metrics.averageResponseTime}s</div>
                <div class="stats-title">Avg Response Time</div>
            </div>
        </div>`;
    }
    
    if (metrics.responseRate) {
        html += `<div class="col-md-4">
            <div class="card stats-card">
                <div class="stats-number">${metrics.responseRate}%</div>
                <div class="stats-title">Response Rate</div>
            </div>
        </div>`;
    }
    
    if (metrics.activeSurveys) {
        html += `<div class="col-md-4">
            <div class="card stats-card">
                <div class="stats-number">${metrics.activeSurveys}</div>
                <div class="stats-title">Active Surveys</div>
            </div>
        </div>`;
    }
    
    if (html) {
        metricsContainer.innerHTML = html;
        metricsContainer.classList.remove('d-none');
    }
}

/**
 * Reset form details UI elements
 */
function resetFormDetails() {
    document.getElementById('form-details-container').classList.add('d-none');
    document.getElementById('form-details').innerHTML = '';
    document.getElementById('question-stats').innerHTML = '';
    
    if (formResponseChart) {
        formResponseChart.destroy();
        formResponseChart = null;
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.error(message);
    
    alert(message);
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    // Form trend timeframe controls
    const timeframeSelect = document.getElementById('trend-timeframe');
    const periodSelect = document.getElementById('trend-period');
    
    if (timeframeSelect && periodSelect) {
        const updateTrend = () => {
            const formId = document.getElementById('form-select').value;
            if (formId) {
                loadFormResponseTrend(formId);
            }
        };
        
        timeframeSelect.addEventListener('change', updateTrend);
        periodSelect.addEventListener('change', updateTrend);
    }
    
    // CSV Export button
    const exportButton = document.getElementById('export-csv-btn');
    if (exportButton) {
        exportButton.addEventListener('click', async () => {
            const formId = document.getElementById('form-select').value;
            if (!formId) {
                showError('Please select a form to export');
                return;
            }
            
            window.location.href = `${API_BASE_URL}/export/csv?formId=${formId}`;
        });
    }
    
    // Time analysis tab button
    const timeAnalysisTab = document.getElementById('time-analysis-tab');
    if (timeAnalysisTab) {
        timeAnalysisTab.addEventListener('click', () => {
            loadTimeAnalysis();
        });
    }
}

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
   
    loadDashboardStats();
    loadFormList();
    setupEventListeners();
    
    // Initialize tabs
    const tabEls = document.querySelectorAll('a[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', event => {
            const target = event.target.getAttribute('href');
            if (target === '#time-analysis' && !timeOfDayChart) {
                loadTimeAnalysis();
            }
        });
    });
});
