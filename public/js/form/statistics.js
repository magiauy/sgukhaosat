import { callApi} from "../apiService.js";

// Extract form ID from URL
const getFormId = () => {
    const match = window.location.pathname.match(/\/admin\/form\/(\d+)\/statistics/);
    return match ? match[1] : null;
};

const formId = getFormId();
let statisticsData = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (!formId) {
        showError("Không tìm thấy ID biểu mẫu");
        return;
    }

    // Load data from API
    await loadStatisticsData();
    await setUpHandlers();

    // Set up event listeners
    setupEventListeners();
});

async function setUpHandlers() {
    document.getElementById('export-pdf')?.addEventListener('click', handleExportPdf);
    document.getElementById('export-excel')?.addEventListener('click', handleExportExcel);
    document.getElementById('export-report')?.addEventListener('click', handleExportReport);
    document.getElementById('export-analysis')?.addEventListener('click', handleExportCsv);

}

async function loadStatisticsData() {
    try {
        // Show loading indicators
        document.getElementById('question-stats-container').innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
            </div>
        `;

        // Call API to get statistics data
        const result = await callApi(`/statistic/form/${formId}`, 'GET');
        if (!result.status) {
            showError(result.message || "Không thể tải dữ liệu thống kê");
            return;
        }

        statisticsData = result.data;

        // Update UI with the data
        document.getElementById('total-responses').textContent = statisticsData.totalResponses || 0;

        // Render question statistics
        renderQuestionStatistics(statisticsData.questions || []);

        // Populate user dropdown
        populateUserDropdown();

    } catch (error) {
        console.error("Error loading statistics data:", error);
        showError("Đã xảy ra lỗi khi tải dữ liệu thống kê");
    }
}

function renderQuestionStatistics(questions) {
    const container = document.getElementById('question-stats-container');
    container.innerHTML = ''; // Clear loading indicator

    if (questions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Không có dữ liệu thống kê</div>';
        return;
    }

    questions.forEach(question => {
        // Skip if no responses
        if (!question.responses || question.responses.length === 0) return;

        // Create container for this question
        const questionCard = document.createElement('div');
        questionCard.className = 'card p-3 mb-4';

        // Add question content
        const questionContent = document.createElement('h5');
        questionContent.textContent = question.QContent;
        questionCard.appendChild(questionContent);

        // Add question type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'badge bg-secondary mb-3';
        typeBadge.textContent = getQuestionTypeLabel(question.QTypeID);
        questionCard.appendChild(typeBadge);

        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.height = '300px';
        chartContainer.style.width = '100%';

        const canvas = document.createElement('canvas');
        canvas.id = `chart-${question.QID}`;
        chartContainer.appendChild(canvas);
        questionCard.appendChild(chartContainer);

        container.appendChild(questionCard);

        // Render chart based on question type
        renderChartByType(question, canvas.id);
    });
}

function getQuestionTypeLabel(typeId) {
    const types = {
        'MULTIPLE_CHOICE': 'Trắc nghiệm',
        'CHECKBOX': 'Hộp kiểm',
        'DROPDOWN': 'Danh sách thả xuống',
        'SHORT_TEXT': 'Văn bản ngắn',
        'LONG_TEXT': 'Văn bản dài',
        'SUBTITLE': 'Tiêu đề',
        'GRID_MULTIPLE_CHOICE': 'Lưới trắc nghiệm',
        'GRID_CHECKBOX': 'Lưới hộp kiểm'
    };

    return types[typeId] || typeId;
}

function renderChartByType(question, canvasId) {
const labels = question.responses.map(r => typeof r.answer === 'object' ? r.answer.AContent : r.answer);
const data = question.responses.map(r => r.count);
    const colors = generateColors(data.length);

    // Check if SHORT_TEXT with single character answers
    const isAllSingleChar = question.QTypeID === 'SHORT_TEXT' &&
        question.responses.every(r => r.answer.length === 1);

    let chartType, chartOptions = {};

    switch (question.QTypeID) {
        case 'DROPDOWN':
        case 'MULTIPLE_CHOICE':
            // Pie chart for multiple choice
            chartType = 'pie';
            chartOptions = {
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value * 100) / total);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            };
            break;

     case 'CHECKBOX':
         // Horizontal bar chart for checkbox and dropdown
         chartType = 'bar';
         chartOptions = {
             indexAxis: 'y',
             plugins: {
                 legend: { display: false },
                 tooltip: {
                     callbacks: {
                         label: function(context) {
                             return `${context.raw} phản hồi`;
                         }
                     }
                 }
             },
             scales: {
                 x: {
                     beginAtZero: true,
                     title: {
                         display: true,
                         text: 'Số lượng'
                     }
                 }
             }
         };
         break;

      case 'SHORT_TEXT':
      case 'LONG_TEXT':
          // Check if all responses have count = 1 (unique answers)
          const allUnique = question.responses.every(r => r.count === 1);

          if (allUnique) {
              // Don't create a chart, create a list view instead
              const canvas = document.getElementById(canvasId);
              const parent = canvas.parentNode;

              // Replace canvas with a list element
              const listElement = document.createElement('div');
              listElement.className = 'list-group';
              listElement.style.maxHeight = '300px';  // Match the chart height
              listElement.style.overflowY = 'auto';   // Enable vertical scrolling
              listElement.style.border = '1px solid #dee2e6';
              // Add each text response as a list item
              question.responses.forEach(r => {
                  const listItem = document.createElement('div');
                  listItem.className = 'list-group-item';
                  listItem.textContent = r.answer;
                  listElement.appendChild(listItem);
              });

              parent.removeChild(canvas);
              parent.appendChild(listElement);
              return; // Exit the function since we're not creating a chart
          } else if (isAllSingleChar) {
              // Pie chart for single character answers
              chartType = 'pie';
              chartOptions = {
                  plugins: {
                      legend: { position: 'right' },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((value * 100) / total);
                                  return `${label}: ${value} (${percentage}%)`;
                              }
                          }
                      }
                  }
              };
          } else {
              // Vertical bar chart for text answers with counts
              chartType = 'bar';
              chartOptions = {
                  plugins: { legend: { display: false } },
                  scales: {
                      y: {
                          beginAtZero: true,
                          title: {
                              display: true,
                              text: 'Số lượng'
                          }
                      }
                  }
              };
          }
          break;
       case 'GRID_MULTIPLE_CHOICE':
case 'GRID_CHECKBOX':
    // Stacked bar chart for grid questions
    chartType = 'bar';

    // Restructure data for grid visualization
    const gridData = {};
    question.responses.forEach(r => {
        const [row, col] = r.answer.split(' - ');
        if (!gridData[row]) gridData[row] = {};
        gridData[row][col] = r.count;
    });

    const rows = [...new Set(question.responses.map(r => r.answer.split(' - ')[0]))];
    const cols = [...new Set(question.responses.map(r => r.answer.split(' - ')[1]))];

    // Check if any label exceeds 4 characters
    const hasLongLabels = rows.some(row => row.length > 4);

    // Generate different colors for each column
    const columnColors = generateColors(cols.length);

    const datasets = cols.map((col, index) => ({
        label: col,
        data: rows.map(row => gridData[row]?.[col] || 0),
        backgroundColor: columnColors[index],
        borderColor: columnColors[index].replace('0.7', '1'),
        borderWidth: 1
    }));

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return `Hàng: ${rows[context[0].dataIndex]}`;
                    },
                    label: function(context) {
                        const label = context.dataset.label;
                        const value = context.raw;
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: false,
                title: {
                    display: true,
                    text: 'Hàng',
                    font: {
                        weight: 'bold'
                    }
                },
                ticks: {
                    display: !hasLongLabels // Hide all labels if any are too long
                }
            },
            y: {
                stacked: false,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Số lượng',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    };
            // Create chart with restructured data
            new Chart(document.getElementById(canvasId), {
                type: chartType,
                data: {
                    labels: rows,
                    datasets: datasets
                },
                options: chartOptions
            });
            return;
        default:
            chartType = 'bar';
            break;
    }

    // Create chart
    new Chart(document.getElementById(canvasId), {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: chartOptions
    });
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360; // Golden angle for color distribution
        colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    return colors;
}

async function populateUserDropdown(users) {

    const response = await callApi(`/admin/form/${formId}/responses/user`, 'GET');
    if (!response.status) {
        showError(response.message || "Không thể tải danh sách người dùng");
        return;
    }
    users = response.data || [];

    const dropdown = document.getElementById('user-response-select');
    if (!dropdown) return;

    // Clear existing options except the first default one
    dropdown.innerHTML = '<option selected disabled>Chọn người dùng...</option>';

    if (users.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = "Không có người dùng nào";
        dropdown.appendChild(option);
        //Test option

        return;
    }

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.RID;
        option.textContent = `${user.fullName} (${user.email})`;
        dropdown.appendChild(option);
    });
}

// async function loadUserResponses(userId) {
//     try {
//         const container = document.getElementById('individual-response-container');
//         container.innerHTML = `
//             <div class="text-center my-5">
//                 <div class="spinner-border text-primary" role="status">
//                     <span class="visually-hidden">Đang tải...</span>
//                 </div>
//             </div>
//         `;
//
//         const result = await callApi(`/admin/form/${formId}/responses/${userId}`, 'GET');
//
//         if (!result.status) {
//             container.innerHTML = `<div class="alert alert-danger">${result.message || "Không thể tải câu trả lời"}</div>`;
//             return;
//         }
//
//         const responses = result.data;
//
//         if (!responses || responses.length === 0) {
//             container.innerHTML = '<div class="alert alert-info">Không có câu trả lời nào</div>';
//             return;
//         }
//
//         container.innerHTML = '';
//         const responseList = document.createElement('div');
//         responseList.className = 'list-group';
//
//         responses.forEach(response => {
//             const item = document.createElement('div');
//             item.className = 'list-group-item';
//
//             const question = document.createElement('h6');
//             question.textContent = response.question;
//             item.appendChild(question);
//
//             const answer = document.createElement('p');
//             answer.className = 'mb-1';
//             answer.textContent = response.answer || '[Không có câu trả lời]';
//             item.appendChild(answer);
//
//             responseList.appendChild(item);
//         });
//
//         container.appendChild(responseList);
//
//     } catch (error) {
//         console.error("Error loading user responses:", error);
//         document.getElementById('individual-response-container').innerHTML =
//             `<div class="alert alert-danger">Đã xảy ra lỗi khi tải câu trả lời</div>`;
//     }
// }

async function deleteUserResponse(userId) {
    try {
        const result = await Swal.fire({
            title: 'Xóa câu trả lời',
            text: "Bạn có chắc chắn muốn xóa câu trả lời này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        // Show loading
        const deleteBtn = document.getElementById('delete-response');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...';

        // Call API to delete response
        const apiResult = await callApi(`/admin/form/${formId}/responses/${userId}`, 'DELETE');

        if (!apiResult.status) {
            showError(apiResult.message || "Không thể xóa câu trả lời");
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = " Xoá";
            return;
        }

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Đã xóa câu trả lời thành công',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        // Reset UI
        document.getElementById('individual-response-container').innerHTML =
            '<p class="text-muted">Vui lòng chọn người dùng để xem câu trả lời</p>';

        // Reload statistics data to update counts
        await loadStatisticsData();

        // Reset dropdown
        document.getElementById('user-response-select').value = 'Chọn người dùng...';
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = originalText;

    } catch (error) {
        console.error("Error deleting user response:", error);
        showError("Đã xảy ra lỗi khi xóa câu trả lời");

        const deleteBtn = document.getElementById('delete-response');
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Xóa câu trả lời đã chọn';
    }
}

async function exportStatistics() {
    try {
        // Show loading
        const exportBtn = document.getElementById('export-all');
        const originalText = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xuất...';

        // Call API to export data
        const response = await fetch(`${config.Url}/admin/form/${formId}/statistics/export`, {
            method: 'GET',
            headers: {
                'Accept': 'application/octet-stream'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể xuất dữ liệu');
        }

        // Get filename from header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'statistics-export.xlsx';

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        // Convert response to blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        // Reset button
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;

    } catch (error) {
        console.error("Error exporting statistics:", error);
        showError("Đã xảy ra lỗi khi xuất dữ liệu");

        const exportBtn = document.getElementById('export-all');
        exportBtn.disabled = false;
        exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Xuất tất cả dữ liệu';
    }
}

function setupEventListeners() {
    // User selection dropdown handler
    const userSelect = document.getElementById('user-response-select');
    if (userSelect) {
        userSelect.addEventListener('change', async function () {
            if (this.value && this.value !== 'disabled') {
                document.getElementById('delete-response').removeAttribute('disabled');
                await loadUserResponses(this.value);
            } else {
                document.getElementById('delete-response').setAttribute('disabled', 'disabled');
                document.getElementById('individual-response-container').innerHTML =
                    '<p class="text-muted">Vui lòng chọn người dùng để xem câu trả lời</p>';
            }
        });
    }

    // Delete button handler
    const deleteBtn = document.getElementById('delete-response');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const userId = document.getElementById('user-response-select').value;
            if (userId) {
                deleteUserResponse(userId);
            }
        });
    }

    // Export button
    const exportBtn = document.getElementById('export-all');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportStatistics();
        });
    }
}
function handleExportPdf(event) {
    // Import the ExportPdfModal dynamically
    // import('../modal/ExportPdfModal.js')
    //     .then(async module => {
    //         const ExportPdfModal = module.default;
    //         const modal = new ExportPdfModal({});
    //         await modal.open(formId, null);
    //     })
    //     .catch(error => {
    //         console.error("Error loading ExportPdfModal:", error);
    //         showError("Không thể tải modal xuất PDF");
    //     });
    showError("Chức năng đang được phát triển, vui lòng thử lại sau");
}

