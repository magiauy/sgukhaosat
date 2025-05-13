/**
 * Statistics Dashboard Debug JavaScript
 * Enhanced version with better error handling and debugging
 */
console.log('[DEBUG] Statistics Dashboard Debug JavaScript loaded');
// Constants
const API_BASE_URL = '/api/v2/statistics';
// JWT token will be sent automatically via cookies
let authToken = null;

// Charts
let responseChart = null;
let formResponseChart = null;
let questionDistributionChart = null;
let timeOfDayChart = null;

/**
 * Enhanced API request helper with better error handling
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - API response
 */
async function fetchAPI(endpoint, options = {}) {
    console.log(`[DEBUG] Fetching from: ${endpoint}`);
    
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
              
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            },
            // Include credentials to send cookies with the request
            credentials: 'same-origin'
        };
        
        // Add a cache-busting parameter to the URL
        const cacheBuster = new Date().getTime();
        const urlWithCacheBust = endpoint + (endpoint.includes('?') ? '&' : '?') + '_=' + cacheBuster;
        
        console.log(`[DEBUG] Sending request to: ${urlWithCacheBust}`);
        const response = await fetch(urlWithCacheBust, { ...defaultOptions, ...options });
        console.log(`[DEBUG] Response status: ${response.status}`);
        
        // Handle non-OK responses
        if (!response.ok) {
            // For unauthorized responses, redirect to login
            if (response.status === 401) {
                console.error('[DEBUG] Authentication error (401). Redirecting to login...');
                window.location.href = '/login.php';
                return { status: false, message: 'Authentication error', code: 401 };
            }
            
            let errorMessage = `API request failed with status ${response.status}`;
            
            // Try to get more details about the error
            try {
                const errorText = await response.text();
                console.error('[DEBUG] Error response body:', errorText);
                
                if (errorText && errorText.trim().length > 0) {
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (jsonError) {
                        console.error('[DEBUG] Error parsing JSON from error response:', jsonError);
                    }
                }
            } catch (textError) {
                console.error('[DEBUG] Error getting text from error response:', textError);
            }
            
            return { 
                status: false, 
                message: errorMessage, 
                code: response.status 
            };
        }
        
        // For successful responses, get the response body
        try {
            // Clone the response before reading it as text
            // This is because reading the body consumes the response
            const responseClone = response.clone();
            
            // Get the raw response text for debugging
            const rawText = await responseClone.text();
            console.log('[DEBUG] Raw response:', rawText);
            
            // Check for empty responses
            if (!rawText || rawText.trim().length === 0) {
                console.error('[DEBUG] Empty response received');
                return { status: false, message: 'Empty response from server' };
            }
            
            // Try to parse the response as JSON
            try {
                const jsonData = JSON.parse(rawText);
                console.log('[DEBUG] Parsed JSON response:', jsonData);
                return jsonData;
            } catch (jsonError) {
                console.error('[DEBUG] Error parsing JSON response:', jsonError);
                return { 
                    status: false, 
                    message: 'Invalid JSON response', 
                    error: jsonError.message,
                    rawText: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : '')
                };
            }
        } catch (error) {
            console.error('[DEBUG] Error processing response:', error);
            return { status: false, message: 'Error processing response', error: error.message };
        }
    } catch (networkError) {
        console.error('[DEBUG] Network error:', networkError);
        return { status: false, message: 'Network error', error: networkError.message };
    }
}

/**
 * Load dashboard overview statistics
 */
