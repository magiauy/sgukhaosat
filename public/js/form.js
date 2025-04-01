document.addEventListener("DOMContentLoaded", function () {
    fetchSurveyData().then(r =>
    console.log("Survey data fetched successfully"))
});




async function fetchSurveyData() {
    const response = await fetch(`${config.apiUrl}/admin/form/3`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${localStorage.getItem("token")}`,

        },
    });

    const data = await response.json();
    console.log(data['data'])
    renderSurvey(data['data'])

}

function renderSurvey(data) {
    let surveyHtml = `<h2 class="text-center fw-bold">${data.form.FName}</h2>`;

    data.questions.forEach(question => {
        surveyHtml += renderQuestion(question);
    });

    surveyHtml += `
        <div class="text-center mt-4">
            <button class="btn btn-success">Submit</button>
        </div>
    `;

    document.getElementById("survey-container").innerHTML = surveyHtml;
}

function renderQuestion(question) {
    let html = `<div class="mt-3"><h5>${question.QIndex}. ${question.QContent}</h5>`;

    if (question.QTypeID === "MULTIPLE_CHOICE") {
        html +=  patternQuestionMultipleChoice(question);
    } else if (question.QTypeID === "SHORT_TEXT") {
        html += `<input type="text" class="form-control" placeholder="Nhập câu trả lời">`;
    } else if (question.QTypeID === "LONG_TEXT") {
        html += `<textarea class="form-control" rows="3" placeholder="Nhập câu trả lời"></textarea>`;
    } else if (question.QTypeID === "CHECKBOX") {
        html += patternQuestionCheckBox(question);
    } else if (question.QTypeID === "GRID_MULTIPLE_CHOICE") {
        html += patternQuestionGridMultipleChoice(question);
    }

    html += `</div>`;
    return html;
}


function patternQuestionCheckBox(question) {
    return question.children.map(option => {
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="q${option.QID}" value="${option.QContent}">
                <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
            </div>
        `;
    }).join('');  // Kết hợp các chuỗi lại thành một
}

function patternQuestionMultipleChoice(question){
    return question.children.map(option => {
        return `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="q${question.QID}" id="q${option.QID}" value="${option.QContent}">
                    <label class="form-check-label" for="q${option.QID}">${option.QContent}</label>
                </div>
            `;
    }).join('');
}

function patternQuestionGridMultipleChoice(question) {
    let html = `<table class="table"><thead><tr><th scope="col"></th>`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_COLUMN") {;
            html += `<th scope="col">${option.QContent}</th>`;
        }
    });
    html += `</tr></thead><tbody>`;

    question.children.forEach(option => {
        if (option.QTypeID === "GRID_MC_ROW") {
            html += `<tr><th scope="row">${option.QContent}</th>`;
            question.children.forEach(colOption => {
                if (colOption.QTypeID === "GRID_MC_COLUMN") {
                    html += `
                        <td>
                            <input type="radio" name="q${option.QID}" id="q${colOption.QID}" value="${colOption.QContent}">
                        </td>
                    `;
                }
            });
            html += `</tr>`;
        }
    });

    html += `</tbody></table>`;
    return html;
}

function patternQuestionGridCheckBox(question) {
    let html = `<table class="table"><thead><tr><th scope="col"></th>`;
    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_COLUMN") {;
            html += `<th scope="col">${option.QContent}</th>`;
        }
    });
    html += `</tr></thead><tbody>`;

    question.children.forEach(option => {
        if (option.QTypeID === "GRID_CHECKBOX_ROW") {
            html += `<tr><th scope="row">${option.QContent}</th>`;
            question.children.forEach(colOption => {
                if (colOption.QTypeID === "GRID_CHECKBOX_COLUMN") {
                    html += `
                        <td>
                            <input type="checkbox" name="q${option.QID}" id="q${colOption.QID}" value="${colOption.QContent}">
                        </td>
                    `;
                }
            });
            html += `</tr>`;
        }
    });

    html += `</tbody></table>`;
    return html;
}