/**
 * Handler for Excel export button click
 * @param {Event} event - Click event
 */
function handleExportExcel(event) {
    // TODO: Implement Excel export logic
    // 1. Get form ID from current URL
    // 2. Show loading indicator
    // 3. Call API endpoint for Excel generation
    // 4. Handle response and trigger download
    // 5. Show success/error notification
    console.log('Export to Excel clicked');
    showError("Chức năng đang được phát triển, vui lòng thử lại sau");

}

/**
 * Handler for Report export button click
 * @param {Event} event - Click event
 */
function handleExportReport(event) {
    // TODO: Implement Report export logic
    // 1. Get form ID from current URL
    // 2. Show loading indicator
    // 3. Call API endpoint for Report generation
    // 4. Handle response and trigger download
    // 5. Show success/error notification
    console.log('Export to Report clicked');
    showError("Chức năng đang được phát triển, vui lòng thử lại sau");

}

/**
 * Handler for CSV export button click
 * @param {Event} event - Click event
 */
function handleExportCsv(event) {
    // TODO: Implement CSV export logic
    // 1. Get form ID from current URL
    // 2. Show loading indicator
    // 3. Call API endpoint for CSV generation
    // 4. Handle response and trigger download
    // 5. Show success/error notification
    console.log('Export to CSV clicked');
    showError("Chức năng đang được phát triển, vui lòng thử lại sau");

}

