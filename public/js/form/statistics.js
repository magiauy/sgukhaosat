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

    // Set up event listeners
    setupEventListeners();
});

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
        // console.log(test);
        //
        // const result = {
        //     "status": true,
        //     "data": {
        //         "formId": "123",
        //         "formTitle": "Khảo sát mức độ hài lòng",
        //         "totalResponses": 150,
        //         "questions": [
        //             {
        //                 "QID": "1",
        //                 "QTypeID": "MULTI_CHOICE",
        //                 "QContent": "Bạn đánh giá chất lượng dịch vụ như thế nào?",
        //                 "responses": [
        //                     { "answer": "Rất tốt", "count": 45 },
        //                     { "answer": "Tốt", "count": 65 },
        //                     { "answer": "Bình thường", "count": 25 },
        //                     { "answer": "Cần cải thiện", "count": 15 }
        //                 ]
        //             },
        //             {
        //                 "QID": "2",
        //                 "QTypeID": "CHECKBOX",
        //                 "QContent": "Bạn thường sử dụng dịch vụ nào? (có thể chọn nhiều)",
        //                 "responses": [
        //                     { "answer": "Dịch vụ A", "count": 85 },
        //                     { "answer": "Dịch vụ B", "count": 92 },
        //                     { "answer": "Dịch vụ C", "count": 43 },
        //                     { "answer": "Dịch vụ D", "count": 67 }
        //                 ]
        //             },
        //             {
        //                 "QID": "3",
        //                 "QTypeID": "DROPDOWN",
        //                 "QContent": "Bạn biết đến dịch vụ qua kênh nào?",
        //                 "responses": [
        //                     { "answer": "Mạng xã hội", "count": 78 },
        //                     { "answer": "Bạn bè giới thiệu", "count": 45 },
        //                     { "answer": "Quảng cáo", "count": 27 }
        //                 ]
        //             },
        //             {
        //                 "QID": "4",
        //                 "QTypeID": "SHORT_TEXT",
        //                 "QContent": "Đánh giá mức độ hài lòng (1-5)",
        //                 "responses": [
        //                     { "answer": "1", "count": 5 },
        //                     { "answer": "2", "count": 15 },
        //                     { "answer": "3", "count": 35 },
        //                     { "answer": "4", "count": 55 },
        //                     { "answer": "5", "count": 40 }
        //                 ]
        //             },
        //             {
        //                 "QID": "5",
        //                 "QTypeID": "SHORT_TEXT",
        //                 "QContent": "Nhận xét thêm",
        //                 "responses": [
        //                     { "answer": "Dịch vụ tốt", "count": 25 },
        //                     { "answer": "Giá cả hợp lý", "count": 18 },
        //                     { "answer": "Cần cải thiện thái độ", "count": 12 },
        //                     { "answer": "Thời gian chờ hơi lâu", "count": 15 }
        //                 ]
        //             },
        //             {
        //                 "QID": "6",
        //                 "QTypeID": "GRID_MC",
        //                 "QContent": "Đánh giá các khía cạnh dịch vụ",
        //                 "responses": [
        //                     { "answer": "Chất lượng - Rất tốt", "count": 35 },
        //                     { "answer": "Chất lượng - Tốt", "count": 45 },
        //                     { "answer": "Chất lượng - Trung bình", "count": 20 },
        //                     { "answer": "Giá cả - Rất tốt", "count": 25 },
        //                     { "answer": "Giá cả - Tốt", "count": 55 },
        //                     { "answer": "Giá cả - Trung bình", "count": 30 },
        //                     { "answer": "Phục vụ - Rất tốt", "count": 40 },
        //                     { "answer": "Phục vụ - Tốt", "count": 35 },
        //                     { "answer": "Phục vụ - Trung bình", "count": 25 },
        //                     { "answer": "Thời gian - Rất tốt", "count": 50 },
        //                     { "answer": "Thời gian - Tốt", "count": 40 },
        //                     { "answer": "Thời gian - Trung bình", "count": 20 },
        //                     //Không gian
        //                     { "answer": "Không gian - Rất tốt", "count": 30 },
        //                     { "answer": "Không gian - Tốt", "count": 25 },
        //                     { "answer": "Không gian - Trung bình", "count": 15 },
        //                     { "answer": "Không gian - Kém", "count": 10 },
        //                     { "answer": "Mức độ hài lòng về chất lượng tư vấn của nhân viên - Rất hài lòng", "count": 35 },
        //                     { "answer": "Mức độ hài lòng về chất lượng tư vấn của nhân viên - Hài lòng", "count": 45 },
        //                     { "answer": "Mức độ hài lòng về chất lượng tư vấn của nhân viên - Bình thường", "count": 20 },
        //                     { "answer": "Mức độ hài lòng về thời gian chờ đợi và xử lý thủ tục - Rất hài lòng", "count": 30 },
        //                     { "answer": "Mức độ hài lòng về thời gian chờ đợi và xử lý thủ tục - Hài lòng", "count": 50 },
        //                     { "answer": "Mức độ hài lòng về thời gian chờ đợi và xử lý thủ tục - Bình thường", "count": 25 },
        //                     { "answer": "Mức độ hài lòng về cơ sở vật chất và không gian làm việc - Rất hài lòng", "count": 40 },
        //                     { "answer": "Mức độ hài lòng về cơ sở vật chất và không gian làm việc - Hài lòng", "count": 35 },
        //                     { "answer": "Mức độ hài lòng về cơ sở vật chất và không gian làm việc - Bình thường", "count": 15 }
        //                     //Một đoạn text dài
        //
        //
        //                 ]
        //             },
        //             {
        //                 "QID": "7",
        //                 "QTypeID": "GRID_CB",
        //                 "QContent": "Chọn các dịch vụ bạn đã sử dụng ở mỗi chi nhánh",
        //                 "responses": [
        //                     { "answer": "Chi nhánh A - Dịch vụ 1", "count": 45 },
        //                     { "answer": "Chi nhánh A - Dịch vụ 2", "count": 35 },
        //                     { "answer": "Chi nhánh B - Dịch vụ 1", "count": 55 },
        //                     { "answer": "Chi nhánh B - Dịch vụ 2", "count": 40 },
        //                     { "answer": "Chi nhánh C - Dịch vụ 1", "count": 30 },
        //                     { "answer": "Chi nhánh C - Dịch vụ 2", "count": 25 }
        //                 ]
        //             }
        //         ],
        //         "users": [
        //             {
        //                 "id": "user1",
        //                 "name": "Nguyễn Văn A",
        //                 "email": "nguyenvana@example.com",
        //                 "responseDate": "2024-03-15T08:30:00Z"
        //             },
        //             {
        //                 "id": "user2",
        //                 "name": "Trần Thị B",
        //                 "email": "tranthib@example.com",
        //                 "responseDate": "2024-03-15T09:45:00Z"
        //             }
        //         ]
        //     },
        //     "message": "Lấy dữ liệu thống kê thành công"
        // }
        // console.log(result);
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
        populateUserDropdown(statisticsData.users || []);

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

              // Add each text response as a list item
              question.responses.forEach(r => {
                  const listItem = document.createElement('div');
                  listItem.className = 'list-group-item';
                  listItem.textContent = r.answer.AContent;
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
                        stacked: false,  // Changed to false to show columns side by side
                        title: {
                            display: true,
                            text: 'Hàng',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        stacked: false,  // Changed to false to show columns side by side
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

function populateUserDropdown(users) {
    const dropdown = document.getElementById('user-response-select');
    if (!dropdown) return;

    // Clear existing options except the first default one
    dropdown.innerHTML = '<option selected disabled>Chọn người dùng...</option>';

    if (users.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = "Không có người dùng nào";
        dropdown.appendChild(option);
        return;
    }

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        dropdown.appendChild(option);
    });
}

async function loadUserResponses(userId) {
    try {
        const container = document.getElementById('individual-response-container');
        container.innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
            </div>
        `;

        const result = await callApi(`/admin/form/${formId}/responses/${userId}`, 'GET');

        if (!result.status) {
            container.innerHTML = `<div class="alert alert-danger">${result.message || "Không thể tải câu trả lời"}</div>`;
            return;
        }

        const responses = result.data;

        if (!responses || responses.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Không có câu trả lời nào</div>';
            return;
        }

        container.innerHTML = '';
        const responseList = document.createElement('div');
        responseList.className = 'list-group';

        responses.forEach(response => {
            const item = document.createElement('div');
            item.className = 'list-group-item';

            const question = document.createElement('h6');
            question.textContent = response.question;
            item.appendChild(question);

            const answer = document.createElement('p');
            answer.className = 'mb-1';
            answer.textContent = response.answer || '[Không có câu trả lời]';
            item.appendChild(answer);

            responseList.appendChild(item);
        });

        container.appendChild(responseList);

    } catch (error) {
        console.error("Error loading user responses:", error);
        document.getElementById('individual-response-container').innerHTML =
            `<div class="alert alert-danger">Đã xảy ra lỗi khi tải câu trả lời</div>`;
    }
}

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
            deleteBtn.innerHTML = originalText;
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
        userSelect.addEventListener('change', function() {
            if (this.value && this.value !== 'disabled') {
                document.getElementById('delete-response').removeAttribute('disabled');
                loadUserResponses(this.value);
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