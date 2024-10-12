document.getElementById('addQuestionBtn').addEventListener('click', function () {
    const questionsContainer = document.getElementById('questionsContainer');

    // Create a new question block
    const questionBlock = document.createElement('div');
    questionBlock.classList.add('question-block');
    questionBlock.setAttribute('draggable', 'true'); // Make it draggable

    // Create question label input
    const questionLabelInput = document.createElement('input');
    questionLabelInput.type = 'text';
    questionLabelInput.placeholder = 'Enter your question';
    questionBlock.appendChild(questionLabelInput);

    // Create description input
    const questionDescriptionInput = document.createElement('input');
    questionDescriptionInput.type = 'text';
    questionDescriptionInput.placeholder = 'Enter question description/hint (optional)';
    questionBlock.appendChild(questionDescriptionInput);

    // Create dropdown for question type
    const questionTypeSelect = document.createElement('select');
    questionTypeSelect.innerHTML = `
        <option value="">Select Question Type</option>
        <option value="text">Text</option>
        <option value="multiple">Multiple Choice</option>
        <option value="date">Date</option>
        <option value="file">File Upload</option>
        <option value="likert">Likert Scale</option>
    `;
    questionBlock.appendChild(questionTypeSelect);

    // Container for additional configuration
    const configContainer = document.createElement('div');
    questionBlock.appendChild(configContainer);

    // Add change event listener for question type
    questionTypeSelect.addEventListener('change', function () {
        // Clear previous configurations
        configContainer.innerHTML = '';
        const questionType = this.value;

        if (questionType === 'multiple') {
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('options-container');

            // Add initial options
            for (let i = 1; i <= 2; i++) {
                const optionInput = document.createElement('input');
                optionInput.type = 'text';
                optionInput.placeholder = `Option ${i}`;
                optionInput.classList.add('multiple-option');
                optionsContainer.appendChild(optionInput);
            }

            // Add button to add new options
            const addOptionBtn = document.createElement('button');
            addOptionBtn.textContent = 'Add Option';
            addOptionBtn.type = 'button';
            optionsContainer.appendChild(addOptionBtn);

            // Add event listener to add option
            addOptionBtn.addEventListener('click', function () {
                const newOptionInput = document.createElement('input');
                newOptionInput.type = 'text';
                newOptionInput.placeholder = `Option ${optionsContainer.children.length + 1}`;
                newOptionInput.classList.add('multiple-option');
                optionsContainer.insertBefore(newOptionInput, addOptionBtn);
            });

            configContainer.appendChild(optionsContainer);
        } else if (questionType === 'date') {
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            configContainer.appendChild(dateInput);
        } else if (questionType === 'file') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            configContainer.appendChild(fileInput);
        } else if (questionType === 'likert') {
            const likertContainer = document.createElement('div');
            likertContainer.classList.add('likert-scale');

            const likertOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
            likertOptions.forEach(option => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="${questionLabelInput.value}" value="${option}"> ${option}`;
                likertContainer.appendChild(label);
            });
            configContainer.appendChild(likertContainer);
        }

        // Update preview section
        updatePreview();
    });

    // Add drag-and-drop event listeners
    questionBlock.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', questionBlock.innerHTML);
        e.dataTransfer.setData('questionBlock', questionsContainer.children.length); // Store the index
        questionBlock.classList.add('dragging'); // Add class for visual effect
    });

    questionBlock.addEventListener('dragend', () => {
        questionBlock.classList.remove('dragging'); // Remove class for visual effect
    });

    questionsContainer.appendChild(questionBlock);

    // Update the preview every time a new question is added
    updatePreview();

    // Add the drag over and drop event listeners for the container
    questionsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(questionsContainer, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            questionsContainer.appendChild(dragging);
        } else {
            questionsContainer.insertBefore(dragging, afterElement);
        }
        // Call updatePreview after rearranging
        updatePreview();
    });
});

// Function to update the preview
function updatePreview() {
    const previewContainer = document.getElementById('surveyPreview');
    previewContainer.innerHTML = ''; // Clear existing preview

    const questionBlocks = document.querySelectorAll('.question-block');

    questionBlocks.forEach(block => {
        const questionLabel = block.querySelector('input[type="text"]').value;
        const questionDescription = block.querySelector('input[type="text"]:nth-of-type(2)').value; // Get the description
        const questionType = block.querySelector('select').value;
        let optionsHtml = '';

        if (questionType === 'multiple') {
            const options = block.querySelectorAll('.multiple-option');
            options.forEach(option => {
                if (option.value) {
                    optionsHtml += `<div class="preview-option"><input type="radio" name="${questionLabel}" value="${option.value}"> ${option.value}</div>`;
                }
            });
        } else if (questionType === 'text') {
            optionsHtml = `<input type="text" placeholder="Your answer" />`;
        } else if (questionType === 'date') {
            optionsHtml = `<input type="date" />`;
        } else if (questionType === 'file') {
            optionsHtml = `<input type="file" />`;
        } else if (questionType === 'likert') {
            const likertOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
            likertOptions.forEach(option => {
                optionsHtml += `<div class="preview-option"><input type="radio" name="${questionLabel}" value="${option}"> ${option}</div>`;
            });
        }

        // Add question and its options to preview
        if (questionLabel) {
            previewContainer.innerHTML += `
                <div class="preview-question">
                    ${questionLabel}
                    ${questionDescription ? `<div class="question-description">${questionDescription}</div>` : ''}
                </div>
                ${optionsHtml}`;
        }
    });
}

document.getElementById('surveyForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const surveyTitle = document.getElementById('surveyTitle').value;
    const surveyDescription = document.getElementById('surveyDescription').value;

    const surveyData = {
        title: surveyTitle,
        description: surveyDescription,
        questions: []
    };

    const questionBlocks = document.querySelectorAll('.question-block');
    let isValid = true; // Track overall validity

    questionBlocks.forEach(block => {
        const questionLabel = block.querySelector('input[type="text"]').value;
        let answerType = block.querySelector('select').value;

        // Perform validation
        if (!questionLabel) {
            alert("Please fill out all questions.");
            isValid = false;
            return; // Exit the loop if invalid
        }

        const options = block.querySelectorAll('.multiple-option');
        const optionValues = [];
        options.forEach(option => {
            if (option.value) {
                optionValues.push(option.value);
            }
        });

        // Additional validation for multiple-choice questions
        if (answerType === 'multiple' && optionValues.length < 2) {
            alert("Please provide at least two options for multiple-choice questions.");
            isValid = false;
            return; // Exit the loop if invalid
        }

        const questionDescription = block.querySelector('input[type="text"]:nth-of-type(2)').value; // Get the description
        surveyData.questions.push({ question: questionLabel, type: answerType, options: optionValues, description: questionDescription });
    });

    if (isValid) {
        console.log(surveyData); // You can handle the survey data further (like sending it to a server)
    }
});

// Function to get the element after the current mouse position
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.question-block:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; // Calculate position
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
// script.js

// Existing code...

// Function to export survey data as a JSON file
document.getElementById('exportSurveyBtn').addEventListener('click', function () {
    const surveyTitle = document.getElementById('surveyTitle').value;
    const surveyDescription = document.getElementById('surveyDescription').value;

    const surveyData = {
        title: surveyTitle,
        description: surveyDescription,
        questions: []
    };

    const questionBlocks = document.querySelectorAll('.question-block');

    questionBlocks.forEach(block => {
        const questionLabel = block.querySelector('input[type="text"]').value;
        const answerType = block.querySelector('select').value;
        const options = block.querySelectorAll('.multiple-option');
        const optionValues = [];

        options.forEach(option => {
            if (option.value) {
                optionValues.push(option.value);
            }
        });

        surveyData.questions.push({
            label: questionLabel,
            type: answerType,
            options: optionValues
        });
    });

    // Create a blob from the survey data
    const blob = new Blob([JSON.stringify(surveyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Survey exported successfully!');
});
const forms = []; // Array to hold generated survey forms

// Function to add a new survey form (keep this if you have it in another file)
function addNewSurveyForm(surveyData) {
    forms.push(surveyData); // Add the form to the array
    updateFormSelect(); // Update the dropdown menu
}

// Function to update the dropdown with generated forms
function updateFormSelect() {
    const formSelect = document.getElementById('formSelect');
    formSelect.innerHTML = '<option value="">Select a Form</option>'; // Clear existing options

    forms.forEach((form, index) => {
        const option = document.createElement('option');
        option.value = index; // Use index as value
        option.textContent = form.title; // Display the survey title
        formSelect.appendChild(option);
    });
}

// Function to show the selected form
function showForm() {
    const formSelect = document.getElementById('formSelect');
    const selectedIndex = formSelect.value;
    const formDisplay = document.getElementById('formDisplay');

    if (selectedIndex) {
        const selectedForm = forms[selectedIndex];
        formDisplay.innerHTML = `
            <h3>${selectedForm.title}</h3>
            <p>${selectedForm.description}</p>
            <div>
                ${selectedForm.questions.map(question => `
                    <div>
                        <strong>${question.question}</strong>
                        ${question.description ? `<div>${question.description}</div>` : ''}
                        ${question.type === 'multiple' ? `
                            <ul>
                                ${question.options.map(option => `<li>${option}</li>`).join('')}
                            </ul>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        formDisplay.innerHTML = ''; // Clear display if no selection
    }
}
// Function to apply customization
function applyCustomization() {
    // Get the selected values
    const backgroundColor = document.getElementById("backgroundColor").value;
    const textColor = document.getElementById("textColor").value;

    // Apply the styles to the preview container
    const previewContainer = document.getElementById("surveyPreview");
    previewContainer.style.backgroundColor = backgroundColor;
    previewContainer.style.color = textColor;

    // Optionally apply to other elements
    const questions = document.querySelectorAll(".preview-question");
    questions.forEach(question => {
        question.style.color = textColor; // Change question text color
    });
}

// Example event listener for a button
document.getElementById("applyCustomizationBtn").addEventListener("click", applyCustomization);