/**
 * Helper function to extract form ID from URL
 * @returns {string|null} Form ID if found, null otherwise
 */
function getFormIdFromUrl() {
    // TODO: Extract and return form ID from current URL
    // Example: /admin/form/123/edit -> return "123"
    return null;
}

/**
 * Helper function to show loading state
 * @param {string} exportType - Type of export being performed
 */
function showExportLoading(exportType) {
    // TODO: Implement loading indicator for export process
}

/**
 * Helper function to handle file download from response
 * @param {Blob} blob - File blob from API response
 * @param {string} filename - Suggested filename for download
 */
function triggerFileDownload(blob, filename) {
    // TODO: Implement file download logic
}
async function loadUserResponses(resultId) {
    try {
        const container = document.getElementById('individual-response-container');
        // Show loading spinner
        container.innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
            </div>
        `;

        // Fetch user responses with API call
        const result = await callApi(`/form/${formId}/responses/${resultId}`, 'GET');
        if (!result.status) {
            container.innerHTML = `<div class="alert alert-danger">${result.message || "Không thể tải câu trả lời"}</div>`;
            return;
        }

        // Process the data
        const formData = result.data.form;
        const answers = result.data.answers;

        if (!formData || !answers || answers.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Không có dữ liệu câu trả lời</div>';
            return;
        }

        // Create form container
        const form = document.createElement('form');
        form.id = 'user-response-form';
        form.id = 'user-response-form';
        form.className = 'needs-validation user-response-preview';

        // Add form header with user info
        const userName = answers.find(a => a.QContent === "Họ và tên")?.AContent || "Không xác định";
        const formHeader = document.createElement('div');
        formHeader.className = 'text-center mb-4';
        formHeader.innerHTML = `
            <h2 class="fw-bold text-primary">${formData.FName || 'Khảo sát'}</h2>
            <p class="text-muted">Người trả lời: ${userName}</p>
            <hr>
        `;
        form.appendChild(formHeader);

        // Group questions by their parent ID to reconstruct grid questions
        const questionsByParent = {};
        // Extract grid rows and columns directly from question's children array
        formData.questions.forEach(q => {
            if (q.QTypeID === 'GRID_MULTIPLE_CHOICE' || q.QTypeID === 'GRID_CHECKBOX') {
                // Initialize grid structure
                questionsByParent[q.QID] = {
                    id: q.QID,
                    content: q.QContent,
                    type: q.QTypeID,
                    rows: [],
                    columns: []
                };

                // Extract rows and columns directly from children
                if (q.children && Array.isArray(q.children)) {
                    q.children.forEach(child => {
                        if (child.QTypeID === 'GRID_MC_ROW' || child.QTypeID === 'GRID_CHECKBOX_ROW') {
                            questionsByParent[q.QID].rows.push({
                                id: child.QID,
                                content: child.QContent
                            });
                        } else if (child.QTypeID === 'GRID_MC_COLUMN' || child.QTypeID === 'GRID_CHECKBOX_COLUMN') {
                            questionsByParent[q.QID].columns.push({
                                id: child.QID,
                                content: child.QContent
                            });
                        }
                    });
                }
            }
        });


        // Process and render questions
        let questionIndex = 0;
        for (const question of formData.questions) {
            // Skip child questions (grid rows/columns) as they'll be handled within their parent
            if (question.QParent !== null && 
               (question.QTypeID === 'GRID_MC_ROW' || 
                question.QTypeID === 'GRID_MC_COLUMN' ||
                question.QTypeID === 'GRID_CB_ROW' ||
                question.QTypeID === 'GRID_CB_COLUMN' ||
                question.QTypeID === 'DROPDOWN_OPTION' ||
                question.QTypeID === 'DESCRIPTION')) {
                continue;
            }
            
            // Skip SUBTITLE and DESCRIPTION types
            if (question.QTypeID === 'SUBTITLE' || question.QTypeID === 'DESCRIPTION') {
                // Only render subtitle (not as a question)
                const subtitleDiv = document.createElement('div');
                subtitleDiv.className = 'mb-4';
                const titleElement = document.createElement('h5');
                titleElement.className = 'text-primary';
                titleElement.innerHTML = formatContentLineBreaks(question.QContent);
                subtitleDiv.appendChild(titleElement);
                form.appendChild(subtitleDiv);
                continue;
            }
            
            questionIndex++;

            // Create question container
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mb-4 question-container';

            // Add question title
            const questionTitle = document.createElement('h5');
            questionTitle.className = 'mb-3';
            questionTitle.textContent = `${questionIndex}. ${question.QContent}`;
            if (question.isDeleted === 1) {
                const deletedLabel = document.createElement('span');
                deletedLabel.textContent = ' đã xoá';
                deletedLabel.className = 'ms-2 badge bg-danger rounded-pill';
                questionTitle.appendChild(deletedLabel);
            }
            questionDiv.appendChild(questionTitle);

            // Find answer for this question
            const answer = answers.find(a => a.QID === question.QID.toString());
            
            // Render different question types with answers
            switch (question.QTypeID) {
                case 'SHORT_TEXT':
                case 'LONG_TEXT':
                    questionDiv.appendChild(renderUserTextAnswer(question, answer));
                    break;
                case 'DROPDOWN':
                    questionDiv.appendChild(renderUserDropdown(question, answer));
                    break;
                case 'MULTIPLE_CHOICE':
                    questionDiv.appendChild(renderUserMC(question, answer));
                    break;
                case 'CHECKBOX':
                    questionDiv.appendChild(renderUserCheckbox(question, answer));
                    break;
                case 'GRID_MULTIPLE_CHOICE':
                    questionDiv.appendChild(renderUserGridMC(question, answers, questionsByParent[question.QID]));
                    break;
                case 'GRID_CHECKBOX':
                    questionDiv.appendChild(renderUserGridCB(question, answers, questionsByParent[question.QID]));
                    break;
                default:
                    questionDiv.innerHTML += `<div class="alert alert-light">Loại câu hỏi ${question.QTypeID} chưa được hỗ trợ</div>`;
            }

            form.appendChild(questionDiv);
        }

        container.innerHTML = '';
        container.appendChild(form);

        // Enable delete button
        document.getElementById('delete-response').removeAttribute('disabled');

    } catch (error) {
        console.error("Error loading user responses:", error);
        document.getElementById('individual-response-container').innerHTML =
            `<div class="alert alert-danger">Đã xảy ra lỗi khi tải câu trả lời: ${error.message}</div>`;
    }
}
function formatContentLineBreaks(text) {
    if (!text) return '';

    // First handle explicit \n characters (from plain text)
    text = text.replace(/\n/g, '<br>');

    // Also handle consecutive <div> elements that should be displayed with line breaks
    text = text.replace(/<\/div><div>/g, '</div><br><div>');

    return text;
}
function renderUserMC(question, answer) {
    const container = document.createElement('div');

    // Get the selected option value
    let userSelection = answer ? answer.AContent : '';

    // Get multiple choice options
    const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION") || [];
    const otherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

    // Check if the answer is a custom "other" answer
    let isCustomAnswer = false;
    let customText = '';

    // If the answer exists but doesn't match any predefined options, it's likely a custom answer
    if (userSelection && options.every(option => option.QContent !== userSelection)) {
        isCustomAnswer = true;
        customText = userSelection;
    }

    // Render the standard options
    options.forEach((option, index) => {
        const isSelected = userSelection === option.QContent;

        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check';
        optionDiv.innerHTML = `
            <input class="form-check-input" type="radio" 
                   id="user_mc_${question.QID}_${index}"
                   ${isSelected ? 'checked' : ''} disabled>
            <label class="form-check-label" for="user_mc_${question.QID}_${index}">
                ${option.QContent}
            </label>
        `;

        container.appendChild(optionDiv);
    });

    // Render the "other" option if it exists
    if (otherOption) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'form-check d-flex align-items-center mt-2';
        otherDiv.innerHTML = `
            <input class="form-check-input" type="radio" 
                   id="user_mc_${question.QID}_other"
                   ${isCustomAnswer ? 'checked' : ''} disabled>
            <label class="form-check-label ms-2" for="user_mc_${question.QID}_other">
                ${otherOption.QContent}
            </label>
            ${isCustomAnswer ? `
            <input type="text" class="form-control ms-2" 
                   value="${customText}" 
                   style="max-width: 300px;" disabled>
            ` : ''}
        `;

        container.appendChild(otherDiv);
    }

    return container;
}
// Helper functions for rendering different question types
function renderUserTextAnswer(question, answer) {
    const container = document.createElement('div');
    const value = answer ? answer.AContent : '';
    
    if (question.QTypeID === 'LONG_TEXT') {
        container.innerHTML = `<textarea class="form-control mt-2" rows="3" disabled>${value}</textarea>`;
    } else {
        container.innerHTML = `<input type="text" class="form-control mt-2" value="${value}" disabled>`;
    }
    return container;
}

function renderUserDropdown(question, answer) {
    const container = document.createElement('div');
    const userSelectedOption = answer ? answer.AContent : '';
    
    // Get dropdown options
    const options = question.children || [];
    
    const selectElement = document.createElement('select');
    selectElement.className = 'form-select mt-2';
    selectElement.disabled = true;
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Chọn --';
    if (!userSelectedOption) emptyOption.selected = true;
    selectElement.appendChild(emptyOption);
    
    // Add all options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.QContent;
        optionElement.textContent = option.QContent;
        if (userSelectedOption === option.QContent) {
            optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
    });
    
    container.appendChild(selectElement);
    return container;
}

function renderUserCheckbox(question, answer) {
    const container = document.createElement('div');
    let userSelectedOptions = [];
    let customValues = [];

    if (answer && answer.AContent) {
        try {
            // Try to parse as JSON first
            const parsedContent = JSON.parse(answer.AContent);
            // Check if it's an array directly or has an array property
            if (Array.isArray(parsedContent)) {
                userSelectedOptions = parsedContent;
            } else if (parsedContent.columns && Array.isArray(parsedContent.columns)) {
                userSelectedOptions = parsedContent.columns;
            }
        } catch (e) {
            // Fallback to string split if not valid JSON
            userSelectedOptions = answer.AContent.split(',').map(a => a.trim());
        }
    }

    // Get checkbox options
    const options = question.children.filter(option => option.QTypeID !== "ANOTHER_OPTION") || [];
    const otherOption = question.children.find(option => option.QTypeID === "ANOTHER_OPTION");

    // Find custom values (values not matching any standard option)
    if (userSelectedOptions.length > 0) {
        const standardOptions = options.map(opt => opt.QContent);
        customValues = userSelectedOptions.filter(val => !standardOptions.includes(val));
    }

    // Render standard options
    options.forEach((option, index) => {
        const isSelected = userSelectedOptions.includes(option.QContent);

        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check mt-2';
        optionDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" id="user_checkbox_${question.QID}_${index}" 
                   ${isSelected ? 'checked' : ''} disabled>
            <label class="form-check-label" for="user_checkbox_${question.QID}_${index}">
                ${option.QContent}
            </label>
        `;

        container.appendChild(optionDiv);
    });

    // Render the "other" option if it exists
    if (otherOption && customValues.length > 0) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'form-check d-flex align-items-center mt-2';
        otherDiv.innerHTML = `
            <input class="form-check-input" type="checkbox"
                   id="user_checkbox_${question.QID}_other"
                   checked disabled>
            <label class="form-check-label ms-2" for="user_checkbox_${question.QID}_other">
                ${otherOption.QContent}
            </label>
            <input type="text" class="form-control ms-2"
                   value="${customValues.join(', ')}"
                   style="max-width: 300px;" disabled>
        `;

        container.appendChild(otherDiv);
    } else if (otherOption) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'form-check d-flex align-items-center mt-2';
        otherDiv.innerHTML = `
            <input class="form-check-input" type="checkbox"
                   id="user_checkbox_${question.QID}_other"
                   disabled>
            <label class="form-check-label ms-2" for="user_checkbox_${question.QID}_other">
                ${otherOption.QContent}
            </label>
        `;

        container.appendChild(otherDiv);
    }

    return container;
}
function renderUserGridCB(question, allAnswers, gridData) {
    const container = document.createElement('div');
    console.log('Question:', gridData);

    if (!gridData || !gridData.rows || !gridData.columns) {
        container.innerHTML = '<div class="alert alert-warning">Dữ liệu câu hỏi lưới không đầy đủ</div>';
        return container;
    }

    // Find all answers for this grid's rows
    const gridAnswers = allAnswers.filter(answer => {
        return gridData.rows.some(row => row.id.toString() === answer.QID);
    });

    // Create a map of selected values
    const userSelections = {};
    gridAnswers.forEach(answer => {
        try {
            // Parse JSON content
            if (answer.AContent) {
                const parsedContent = JSON.parse(answer.AContent);
                userSelections[answer.QID] = {
                    row: parsedContent.row,
                    columns: parsedContent.columns || [] // Array of selected columns
                };
            }
        } catch (e) {
            console.error('Error parsing grid answer:', e);
        }
    });

    // Create grid table
    container.innerHTML = `
        <div class="table-responsive mt-3">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="bg-light"></th>
                        ${gridData.columns.map(column =>
                            `<th scope="col" class="text-center">${column.content}</th>`
                        ).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${gridData.rows.map(row => {
                        // Find answer for this row
                        const rowId = row.id.toString();
                        const rowAnswer = userSelections[rowId];
                        const selectedColumns = rowAnswer ? rowAnswer.columns : [];

                        return `
                            <tr>
                                <th scope="row" class="align-middle">${row.content}</th>
                                ${gridData.columns.map(column => {
                                    const isSelected = selectedColumns.includes(column.content);
                                    return `
                                        <td class="text-center">
                                            <input type="checkbox" class="form-check-input"
                                                ${isSelected ? 'checked' : ''} disabled>
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    return container;
}
function renderUserGridMC(question, allAnswers, gridData) {
    const container = document.createElement('div');
    
    if (!gridData || !gridData.rows || !gridData.columns) {
        container.innerHTML = '<div class="alert alert-warning">Dữ liệu câu hỏi lưới không đầy đủ</div>';
        return container;
    }
    
    // Find all answers for this grid's rows
    const gridAnswers = allAnswers.filter(answer => {
        return gridData.rows.some(row => row.id.toString() === answer.QID);
    });
    
    // Create a map of selected values
    const userSelections = {};
    gridAnswers.forEach(answer => {
        try {
            // Parse JSON content
            if (answer.AContent) {
                const parsedContent = JSON.parse(answer.AContent);
                userSelections[answer.QID] = {
                    row: parsedContent.row,
                    column: parsedContent.column
                };
            }
        } catch (e) {
            console.error('Error parsing grid answer:', e);
        }
    });
    
    // Create grid table
    container.innerHTML = `
        <div class="table-responsive mt-3">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="bg-light"></th>
                        ${gridData.columns.map(column => 
                            `<th scope="col" class="text-center">${column.content}</th>`
                        ).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${gridData.rows.map(row => {
                        // Find answer for this row
                        const rowId = row.id.toString();
                        const rowAnswer = userSelections[rowId];
                        const selectedColumn = rowAnswer ? rowAnswer.column : null;
                        
                        return `
                            <tr>
                                <th scope="row" class="align-middle">${row.content}</th>
                                ${gridData.columns.map(column => {
                                    const isSelected = selectedColumn === column.content;
                                    const inputType = question.QTypeID === 'GRID_MULTIPLE_CHOICE' ? 'radio' : 'checkbox';
                                    
                                    return `
                                        <td class="text-center">
                                            <input type="${inputType}" class="form-check-input" 
                                                ${isSelected ? 'checked' : ''} disabled>
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    return container;
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}