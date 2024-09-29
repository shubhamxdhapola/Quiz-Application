const totalQuestion = document.querySelector('#total-questions'); 
const questionCategory = document.querySelector('#question-category');
const questionDifficulty = document.querySelector('#difficulty-level');
const timePerQuestion = document.querySelector('#time');

const startScreen = document.querySelector('.start-screen');
const quizScreen = document.querySelector('.quiz-screen');
const scoreScreen = document.querySelector('.score-screen')
const errorScreen = document.querySelector('.error-screen');

const optionsContainer = document.querySelector('.options-wrapper');
const options = document.querySelectorAll('.option')
const optionsText = document.querySelectorAll('.option-text');

const startBtn = document.querySelector('.start');
const submitButton = document.querySelector('.submit');
const nextBtn = document.querySelector('.next');
const restartBtn = document.querySelectorAll('.restart')


let questionsList = [];
let currentQuizItem = 0;
let intervalID;
let score = 0;

function addLoadingAnimation() {

    startBtn.innerHTML = `
        <div class="loader">
            <span class="dot-1 dot"></span>
            <span class="dot-2 dot"></span>
            <span class="dot-3 dot"></span>
        </div>`
}

function decodeHtmlEntities(question) {

    const textArea = document.createElement('textarea');
    textArea.innerHTML = question;
    return textArea.value;
}

async function startQuiz() {

    addLoadingAnimation();

    try {
        const url = `https://opentdb.com/api.php?amount=${totalQuestion.value}&category=${questionCategory.value}&difficulty=${questionDifficulty.value}&type=multiple`;
        const response = await fetch(url);
        const data = await response.json();

        questionsList = data.results;
        startScreen.classList.add('hide');
        quizScreen.classList.remove('hide');
        showQuestion(questionsList[currentQuizItem]);

    } catch {
        startScreen.classList.add('hide')
        errorScreen.classList.remove('hide');
    }
}

startBtn.addEventListener('click', startQuiz)

function startTimer(totalTime){

    const progressBar = document.querySelector('.progress-bar');
    const timerText = document.querySelector('.timer-text');
    let currentTime = totalTime * 1000;

    intervalID = setInterval(() => {
        const remainingTime = Math.ceil(currentTime / 1000);
        timerText.textContent = remainingTime;
        progressBar.style.width = `${(currentTime / (totalTime * 1000)) * 100}%`;
        
        if (currentTime <= 0) {
            clearInterval(intervalID);
            timerText.textContent = "Time up!";
            handleTimeout();
        }
        currentTime -= 10;

    }, 10); 
}

function handleTimeout() {

    disableOptions();
    showCorrectAnswer();
    submitButton.style.display = 'none';
    nextBtn.style.display = 'block';
    if(document.querySelector('.selected')) {
        document.querySelector('.selected').classList.remove('selected')
    }
}

function showQuestion (quizItem) {
    
    startTimer(timePerQuestion.value)

    const currentQuestionNumber = document.querySelector('.current-question');
    const totalQuestionsNumber = document.querySelector('.total-questions');
    const questionText = document.querySelector(".question");
    const optionsList = [...quizItem.incorrect_answers, quizItem.correct_answer].map(decodeHtmlEntities);

    currentQuestionNumber.innerText = currentQuizItem + 1;
    totalQuestionsNumber.innerText = `of ${totalQuestion.value}`;
    questionText.innerText = decodeHtmlEntities(quizItem.question);
    
    optionsList.sort(() => Math.random() - 0.5);
    optionsText.forEach((currentOption, optionNo) => {
        currentOption.innerText = optionsList[optionNo]
    })
}

function disableOptions() {
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
}

optionsContainer.addEventListener('click', (e) => {
    
    if(e.target.classList.contains('option')){
        options.forEach((option) => {
            if(option.classList.contains('selected')){
                option.classList.remove('selected')
            }
        })
        e.target.classList.add('selected')
        submitButton.disabled = false;
    }
})

function checkAnswer() {
    
    clearInterval(intervalID)
    const selectedOption = document.querySelector('.selected').firstElementChild;
    const correctAnswer = decodeHtmlEntities(questionsList[currentQuizItem].correct_answer);

    submitButton.style.display = 'none', 
    nextBtn.style.display = 'block';
    disableOptions()

    if (selectedOption && selectedOption.innerText === correctAnswer) {
        selectedOption.parentElement.classList.add('correct')
        score++;
    } else {
        selectedOption.parentElement.classList.add('wrong')
        showCorrectAnswer();
    }
}

submitButton.addEventListener('click', checkAnswer)

function showCorrectAnswer(){

    const correctAnswer = decodeHtmlEntities(questionsList[currentQuizItem].correct_answer);
    optionsText.forEach((optionText) => {
        if ( optionText.innerText === correctAnswer ) {
            optionText.parentElement.classList.add('correct')
        }
    })
}

nextBtn.addEventListener('click', () => {

    if((currentQuizItem + 1) < totalQuestion.value){
        resetValues();
        currentQuizItem++;
        showQuestion(questionsList[currentQuizItem]);

    } else { 
        showScore(); 
    }
})

function resetValues() {
 
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'wrong');
        option.style.pointerEvents = 'auto';
    });

    submitButton.style.display = 'block'
    nextBtn.style.display = 'none'
    submitButton.disabled = true
}

function showScore() {

    const totalScore = document.querySelector('.total-score');
    const outOf = document.querySelector('.out-of');

    quizScreen.classList.add('hide')
    scoreScreen.classList.remove('hide')
    totalScore.innerText = score;
    outOf.innerText = ` / ${totalQuestion.value}`
}

restartBtn.forEach((restart) => {
    restart.addEventListener('click', () => {
        window.location.reload()
    })
})