async function loadDashboardStats() {
    console.log('[DEBUG] Loading dashboard statistics');
    const data = await fetchAPI(`${API_BASE_URL}/dashboard`);
    
    if (data.status) {
        console.log('[DEBUG] Dashboard stats loaded successfully');
        // Update stats cards
        document.getElementById('total-surveys').textContent = data.data.totalSurveys;
        document.getElementById('total-responses').textContent = data.data.totalResponses;
        document.getElementById('ongoing-surveys').textContent = data.data.ongoingSurveys;
        document.getElementById('completion-rate').textContent = `${data.data.completionRate}%`;
        
        // Update response trend chart
        if (data.data.responsesByDate && Array.isArray(data.data.responsesByDate)) {
            createResponseChart(data.data.responsesByDate);
        } else {
            console.warn('[DEBUG] responsesByDate is missing or not an array');
        }
        
        // Update top forms list
        if (data.data.responsesBySurvey && Array.isArray(data.data.responsesBySurvey)) {
            updateTopFormsList(data.data.responsesBySurvey);
        } else {
            console.warn('[DEBUG] responsesBySurvey is missing or not an array');
        }
        
        // Load additional metrics if available
        if (data.data.additionalMetrics) {
            updateAdditionalMetrics(data.data.additionalMetrics);
        }
    } else {
        console.error('[DEBUG] Failed to load dashboard stats:', data.message);
        showError('Failed to load dashboard statistics: ' + data.message);
    }
}

/**
 * Load form list for the dropdown
 */
async function loadFormList() {
    console.log('[DEBUG] Loading form list');
    const data = await fetchAPI(`${API_BASE_URL}/forms/responses`);
    
    if (data.status) {
        console.log('[DEBUG] Form list loaded successfully');
        const formSelect = document.getElementById('form-select');
        formSelect.innerHTML = '<option value="">Select a form</option>';
        
        if (data.data && Array.isArray(data.data)) {
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
            console.warn('[DEBUG] Form data is missing or not an array');
            formSelect.innerHTML += '<option value="" disabled>No forms available</option>';
        }
    } else {
        console.error('[DEBUG] Failed to load form list:', data.message);
        showError('Failed to load form list: ' + data.message);
    }
}

/**
 * Load details for a specific form
 * @param {number} formId - Form ID to load details for
 */
