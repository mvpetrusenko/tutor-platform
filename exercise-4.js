// Test Yourself Exercise Functionality

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const testBuilderSection = document.getElementById('testBuilderSection');
    const testSelectorSection = document.getElementById('testSelectorSection');
    const testRunnerSection = document.getElementById('testRunnerSection');
    const testResultsSection = document.getElementById('testResultsSection');
    
    const testName = document.getElementById('testName');
    const questionText = document.getElementById('questionText');
    const correctAnswer = document.getElementById('correctAnswer');
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');
    const option3 = document.getElementById('option3');
    const option4 = document.getElementById('option4');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const clearQuestionFormButton = document.getElementById('clearQuestionFormButton');
    const questionsContainer = document.getElementById('questionsContainer');
    const saveTestBtn = document.getElementById('saveTestBtn');
    const clearTestBtn = document.getElementById('clearTestBtn');
    const savedTestsContainer = document.getElementById('savedTestsContainer');
    const testSelectorContainer = document.getElementById('testSelectorContainer');
    const backToBuilderBtn = document.getElementById('backToBuilderBtn');
    
    const questionCounter = document.getElementById('questionCounter');
    const currentQuestionText = document.getElementById('currentQuestionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    const totalScore = document.getElementById('totalScore');
    const scorePercentage = document.getElementById('scorePercentage');
    const correctCount = document.getElementById('correctCount');
    const incorrectCount = document.getElementById('incorrectCount');
    const resultsDetails = document.getElementById('resultsDetails');
    const retakeTestBtn = document.getElementById('retakeTestBtn');
    const newTestBtn = document.getElementById('newTestBtn');
    
    // State
    let questions = [];
    let currentTest = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let testResults = [];
    let savedTests = [];
    
    // Load saved tests from localStorage
    function loadSavedTests() {
        const saved = localStorage.getItem('savedTests');
        if (saved) {
            savedTests = JSON.parse(saved);
            displaySavedTests();
        }
    }
    
    // Save tests to localStorage
    function saveTestsToStorage() {
        localStorage.setItem('savedTests', JSON.stringify(savedTests));
    }
    
    // Display all questions
    function displayQuestions() {
        questionsContainer.innerHTML = '';
        
        if (questions.length === 0) {
            questionsContainer.innerHTML = '<p class="no-questions">No questions added yet.</p>';
            return;
        }
        
        questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <div class="question-item-content">
                    <strong>Q${index + 1}:</strong> ${escapeHtml(q.question)}
                    <br>
                    <small>Correct: ${escapeHtml(q.correctAnswer)}</small>
                </div>
                <button class="remove-question-btn" data-index="${index}">Remove</button>
            `;
            questionsContainer.appendChild(questionDiv);
        });
        
        // Add remove listeners
        questionsContainer.querySelectorAll('.remove-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                questions.splice(index, 1);
                saveQuestions();
                displayQuestions();
                updateStartButton();
            });
        });
    }
    
    // Update save button state
    function updateSaveButton() {
        saveTestBtn.disabled = questions.length === 0 || !testName.value.trim();
    }
    
    // Display saved tests
    function displaySavedTests() {
        savedTestsContainer.innerHTML = '';
        
        if (savedTests.length === 0) {
            savedTestsContainer.innerHTML = '<p class="no-questions">No tests saved yet.</p>';
            return;
        }
        
        savedTests.forEach((test, index) => {
            const testDiv = document.createElement('div');
            testDiv.className = 'saved-test-item';
            testDiv.innerHTML = `
                <div class="saved-test-content">
                    <strong>${escapeHtml(test.name)}</strong>
                    <small>${test.questions.length} question${test.questions.length !== 1 ? 's' : ''}</small>
                </div>
                <div class="saved-test-actions">
                    <button class="start-saved-test-btn" data-index="${index}">Start</button>
                    <button class="delete-test-btn" data-index="${index}">Delete</button>
                </div>
            `;
            savedTestsContainer.appendChild(testDiv);
        });
        
        // Add event listeners
        savedTestsContainer.querySelectorAll('.start-saved-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                startSavedTest(index);
            });
        });
        
        savedTestsContainer.querySelectorAll('.delete-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                showAlert('warning', 'Delete Test', `Are you sure you want to delete "${savedTests[index].name}"?`, () => {
                    savedTests.splice(index, 1);
                    saveTestsToStorage();
                    displaySavedTests();
                    showAlert('success', 'Deleted', 'Test deleted successfully!');
                });
            });
        });
    }
    
    // Start a saved test
    function startSavedTest(index) {
        const test = savedTests[index];
        currentTest = test;
        questions = [...test.questions];
        
        // Shuffle questions
        questions = shuffleArray(questions);
        
        currentQuestionIndex = 0;
        userAnswers = [];
        testResults = [];
        
        testBuilderSection.style.display = 'none';
        testSelectorSection.style.display = 'none';
        testRunnerSection.style.display = 'block';
        testResultsSection.style.display = 'none';
        
        showQuestion();
    }
    
    // Add question
    addQuestionBtn.addEventListener('click', () => {
        const question = questionText.value.trim();
        const correct = correctAnswer.value.trim();
        const opt1 = option1.value.trim();
        const opt2 = option2.value.trim();
        const opt3 = option3.value.trim();
        const opt4 = option4.value.trim();
        
        // Validation
        if (!question || !correct || !opt1 || !opt2 || !opt3) {
            showAlert('warning', 'Validation Error', 'Please fill in all required fields (Question, Correct Answer, and at least 3 options)');
            return;
        }
        
        // Check if correct answer is in options
        const options = [opt1, opt2, opt3];
        if (opt4) options.push(opt4);
        
        if (!options.includes(correct)) {
            showAlert('warning', 'Validation Error', 'Correct answer must be one of the options!');
            return;
        }
        
        // Shuffle options for display
        const shuffledOptions = shuffleArray([...options]);
        
        // Add question
        questions.push({
            question: question,
            correctAnswer: correct,
            options: shuffledOptions
        });
        
        displayQuestions();
        updateSaveButton();
        
        // Clear form
        questionText.value = '';
        correctAnswer.value = '';
        option1.value = '';
        option2.value = '';
        option3.value = '';
        option4.value = '';
    });
    
    // Clear question form
    if (clearQuestionFormButton) {
        clearQuestionFormButton.addEventListener('click', () => {
            showAlert('warning', 'Clear Form', 'Are you sure you want to clear the question form?', () => {
                questionText.value = '';
                correctAnswer.value = '';
                option1.value = '';
                option2.value = '';
                option3.value = '';
                option4.value = '';
                showAlert('success', 'Cleared', 'Question form cleared!');
            });
        });
    }
    
    // Listen to test name input
    testName.addEventListener('input', () => {
        updateSaveButton();
    });
    
    // Save test
    saveTestBtn.addEventListener('click', () => {
        const name = testName.value.trim();
        
        if (!name) {
            showAlert('warning', 'Input Required', 'Please enter a test name!');
            return;
        }
        
        if (questions.length === 0) {
            showAlert('warning', 'No Questions', 'Please add at least one question!');
            return;
        }
        
        // Check if name already exists
        const existingIndex = savedTests.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
        
        if (existingIndex !== -1) {
            showAlert('warning', 'Test Exists', `A test with this name already exists. Do you want to replace it?`, () => {
                savedTests[existingIndex] = {
                    name: name,
                    questions: [...questions],
                    createdAt: new Date().toISOString()
                };
                saveTestsToStorage();
                displaySavedTests();
                
                // Clear current test
                testName.value = '';
                questions = [];
                displayQuestions();
                updateSaveButton();
                
                showAlert('success', 'Saved', `Test "${name}" saved successfully!`);
            });
            return;
        }
        
        savedTests.push({
            name: name,
            questions: [...questions],
            createdAt: new Date().toISOString()
        });
        
        saveTestsToStorage();
        displaySavedTests();
        
        // Clear current test
        testName.value = '';
        questions = [];
        displayQuestions();
        updateSaveButton();
        
        showAlert('success', 'Saved', `Test "${name}" saved successfully!`);
    });
    
    // Shuffle array
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Show test selector
    function showTestSelector() {
        if (savedTests.length === 0) {
            showAlert('info', 'No Tests', 'Please save at least one test before starting!');
            return;
        }
        
        testBuilderSection.style.display = 'none';
        testSelectorSection.style.display = 'block';
        testRunnerSection.style.display = 'none';
        testResultsSection.style.display = 'none';
        
        displayTestSelector();
    }
    
    // Display test selector
    function displayTestSelector() {
        testSelectorContainer.innerHTML = '';
        
        if (savedTests.length === 0) {
            testSelectorContainer.innerHTML = '<p class="no-questions">No tests available. Please create a test first.</p>';
            return;
        }
        
        savedTests.forEach((test, index) => {
            const testCard = document.createElement('div');
            testCard.className = 'test-selector-card';
            testCard.innerHTML = `
                <div class="test-card-content">
                    <h4>${escapeHtml(test.name)}</h4>
                    <p>${test.questions.length} question${test.questions.length !== 1 ? 's' : ''}</p>
                </div>
                <button class="select-test-button" data-index="${index}">Start Test</button>
            `;
            testSelectorContainer.appendChild(testCard);
        });
        
        // Add event listeners
        testSelectorContainer.querySelectorAll('.select-test-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                startSavedTest(index);
            });
        });
    }
    
    // Back to builder
    backToBuilderBtn.addEventListener('click', () => {
        testSelectorSection.style.display = 'none';
        testBuilderSection.style.display = 'block';
    });
    
    // Show current question
    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        currentQuestionText.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-button';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => selectAnswer(option));
            optionsContainer.appendChild(optionBtn);
        });
    }
    
    // Select answer
    function selectAnswer(selectedAnswer) {
        const question = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        userAnswers.push(selectedAnswer);
        testResults.push({
            question: question.question,
            correctAnswer: question.correctAnswer,
            userAnswer: selectedAnswer,
            isCorrect: isCorrect
        });
        
        currentQuestionIndex++;
        
        // Small delay before next question
        setTimeout(() => {
            showQuestion();
        }, 500);
    }
    
    // Show results
    function showResults() {
        testRunnerSection.style.display = 'none';
        testResultsSection.style.display = 'block';
        
        const correct = testResults.filter(r => r.isCorrect).length;
        const total = testResults.length;
        const percentage = Math.round((correct / total) * 100);
        
        totalScore.textContent = `Score: ${correct}/${total}`;
        scorePercentage.textContent = `${percentage}%`;
        correctCount.textContent = `Correct: ${correct}`;
        incorrectCount.textContent = `Incorrect: ${total - correct}`;
        
        // Show detailed results
        resultsDetails.innerHTML = '';
        testResults.forEach((result, index) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            resultDiv.innerHTML = `
                <div class="result-question">
                    <strong>Q${index + 1}:</strong> ${escapeHtml(result.question)}
                </div>
                <div class="result-answer">
                    <span class="result-label">Your answer:</span> ${escapeHtml(result.userAnswer)}
                    ${!result.isCorrect ? `<br><span class="result-label">Correct answer:</span> ${escapeHtml(result.correctAnswer)}` : ''}
                </div>
                <div class="result-status">
                    ${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
            `;
            resultsDetails.appendChild(resultDiv);
        });
    }
    
    // Retake test
    retakeTestBtn.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = [];
        testResults = [];
        
        // Shuffle questions again
        questions = shuffleArray([...questions]);
        
        testResultsSection.style.display = 'none';
        testRunnerSection.style.display = 'block';
        showQuestion();
    });
    
    // New test
    newTestBtn.addEventListener('click', () => {
        testResultsSection.style.display = 'none';
        showTestSelector();
    });
    
    // Add "Start Test" button to builder
    function addStartTestButton() {
        const testActions = document.querySelector('.test-actions');
        if (testActions && !document.getElementById('showTestSelectorBtn')) {
            const startTestBtn = document.createElement('button');
            startTestBtn.id = 'showTestSelectorBtn';
            startTestBtn.className = 'start-test-button';
            startTestBtn.textContent = 'Start Test';
            startTestBtn.addEventListener('click', () => {
                showTestSelector();
            });
            testActions.appendChild(startTestBtn);
        }
    }
    
    // Clear current test
    clearTestBtn.addEventListener('click', () => {
        showAlert('warning', 'Clear Test', 'Are you sure you want to clear the current test? (Saved tests will not be affected)', () => {
            testName.value = '';
            questions = [];
            displayQuestions();
            updateSaveButton();
            showAlert('success', 'Cleared', 'Current test cleared!');
        });
    });
    
    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialize
    loadSavedTests();
    addStartTestButton();
});
