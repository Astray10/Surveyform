document.getElementById('addQuestionBtn').addEventListener('click', function () {
    const questionsContainer = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    questionDiv.innerHTML = `
        <select class="questionType">
            <option value="text">Open-Ended Question</option>
            <option value="multiple">Multiple Choice</option>
            <option value="rating">Rating Scale (1-5)</option>
        </select>
        <input type="text" placeholder="Enter your question" required>
        <div class="multipleChoiceContainer" style="display: none;">
            <input type="text" placeholder="Option 1" required>
            <input type="text" placeholder="Option 2" required>
            <button type="button" class="addOptionBtn">Add Option</button>
        </div>
        <button type="button" class="removeQuestion">Remove Question</button>
    `;
    questionsContainer.appendChild(questionDiv);

    // Change event listener for the question type selector
    questionDiv.querySelector('.questionType').addEventListener('change', function () {
        const type = this.value;
        const multipleChoiceContainer = questionDiv.querySelector('.multipleChoiceContainer');
        if (type === 'multiple') {
            multipleChoiceContainer.style.display = 'block';
        } else {
            multipleChoiceContainer.style.display = 'none';
        }
        updatePreview();
    });

    // Event listener for removing the question
    questionDiv.querySelector('.removeQuestion').addEventListener('click', function () {
        questionsContainer.removeChild(questionDiv);
        updatePreview();
    });

    // Event listener for adding options for multiple choice
    questionDiv.querySelector('.addOptionBtn').addEventListener('click', function () {
        const newOptionInput = document.createElement('input');
        newOptionInput.type = 'text';
        newOptionInput.placeholder = `Option ${multipleChoiceContainer.children.length + 2}`;
        multipleChoiceContainer.insertBefore(newOptionInput, this);
        updatePreview();
    });

    updatePreview();
});

function updatePreview() {
    const title = document.getElementById('surveyTitle').value;
    const description = document.getElementById('surveyDescription').value;
    const questions = document.querySelectorAll('.question');
    const previewContent = document.getElementById('previewContent');

    previewContent.innerHTML = `
        <h4>${title}</h4>
        <p>${description}</p>
    `;
    questions.forEach(question => {
        const questionText = question.querySelector('input[type="text"]').value;
        const questionType = question.querySelector('.questionType').value;

        if (questionType === 'multiple') {
            const options = question.querySelector('.multipleChoiceContainer').querySelectorAll('input[type="text"]');
            const optionsList = Array.from(options).map(option => option.value).filter(opt => opt).join('<br>');
            previewContent.innerHTML += `<strong>${questionText}</strong><br>${optionsList}<br>`;
        } else if (questionType === 'rating') {
            previewContent.innerHTML += `<strong>${questionText}</strong><br>Rate from 1 to 5<br>`;
        } else {
            previewContent.innerHTML += `<strong>${questionText}</strong><br>Open-ended response<br>`;
        }
    });
}