async function loadFormDetails(formId) {
    console.log(`[DEBUG] Loading form details for form ID: ${formId}`);
    
    document.getElementById('form-details-container').classList.remove('d-none');
    document.getElementById('form-loading').classList.remove('d-none');
    document.getElementById('form-details').classList.add('d-none');
    
    const data = await fetchAPI(`${API_BASE_URL}/forms/${formId}`);
    
    document.getElementById('form-loading').classList.add('d-none');
    document.getElementById('form-details').classList.remove('d-none');
    
    if (data.status) {
        console.log('[DEBUG] Form details loaded successfully');
        displayFormDetails(data.data);
        
        // Load form response trend
        loadFormResponseTrend(formId);
        
        // Load question statistics if available
        loadQuestionStatistics(formId);
    } else {
        console.error('[DEBUG] Failed to load form details:', data.message);
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
    
    console.log(`[DEBUG] Loading form response trend for form ID: ${formId}, timeframe: ${timeframe}, days: ${days}`);
    
    const data = await fetchAPI(`${API_BASE_URL}/forms/${formId}/responses/trend?timeframe=${timeframe}&days=${days}`);
    
    if (data.status) {
        console.log('[DEBUG] Form response trend loaded successfully');
        createFormResponseChart(data.data);
    } else {
        console.error('[DEBUG] Failed to load response trend:', data.message);
        showError('Failed to load response trend: ' + data.message);
    }
}

/**
 * Load question statistics for a form
 * @param {number} formId - Form ID to load questions for
 */
async function loadQuestionStatistics(formId) {
    console.log(`[DEBUG] Loading question statistics for form ID: ${formId}`);
    
    const data = await fetchAPI(`${API_BASE_URL}/forms/${formId}/questions`);
    
    if (data.status) {
        console.log('[DEBUG] Question statistics loaded successfully');
        displayQuestionStatistics(data.data);
    } else {
        console.error('[DEBUG] Failed to load question statistics:', data.message);
        showError('Failed to load question statistics: ' + data.message);
    }
}

/**
 * Load time analysis statistics
 */
async function loadTimeAnalysis() {
    console.log('[DEBUG] Loading time analysis statistics');
    
    const data = await fetchAPI(`${API_BASE_URL}/time-analysis`);
    
    if (data.status) {
        console.log('[DEBUG] Time analysis loaded successfully');
        createTimeAnalysisCharts(data.data);
    } else {
        console.error('[DEBUG] Failed to load time analysis:', data.message);
        showError('Failed to load time analysis: ' + data.message);
    }
}

/**
 * Create response trend chart
 * @param {Array} responseData - Response data by date
 */
function createResponseChart(responseData) {
    console.log('[DEBUG] Creating response chart with data:', responseData);
    
    const ctx = document.getElementById('responseChart').getContext('2d');
    
    // Extract data for the chart
    const labels = responseData.map(item => item.date);
    const counts = responseData.map(item => item.count);
    
    // Destroy existing chart if it exists
    if (responseChart) {
        responseChart.destroy();
    }
    
    // Create new chart
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
    console.log('[DEBUG] Creating form response chart with data:', data);
    
    const ctx = document.getElementById('formResponseChart').getContext('2d');
    
    if (!data.data || !Array.isArray(data.data)) {
        console.error('[DEBUG] Invalid data for form response chart');
        return;
    }
    
    // Extract data for the chart
    const labels = data.data.map(item => item.label);
    const counts = data.data.map(item => item.count);
    
    // Destroy existing chart if it exists
    if (formResponseChart) {
        formResponseChart.destroy();
    }
    
    // Create new chart
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
    console.log('[DEBUG] Creating time analysis charts with data:', data);
    
    // Time of day chart
    if (data.hourlyDistribution && Array.isArray(data.hourlyDistribution)) {
        const ctx = document.getElementById('timeOfDayChart').getContext('2d');
        
        // Extract data for the chart
        const labels = data.hourlyDistribution.map(item => item.hour);
        const counts = data.hourlyDistribution.map(item => item.count);
        
        // Destroy existing chart if it exists
        if (timeOfDayChart) {
            timeOfDayChart.destroy();
        }
        
        // Create new chart
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
    } else {
        console.warn('[DEBUG] Hourly distribution data is missing or not an array');
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
    console.log('[DEBUG] Displaying form details:', data);
    
    const formDetails = document.getElementById('form-details');
    
    if (!data || !data.form) {
        console.error('[DEBUG] Invalid form details data');
        formDetails.innerHTML = '<p class="text-danger">Error: Invalid form data received</p>';
        return;
    }
    
    const form = data.form;
    const totalResponses = data.totalResponses || 0;
    const completionRate = data.completionRate || 0;
    
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
    console.log('[DEBUG] Displaying question statistics:', data);
    
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
    console.log('[DEBUG] Updating top forms list:', formData);
    
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
    console.log('[DEBUG] Updating additional metrics:', metrics);
    
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
    console.log('[DEBUG] Resetting form details');
    
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
    console.error('[DEBUG] ERROR:', message);
    
    // You can implement a toast, alert, or other notification
    alert(message);
}

/**
 * Check if an element exists in the DOM
 * @param {string} id - Element ID to check
 * @returns {boolean} - Whether the element exists
 */
function elementExists(id) {
    return document.getElementById(id) !== null;
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    console.log('[DEBUG] Setting up event listeners');
    
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
 * Check authentication status
 * This function checks if the user is authenticated
 */
function checkAuthStatus() {
    console.log('[DEBUG] Checking authentication status');
    
    // Make a simple request to check if we're authenticated
    fetchAPI(`${API_BASE_URL}/dashboard`, { method: 'HEAD' })
        .then(response => {
            if (!response.status && response.code === 401) {
                console.error('[DEBUG] Not authenticated, redirecting to login');
                window.location.href = '/login.php';
            } else {
                console.log('[DEBUG] Authentication check passed');
            }
        })
        .catch(error => {
            console.error('[DEBUG] Error checking authentication status:', error);
        });
}

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Dashboard initialization started');
    
    // Check authentication first
    checkAuthStatus();
    
    // Load initial data
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
    
    console.log('[DEBUG] Dashboard initialization completed');
});
