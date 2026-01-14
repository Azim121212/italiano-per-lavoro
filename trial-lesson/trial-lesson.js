// Trial Lesson Logic
const TrialLesson = {
    currentBlock: 0,
    currentQuizQuestion: 0,
    quizAnswers: {},
    correctAnswers: {
        q1: 'Marco',
        q2: 'Messina',
        q3: 'cameriere',
        q4: 'Marco',
        q5: 'tre mesi',
        sentence: ['posso', 'lavorare', 'subito']
    },
    quizQuestions: [
        {
            type: 'multiple',
            question: 'Как звали студента из истории?',
            options: ['Marco', 'Messina', 'Cameriere', 'ILearning'],
            correct: 0
        },
        {
            type: 'fill',
            question: 'Выбери правильный вариант: Mi ___ Marco',
            options: ['chiamo', 'vivo', 'cerco', 'lavoro'],
            correct: 0
        },
        {
            type: 'truefalse',
            question: 'Marco сказал работодателю "Posso lavorare subito" — это означает "Могу работать сразу"',
            correct: true
        },
        {
            type: 'multiple',
            question: 'В каком городе жил Marco?',
            options: ['Messina', 'Roma', 'Milano', 'Napoli'],
            correct: 0
        },
        {
            type: 'fill',
            question: 'Выбери правильный вариант: Vivo a ___',
            options: ['Messina', 'lavorare', 'tre mesi', 'domani'],
            correct: 0
        },
        {
            type: 'multiple',
            question: 'Сколько времени Marco был в Италии, когда нашел работу?',
            options: ['tre mesi (три месяца)', 'un anno (один год)', 'due settimane (две недели)', 'sei mesi (шесть месяцев)'],
            correct: 0
        },
        {
            type: 'truefalse',
            question: 'Marco ответил на собеседовании: "Sono in Italia da tre mesi" — это означает "Я в Италии три месяца"',
            correct: true
        },
        {
            type: 'fill',
            question: 'Какую работу нашел Marco? Cerco lavoro come ___',
            options: ['cameriere', 'lavorare', 'tre mesi', 'domani'],
            correct: 0
        },
        {
            type: 'multiple',
            question: 'На какой курс записался Marco?',
            options: ['ILearning', 'Italiano Base', 'Lavoro Facile', 'Messina Corso'],
            correct: 0
        },
        {
            type: 'truefalse',
            question: 'Marco научился говорить по-итальянски за три месяца благодаря курсу ILearning',
            correct: true
        }
    ],
    sentenceOrder: [],

    init() {
        // Проверяем, есть ли сохраненный прогресс
        if (typeof StateManager !== 'undefined') {
            const savedProgress = StateManager.load('trial_lesson_progress');
            if (savedProgress) {
                this.currentBlock = savedProgress.currentBlock || 0;
                this.currentQuizQuestion = savedProgress.currentQuizQuestion || 0;
                this.quizAnswers = savedProgress.quizAnswers || {};
                this.sentenceOrder = savedProgress.sentenceOrder || [];
            }
        }

        this.setupEventListeners();
        this.showCurrentBlock();
    },

    setupEventListeners() {
        // Radio buttons для блоков 1 и 2
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleRadioChange(e.target);
            });
        });

        // Клики по словам для блока 3
        document.querySelectorAll('.word').forEach(word => {
            word.addEventListener('click', (e) => {
                this.handleWordClick(e.target);
            });
        });
        
        // Настраиваем drag & drop для блока 3
        this.setupDragAndDrop();

        // Textarea для блока 4
        const textarea = document.getElementById('selfIntroduction');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.checkTextAnswer();
            });
        }
    },

    startLesson() {
        document.getElementById('introScreen').classList.remove('active');
        this.currentBlock = 0; // Начинаем с рассказа
        this.showCurrentBlock();
        this.saveProgress();
    },

    showCurrentBlock() {
        // Скрываем все блоки
        document.querySelectorAll('.lesson-block').forEach(block => {
            block.style.display = 'none';
        });

        // Показываем текущий блок
        const currentBlockEl = document.getElementById(`block${this.currentBlock}`);
        if (currentBlockEl) {
            currentBlockEl.style.display = 'block';
            currentBlockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Если это блок 3, настраиваем drag & drop заново
            if (this.currentBlock === 3) {
                setTimeout(() => {
                    this.setupDragAndDrop();
                }, 100);
            }
        } else if (this.currentBlock === 6) {
            // Финальный квиз (теперь это блок 6)
            this.showQuiz();
        }

        this.saveProgress();
    },

    handleRadioChange(radio) {
        const questionId = radio.name;
        const value = radio.value;
        const questionNum = questionId.replace('q', '');
        const feedbackEl = document.getElementById(`feedback${questionNum}`);

        // Проверяем правильность ответа
        const isCorrect = this.correctAnswers[questionId] === value;

        if (isCorrect) {
            feedbackEl.innerHTML = '<span class="feedback-correct">✓ Правильно!</span>';
            feedbackEl.className = 'feedback correct';
            radio.closest('.blank-item, .dialogue').classList.add('answered-correct');
        } else {
            feedbackEl.innerHTML = '<span class="feedback-incorrect">✗ Неправильно. Попробуй еще раз!</span>';
            feedbackEl.className = 'feedback incorrect';
            radio.closest('.blank-item, .dialogue').classList.add('answered-incorrect');
        }

        // Проверяем, можно ли перейти дальше
        this.checkBlockCompletion();
    },

    checkBlockCompletion() {
        let allAnswered = false;
        let nextBtnId = '';

        if (this.currentBlock === 1) {
            // Проверяем все 3 вопроса блока 1
            const q1 = document.querySelector('input[name="q1"]:checked');
            const q2 = document.querySelector('input[name="q2"]:checked');
            const q3 = document.querySelector('input[name="q3"]:checked');
            allAnswered = q1 && q2 && q3;
            nextBtnId = 'nextBtn1';
        } else if (this.currentBlock === 2) {
            // Проверяем оба вопроса блока 2
            const q4 = document.querySelector('input[name="q4"]:checked');
            const q5 = document.querySelector('input[name="q5"]:checked');
            allAnswered = q4 && q5;
            nextBtnId = 'nextBtn2';
        }

        if (allAnswered && nextBtnId) {
            document.getElementById(nextBtnId).disabled = false;
        }
    },

    handleWordClick(wordEl) {
        const word = wordEl.dataset.word;
        
        // Проверяем, не добавлено ли уже это слово
        if (this.sentenceOrder.includes(word)) {
            return;
        }

        // Добавляем слово в предложение
        this.sentenceOrder.push(word);
        wordEl.classList.add('used');

        // Обновляем отображение
        this.updateSentenceDisplay();

        // Проверяем правильность
        this.checkSentence();
        
        // Сохраняем прогресс
        this.saveProgress();
    },
    
    // Поддержка drag & drop для мобильных устройств
    setupDragAndDrop() {
        const wordsContainer = document.getElementById('wordsContainer');
        const sentenceWords = document.getElementById('sentenceWords');
        
        if (!wordsContainer || !sentenceWords) return;
        
        // Для десктопа - drag & drop
        const words = wordsContainer.querySelectorAll('.word');
        words.forEach(word => {
            word.draggable = true;
            
            word.addEventListener('dragstart', (e) => {
                if (word.classList.contains('used')) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData('text/plain', word.dataset.word);
                word.style.opacity = '0.5';
            });
            
            word.addEventListener('dragend', (e) => {
                word.style.opacity = '';
            });
        });
        
        sentenceWords.addEventListener('dragover', (e) => {
            e.preventDefault();
            sentenceWords.style.background = '#e0f2fe';
        });
        
        sentenceWords.addEventListener('dragleave', () => {
            sentenceWords.style.background = '';
        });
        
        sentenceWords.addEventListener('drop', (e) => {
            e.preventDefault();
            sentenceWords.style.background = '';
            const word = e.dataTransfer.getData('text/plain');
            const wordEl = wordsContainer.querySelector(`[data-word="${word}"]`);
            if (wordEl && !wordEl.classList.contains('used')) {
                this.handleWordClick(wordEl);
            }
        });
    },

    updateSentenceDisplay() {
        const sentenceWordsEl = document.getElementById('sentenceWords');
        sentenceWordsEl.innerHTML = this.sentenceOrder.map(word => 
            `<span class="sentence-word">${word}</span>`
        ).join(' ');
    },

    checkSentence() {
        const correctOrder = this.correctAnswers.sentence;
        const feedbackEl = document.getElementById('feedback6');
        const nextBtn = document.getElementById('nextBtn3');

        if (this.sentenceOrder.length === correctOrder.length) {
            const isCorrect = JSON.stringify(this.sentenceOrder) === JSON.stringify(correctOrder);
            
            if (isCorrect) {
                feedbackEl.innerHTML = '<span class="feedback-correct">✓ Отлично! Правильное предложение: Posso lavorare subito</span>';
                feedbackEl.className = 'feedback correct';
                nextBtn.disabled = false;
            } else {
                feedbackEl.innerHTML = '<span class="feedback-incorrect">✗ Не совсем правильно. Попробуй еще раз!</span>';
                feedbackEl.className = 'feedback incorrect';
            }
        }
    },

    resetSentence() {
        this.sentenceOrder = [];
        const wordsContainer = document.getElementById('wordsContainer');
        if (wordsContainer) {
            wordsContainer.querySelectorAll('.word').forEach(word => {
                word.classList.remove('used');
            });
        }
        const sentenceWords = document.getElementById('sentenceWords');
        if (sentenceWords) {
            sentenceWords.innerHTML = '';
            sentenceWords.style.background = '';
        }
        const feedback = document.getElementById('feedback6');
        if (feedback) {
            feedback.innerHTML = '';
            feedback.className = 'feedback';
        }
        const nextBtn = document.getElementById('nextBtn3');
        if (nextBtn) {
            nextBtn.disabled = true;
        }
        this.saveProgress();
    },

    checkTextAnswer() {
        const text = document.getElementById('selfIntroduction').value.trim();
        const feedbackEl = document.getElementById('feedback7');
        
        if (text.length > 10) {
            feedbackEl.innerHTML = '<span class="feedback-correct">✓ Хорошо! Ты написал о себе.</span>';
            feedbackEl.className = 'feedback correct';
        } else if (text.length > 0) {
            feedbackEl.innerHTML = '<span class="feedback-info">💡 Попробуй написать больше!</span>';
            feedbackEl.className = 'feedback info';
        } else {
            feedbackEl.innerHTML = '';
            feedbackEl.className = 'feedback';
        }
    },

    nextBlock() {
        if (this.currentBlock < 5) {
            this.currentBlock++;
            this.showCurrentBlock();
        } else if (this.currentBlock === 5) {
            // Переход к квизу (теперь это блок 6)
            this.currentBlock = 6;
            this.showQuiz();
        }
        this.saveProgress();
    },

    showQuiz() {
        document.getElementById('quizBlock').style.display = 'block';
        this.currentQuizQuestion = 0;
        this.renderQuizQuestion();
    },

    renderQuizQuestion() {
        const question = this.quizQuestions[this.currentQuizQuestion];
        const quizContent = document.getElementById('quizContent');
        const progressEl = document.getElementById('quizProgress');
        
        progressEl.textContent = `Вопрос ${this.currentQuizQuestion + 1} из ${this.quizQuestions.length}`;

        let html = `<div class="quiz-question">`;
        html += `<h3>${question.question}</h3>`;

        if (question.type === 'multiple') {
            html += '<div class="quiz-options">';
            question.options.forEach((option, index) => {
                const isChecked = this.quizAnswers[this.currentQuizQuestion] === index;
                html += `
                    <label class="quiz-option ${isChecked ? 'selected' : ''}">
                        <input type="radio" name="quiz" value="${index}" ${isChecked ? 'checked' : ''}>
                        ${option}
                    </label>
                `;
            });
            html += '</div>';
        } else if (question.type === 'fill') {
            html += '<div class="quiz-options">';
            question.options.forEach((option, index) => {
                const isChecked = this.quizAnswers[this.currentQuizQuestion] === index;
                html += `
                    <label class="quiz-option ${isChecked ? 'selected' : ''}">
                        <input type="radio" name="quiz" value="${index}" ${isChecked ? 'checked' : ''}>
                        ${option}
                    </label>
                `;
            });
            html += '</div>';
        } else if (question.type === 'truefalse') {
            const trueChecked = this.quizAnswers[this.currentQuizQuestion] === true;
            const falseChecked = this.quizAnswers[this.currentQuizQuestion] === false;
            html += `
                <div class="quiz-truefalse">
                    <label class="quiz-option ${trueChecked ? 'selected' : ''}">
                        <input type="radio" name="quiz" value="true" ${trueChecked ? 'checked' : ''}>
                        Верно
                    </label>
                    <label class="quiz-option ${falseChecked ? 'selected' : ''}">
                        <input type="radio" name="quiz" value="false" ${falseChecked ? 'checked' : ''}>
                        Неверно
                    </label>
                </div>
            `;
        }

        html += '</div>';
        quizContent.innerHTML = html;

        // Добавляем обработчики событий
        quizContent.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const value = question.type === 'truefalse' 
                    ? e.target.value === 'true' 
                    : parseInt(e.target.value);
                this.quizAnswers[this.currentQuizQuestion] = value;
                this.updateQuizButtons();
                this.saveProgress();
            });
        });

        this.updateQuizButtons();
    },

    updateQuizButtons() {
        const hasAnswer = this.quizAnswers[this.currentQuizQuestion] !== undefined;
        const nextBtn = document.getElementById('nextQuizBtn');
        const prevBtn = document.getElementById('prevQuizBtn');
        const finishBtn = document.getElementById('finishQuizBtn');

        nextBtn.disabled = !hasAnswer;
        
        if (this.currentQuizQuestion > 0) {
            prevBtn.style.display = 'inline-block';
        } else {
            prevBtn.style.display = 'none';
        }

        if (this.currentQuizQuestion === this.quizQuestions.length - 1 && hasAnswer) {
            finishBtn.style.display = 'inline-block';
            nextBtn.style.display = 'none';
        } else {
            finishBtn.style.display = 'none';
            nextBtn.style.display = 'inline-block';
        }
    },

    nextQuestion() {
        if (this.currentQuizQuestion < this.quizQuestions.length - 1) {
            this.currentQuizQuestion++;
            this.renderQuizQuestion();
        }
        this.saveProgress();
    },

    prevQuestion() {
        if (this.currentQuizQuestion > 0) {
            this.currentQuizQuestion--;
            this.renderQuizQuestion();
        }
    },

    finishQuiz() {
        // Подсчитываем результаты
        let correct = 0;
        this.quizQuestions.forEach((question, index) => {
            const userAnswer = this.quizAnswers[index];
            if (question.type === 'truefalse') {
                if (userAnswer === question.correct) correct++;
            } else {
                if (userAnswer === question.correct) correct++;
            }
        });

        // Показываем результаты
        const quizBlock = document.getElementById('quizBlock');
        const resultsScreen = document.getElementById('resultsScreen');
        
        if (quizBlock) quizBlock.style.display = 'none';
        if (resultsScreen) {
            resultsScreen.style.display = 'block';
            resultsScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        const finalScoreEl = document.getElementById('finalScore');
        if (finalScoreEl) finalScoreEl.textContent = correct;
        
        let message = '';
        if (correct >= 8) {
            message = '🎉 Отлично! Ты готов начать обучение в ILearning. Твой уровень позволяет начать с базового курса.';
        } else if (correct >= 5) {
            message = '👍 Хорошо! Ты на правильном пути. Рекомендуем начать с базового курса с дополнительной практикой.';
        } else {
            message = '💪 Не переживай! Каждый начинает с нуля. Наш курс поможет тебе быстро освоить итальянский.';
        }
        
        const resultsMessageEl = document.getElementById('resultsMessage');
        if (resultsMessageEl) resultsMessageEl.textContent = message;
        
        // Очищаем сохраненный прогресс после завершения
        if (typeof StateManager !== 'undefined') {
            StateManager.remove('trial_lesson_progress');
        }
    },

    switchToStudent() {
        document.getElementById('teacherView').style.display = 'none';
        document.getElementById('studentView').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    switchToTeacher() {
        document.getElementById('studentView').style.display = 'none';
        document.getElementById('teacherView').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    saveProgress() {
        if (typeof StateManager !== 'undefined') {
            StateManager.save('trial_lesson_progress', {
                currentBlock: this.currentBlock,
                currentQuizQuestion: this.currentQuizQuestion,
                quizAnswers: this.quizAnswers,
                sentenceOrder: this.sentenceOrder
            });
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    TrialLesson.init();
    
    // Кнопка переключения между видами (для тестирования)
    const switchBtn = document.createElement('button');
    switchBtn.id = 'viewSwitchBtn';
    switchBtn.textContent = '👨‍🏫 Вид преподавателя';
    switchBtn.className = 'btn btn-secondary';
    switchBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; padding: 0.75rem 1.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
    switchBtn.onclick = () => {
        const studentView = document.getElementById('studentView');
        const teacherView = document.getElementById('teacherView');
        
        if (studentView.style.display !== 'none') {
            TrialLesson.switchToTeacher();
            switchBtn.textContent = '👨‍🎓 Вид студента';
        } else {
            TrialLesson.switchToStudent();
            switchBtn.textContent = '👨‍🏫 Вид преподавателя';
        }
    };
    document.body.appendChild(switchBtn);
    
    // Проверяем URL параметры для автоматического переключения вида
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'teacher') {
        TrialLesson.switchToTeacher();
        switchBtn.textContent = '👨‍🎓 Вид студента';
    }
});

window.TrialLesson = TrialLesson;

