// Trial Lesson Logic
const TrialLesson = {
    currentBlock: 0,
    currentQuizQuestion: 0,
    quizAnswers: {},
    shuffledOptions: {}, // Сохраняем рандомизированные варианты
    correctAnswers: {
        q1: 'Marco',
        q2: 'Messina',
        q3: 'cameriere',
        q4: 'Marco',
        q5: 'tre mesi',
        sentence: ['posso', 'lavorare', 'subito'],
        // Блок 5: большой диалог
        d1: 'Marco',
        d2: 'Messina',
        d3: 'tre mesi',
        d4: 'cameriere',
        d5: 'Posso lavorare subito',
        // Блок 7: второе предложение
        sentence2: ['Sono', 'in', 'Italia', 'da', 'tre', 'mesi'],
        // Блок 8: заполнение текста
        t1: 'Marco',
        t2: 'Messina',
        t3: 'tre mesi',
        t4: 'cameriere',
        t5: 'Posso',
        // Блок 9: реакции
        r1: 'Mi chiamo Marco',
        r2: 'Posso iniziare subito',
        // Блок 10: ошибки
        e1: 'chiamo',
        e2: 'Messina'
    },
    sentenceOrder2: [],
    matchingAnswers: {},
    textFillAnswers: {},
    reactionAnswers: {},
    errorAnswers: {},
    
    // Функция для рандомизации массива (Fisher-Yates shuffle)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Функция для рандомизации вариантов ответов с сохранением правильного индекса
    shuffleOptions(options, correctValue) {
        // Создаем массив объектов с значениями и индексами
        const optionsWithIndex = options.map((value, index) => ({ value, originalIndex: index }));
        const shuffled = this.shuffleArray(optionsWithIndex);
        
        // Находим новый индекс правильного ответа
        const correctIndex = shuffled.findIndex(item => item.value === correctValue);
        
        return {
            shuffledOptions: shuffled.map(item => item.value),
            correctIndex: correctIndex
        };
    },
    quizQuestions: [
        {
            type: 'multiple',
            question: 'Сколько человек было в группе Marco на курсе?',
            options: ['Sette (семь)', 'Dieci (десять)', 'Cinque (пять)', 'Quindici (пятнадцать)'],
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
            question: 'Marco сказал работодателю "Posso lavorare domani" — это означает "Могу работать сразу"',
            correct: false
        },
        {
            type: 'multiple',
            question: 'Сколько длилось каждое занятие на курсе?',
            options: ['Novanta minuti (девяносто минут)', 'Sessanta minuti (шестьдесят минут)', 'Centoventi minuti (сто двадцать минут)', 'Trenta minuti (тридцать минут)'],
            correct: 0
        },
        {
            type: 'fill',
            question: 'Что означает фраза "Hai esperienza?"',
            options: ['У тебя есть опыт?', 'Где ты живешь?', 'Как тебя зовут?', 'Что ты ищешь?'],
            correct: 0
        },
        {
            type: 'multiple',
            question: 'Сколько времени Marco был в Италии, когда нашел работу?',
            options: ['Tre mesi (три месяца)', 'Un anno (один год)', 'Due settimane (две недели)', 'Sei mesi (шесть месяцев)'],
            correct: 0
        },
        {
            type: 'truefalse',
            question: 'Marco ответил работодателю, что у него уже есть опыт работы cameriere',
            correct: false
        },
        {
            type: 'fill',
            question: 'Какую зарплату получал Marco?',
            options: ['Novecento euro (девятьсот евро)', 'Mille euro (тысяча евро)', 'Cinquecento euro (пятьсот евро)', 'Duemila euro (две тысячи евро)'],
            correct: 0
        },
        {
            type: 'multiple',
            question: 'Как часто проходили занятия на курсе ILearning?',
            options: ['Tre volte a settimana (три раза в неделю)', 'Una volta a settimana (один раз в неделю)', 'Cinque volte a settimana (пять раз в неделю)', 'Due volte a settimana (два раза в неделю)'],
            correct: 0
        },
        {
            type: 'truefalse',
            question: 'Marco научился говорить по-итальянски за один месяц',
            correct: false
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
                this.shuffledOptions = savedProgress.shuffledOptions || {};
            }
        }

        // Генерируем рандомизированные варианты ответов
        this.generateShuffledOptions();
        
        this.setupEventListeners();
        this.showCurrentBlock();
    },
    
    // Генерация рандомизированных вариантов ответов для всех вопросов
    generateShuffledOptions() {
        // Блок 1: вопросы q1, q2, q3
        const q1Options = ['Marco', 'lavoro', 'tre mesi', 'domani'];
        const q2Options = ['Messina', 'lavorare', 'posso', 'subito'];
        const q3Options = ['cameriere', 'tre mesi', 'domani', 'lavorare'];
        
        // Блок 2: вопросы q4, q5
        const q4Options = ['Marco', 'tre mesi', 'lavoro', 'domani'];
        const q5Options = ['tre mesi', 'un anno', 'lavoro', 'domani'];
        
        // Блок 5: большой диалог
        const d1Options = ['Marco', 'Messina', 'tre mesi', 'cameriere'];
        const d2Options = ['Messina', 'Marco', 'lavorare', 'subito'];
        const d3Options = ['tre mesi', 'un anno', 'domani', 'lavoro'];
        const d4Options = ['cameriere', 'lavorare', 'tre mesi', 'domani'];
        const d5Options = ['Posso lavorare subito', 'Vivo a Messina', 'Mi chiamo Marco', 'Cerco lavoro'];
        
        // Блок 9: реакции
        const r1Options = ['Mi chiamo Marco', 'Vivo a Messina', 'Cerco lavoro', 'Posso lavorare'];
        const r2Options = ['Posso iniziare subito', 'Mi chiamo Marco', 'Vivo a Messina', 'Cerco lavoro'];
        
        // Блок 10: ошибки
        const e1Options = ['chiamo', 'vivo', 'cerco', 'lavoro'];
        const e2Options = ['Messina', 'lavorare', 'posso', 'subito'];
        
        this.shuffledOptions.q1 = this.shuffleOptions(q1Options, 'Marco');
        this.shuffledOptions.q2 = this.shuffleOptions(q2Options, 'Messina');
        this.shuffledOptions.q3 = this.shuffleOptions(q3Options, 'cameriere');
        this.shuffledOptions.q4 = this.shuffleOptions(q4Options, 'Marco');
        this.shuffledOptions.q5 = this.shuffleOptions(q5Options, 'tre mesi');
        this.shuffledOptions.d1 = this.shuffleOptions(d1Options, 'Marco');
        this.shuffledOptions.d2 = this.shuffleOptions(d2Options, 'Messina');
        this.shuffledOptions.d3 = this.shuffleOptions(d3Options, 'tre mesi');
        this.shuffledOptions.d4 = this.shuffleOptions(d4Options, 'cameriere');
        this.shuffledOptions.d5 = this.shuffleOptions(d5Options, 'Posso lavorare subito');
        this.shuffledOptions.r1 = this.shuffleOptions(r1Options, 'Mi chiamo Marco');
        this.shuffledOptions.r2 = this.shuffleOptions(r2Options, 'Posso iniziare subito');
        this.shuffledOptions.e1 = this.shuffleOptions(e1Options, 'chiamo');
        this.shuffledOptions.e2 = this.shuffleOptions(e2Options, 'Messina');
    },
    
    // Рендеринг вариантов ответов с рандомизацией
    renderOptions(containerId, questionId, correctValue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const shuffled = this.shuffledOptions[questionId];
        if (!shuffled) return;
        
        container.innerHTML = shuffled.shuffledOptions.map((option, index) => 
            `<label><input type="radio" name="${questionId}" value="${option}"> ${option}</label>`
        ).join('');
        
        // Добавляем обработчики событий
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleRadioChange(e.target);
            });
        });
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
            
            // Генерируем рандомизированные варианты ответов для соответствующих блоков
            if (this.currentBlock === 1) {
                setTimeout(() => {
                    this.renderOptions('options-q1', 'q1', 'Marco');
                    this.renderOptions('options-q2', 'q2', 'Messina');
                    this.renderOptions('options-q3', 'q3', 'cameriere');
                }, 100);
            } else if (this.currentBlock === 2) {
                setTimeout(() => {
                    this.renderOptions('options-q4', 'q4', 'Marco');
                    this.renderOptions('options-q5', 'q5', 'tre mesi');
                }, 100);
            } else if (this.currentBlock === 3) {
                setTimeout(() => {
                    this.setupDragAndDrop();
                }, 100);
            } else if (this.currentBlock === 5) {
                setTimeout(() => {
                    this.renderOptions('options-d1', 'd1', 'Marco');
                    this.renderOptions('options-d2', 'd2', 'Messina');
                    this.renderOptions('options-d3', 'd3', 'tre mesi');
                    this.renderOptions('options-d4', 'd4', 'cameriere');
                    this.renderOptions('options-d5', 'd5', 'Posso lavorare subito');
                }, 100);
            } else if (this.currentBlock === 6) {
                setTimeout(() => {
                    this.setupMatching();
                }, 100);
            } else if (this.currentBlock === 7) {
                setTimeout(() => {
                    this.setupSentenceBuilder2();
                }, 100);
            } else if (this.currentBlock === 8) {
                setTimeout(() => {
                    this.setupTextFill();
                }, 100);
            } else if (this.currentBlock === 9) {
                setTimeout(() => {
                    this.renderOptions('options-r1', 'r1', 'Mi chiamo Marco');
                    this.renderOptions('options-r2', 'r2', 'Posso iniziare subito');
                }, 100);
            } else if (this.currentBlock === 10) {
                setTimeout(() => {
                    this.renderOptions('options-e1', 'e1', 'chiamo');
                    this.renderOptions('options-e2', 'e2', 'Messina');
                }, 100);
            }
        } else if (this.currentBlock === 11) {
            // Финальный квиз (теперь это блок 11)
            this.showQuiz();
        }

        this.saveProgress();
    },

    handleRadioChange(radio) {
        const questionId = radio.name;
        const value = radio.value;
        let questionNum = questionId.replace('q', '');
        
        // Обработка разных типов вопросов
        if (questionId.startsWith('d')) {
            questionNum = questionId.replace('d', 'd');
        } else if (questionId.startsWith('r')) {
            questionNum = questionId.replace('r', 'r');
        } else if (questionId.startsWith('e')) {
            questionNum = questionId.replace('e', 'e');
        }
        
        const feedbackEl = document.getElementById(`feedback${questionNum}`);

        // Проверяем правильность ответа
        const isCorrect = this.correctAnswers[questionId] === value;

        if (isCorrect) {
            if (feedbackEl) {
                feedbackEl.innerHTML = '<span class="feedback-correct">✓ Правильно!</span>';
                feedbackEl.className = 'feedback correct';
            }
            const parent = radio.closest('.blank-item, .dialogue, .reaction-item, .error-item');
            if (parent) parent.classList.add('answered-correct');
        } else {
            if (feedbackEl) {
                feedbackEl.innerHTML = '<span class="feedback-incorrect">✗ Неправильно. Попробуй еще раз!</span>';
                feedbackEl.className = 'feedback incorrect';
            }
            const parent = radio.closest('.blank-item, .dialogue, .reaction-item, .error-item');
            if (parent) parent.classList.add('answered-incorrect');
        }

        // Сохраняем ответы для блоков 9 и 10
        if (questionId.startsWith('r')) {
            this.reactionAnswers[questionId] = value;
        } else if (questionId.startsWith('e')) {
            this.errorAnswers[questionId] = value;
        }

        // Проверяем, можно ли перейти дальше
        this.checkBlockCompletion();
        this.saveProgress();
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
        } else if (this.currentBlock === 5) {
            // Проверяем все 5 вопросов большого диалога
            const d1 = document.querySelector('input[name="d1"]:checked');
            const d2 = document.querySelector('input[name="d2"]:checked');
            const d3 = document.querySelector('input[name="d3"]:checked');
            const d4 = document.querySelector('input[name="d4"]:checked');
            const d5 = document.querySelector('input[name="d5"]:checked');
            allAnswered = d1 && d2 && d3 && d4 && d5;
            nextBtnId = 'nextBtn5';
        } else if (this.currentBlock === 6) {
            // Проверяем сопоставление
            allAnswered = Object.keys(this.matchingAnswers).length === 4;
            nextBtnId = 'nextBtn6';
        } else if (this.currentBlock === 7) {
            // Проверяем второе предложение
            allAnswered = this.sentenceOrder2.length === 6;
            nextBtnId = 'nextBtn7';
        } else if (this.currentBlock === 8) {
            // Проверяем заполнение текста
            allAnswered = Object.keys(this.textFillAnswers).length === 5;
            nextBtnId = 'nextBtn8';
        } else if (this.currentBlock === 9) {
            // Проверяем реакции
            const r1 = document.querySelector('input[name="r1"]:checked');
            const r2 = document.querySelector('input[name="r2"]:checked');
            allAnswered = r1 && r2;
            nextBtnId = 'nextBtn9';
        } else if (this.currentBlock === 10) {
            // Проверяем поиск ошибок
            const e1 = document.querySelector('input[name="e1"]:checked');
            const e2 = document.querySelector('input[name="e2"]:checked');
            allAnswered = e1 && e2;
            nextBtnId = 'nextBtn10';
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
        if (this.currentBlock < 10) {
            this.currentBlock++;
            this.showCurrentBlock();
        } else if (this.currentBlock === 10) {
            // Переход к квизу (теперь это блок 11)
            this.currentBlock = 11;
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

        if (question.type === 'multiple' || question.type === 'fill') {
            // Рандомизируем варианты ответов для квиза
            const shuffled = this.shuffleArray([...question.options]);
            const correctIndex = shuffled.findIndex(opt => opt === question.options[question.correct]);
            
            html += '<div class="quiz-options">';
            shuffled.forEach((option, index) => {
                const isChecked = this.quizAnswers[this.currentQuizQuestion] === index;
                html += `
                    <label class="quiz-option ${isChecked ? 'selected' : ''}">
                        <input type="radio" name="quiz" value="${index}" ${isChecked ? 'checked' : ''} data-correct-index="${correctIndex}">
                        ${option}
                    </label>
                `;
            });
            html += '</div>';
            
            // Сохраняем правильный индекс после рандомизации
            question.shuffledCorrectIndex = correctIndex;
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
                let value;
                if (question.type === 'truefalse') {
                    value = e.target.value === 'true';
                } else {
                    // Используем сохраненный правильный индекс после рандомизации
                    const selectedIndex = parseInt(e.target.value);
                    value = selectedIndex;
                }
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
                // Используем сохраненный правильный индекс после рандомизации
                const correctIndex = question.shuffledCorrectIndex !== undefined 
                    ? question.shuffledCorrectIndex 
                    : question.correct;
                if (userAnswer === correctIndex) correct++;
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

    // Блок 6: Сопоставление фраз
    setupMatching() {
        const items = document.querySelectorAll('#matching1 .matching-item');
        const targets = document.querySelectorAll('#matching1 .matching-target');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.value);
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '';
            });
        });
        
        targets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                target.style.background = '#e0f2fe';
            });
            
            target.addEventListener('dragleave', () => {
                target.style.background = '';
            });
            
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.style.background = '';
                const value = e.dataTransfer.getData('text/plain');
                const correct = target.dataset.correct;
                
                if (value === correct) {
                    target.innerHTML = `<strong>${value}</strong>`;
                    target.style.background = '#d1fae5';
                    target.style.border = '2px solid #10b981';
                    this.matchingAnswers[correct] = true;
                } else {
                    target.style.background = '#fee2e2';
                    target.style.border = '2px solid #ef4444';
                    setTimeout(() => {
                        target.style.background = '';
                        target.style.border = '';
                    }, 1000);
                }
                
                this.checkBlockCompletion();
                this.saveProgress();
            });
        });
    },
    
    // Блок 7: Второе предложение
    setupSentenceBuilder2() {
        const words = document.querySelectorAll('#wordsContainer2 .word');
        words.forEach(word => {
            word.addEventListener('click', (e) => {
                const wordValue = e.target.dataset.word;
                if (this.sentenceOrder2.includes(wordValue)) return;
                
                this.sentenceOrder2.push(wordValue);
                e.target.classList.add('used');
                this.updateSentenceDisplay2();
                this.checkSentence2();
                this.saveProgress();
            });
        });
    },
    
    updateSentenceDisplay2() {
        const container = document.getElementById('sentenceWords2');
        if (container) {
            container.innerHTML = this.sentenceOrder2.map(word => 
                `<span class="sentence-word">${word}</span>`
            ).join(' ');
        }
    },
    
    checkSentence2() {
        const correct = this.correctAnswers.sentence2;
        const feedback = document.getElementById('feedback-s2');
        const nextBtn = document.getElementById('nextBtn7');
        
        if (this.sentenceOrder2.length === correct.length) {
            const isCorrect = JSON.stringify(this.sentenceOrder2) === JSON.stringify(correct);
            if (isCorrect) {
                feedback.innerHTML = '<span class="feedback-correct">✓ Отлично! Правильное предложение: Sono in Italia da tre mesi</span>';
                feedback.className = 'feedback correct';
                if (nextBtn) nextBtn.disabled = false;
            } else {
                feedback.innerHTML = '<span class="feedback-incorrect">✗ Не совсем правильно. Попробуй еще раз!</span>';
                feedback.className = 'feedback incorrect';
            }
        }
    },
    
    resetSentence2() {
        this.sentenceOrder2 = [];
        document.querySelectorAll('#wordsContainer2 .word').forEach(word => {
            word.classList.remove('used');
        });
        const container = document.getElementById('sentenceWords2');
        if (container) container.innerHTML = '';
        const feedback = document.getElementById('feedback-s2');
        if (feedback) {
            feedback.innerHTML = '';
            feedback.className = 'feedback';
        }
        const nextBtn = document.getElementById('nextBtn7');
        if (nextBtn) nextBtn.disabled = true;
        this.saveProgress();
    },
    
    // Блок 8: Заполнение текста
    setupTextFill() {
        const blanks = ['t1', 't2', 't3', 't4', 't5'];
        const options = ['Marco', 'Messina', 'tre mesi', 'cameriere', 'Posso'];
        const shuffled = this.shuffleArray([...options]);
        
        const container = document.getElementById('textFillOptions');
        if (container) {
            container.innerHTML = shuffled.map(opt => 
                `<button class="text-fill-option" data-value="${opt}" onclick="TrialLesson.selectTextFill('${opt}')">${opt}</button>`
            ).join('');
        }
        
        blanks.forEach(blankId => {
            const blank = document.getElementById(`blank-${blankId}`);
            if (blank) {
                blank.addEventListener('click', () => {
                    this.selectedBlank = blankId;
                });
            }
        });
    },
    
    selectTextFill(value) {
        if (!this.selectedBlank) return;
        
        const blankId = this.selectedBlank;
        const blank = document.getElementById(`blank-${blankId}`);
        const correct = this.correctAnswers[blankId];
        
        if (blank) {
            blank.textContent = value;
            blank.style.background = value === correct ? '#d1fae5' : '#fee2e2';
            blank.style.padding = '0.25rem 0.5rem';
            blank.style.borderRadius = '4px';
            
            this.textFillAnswers[blankId] = value;
            
            if (value === correct) {
                blank.style.border = '2px solid #10b981';
            } else {
                blank.style.border = '2px solid #ef4444';
            }
            
            this.checkBlockCompletion();
            this.saveProgress();
        }
    },
    
    // Функция для показа/скрытия подсказок
    toggleHint(hintId) {
        const hint = document.getElementById(hintId);
        const toggle = document.getElementById('hintToggle' + hintId.replace('hint', ''));
        
        if (!hint || !toggle) return;
        
        const isVisible = hint.style.display !== 'none';
        
        if (isVisible) {
            hint.style.display = 'none';
            toggle.innerHTML = '<span class="eye-icon">👁️</span> <span class="hint-text">Показать подсказку</span>';
        } else {
            hint.style.display = 'block';
            toggle.innerHTML = '<span class="eye-icon">👁️‍🗨️</span> <span class="hint-text">Скрыть подсказку</span>';
        }
    },
    
    saveProgress() {
        if (typeof StateManager !== 'undefined') {
            StateManager.save('trial_lesson_progress', {
                currentBlock: this.currentBlock,
                currentQuizQuestion: this.currentQuizQuestion,
                quizAnswers: this.quizAnswers,
                sentenceOrder: this.sentenceOrder,
                sentenceOrder2: this.sentenceOrder2,
                shuffledOptions: this.shuffledOptions,
                matchingAnswers: this.matchingAnswers,
                textFillAnswers: this.textFillAnswers,
                reactionAnswers: this.reactionAnswers,
                errorAnswers: this.errorAnswers
            });
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    TrialLesson.init();
    
    // Вид преподавателя доступен только через платформу преподавателя
    // Проверяем URL параметры для автоматического переключения вида (только если вызвано из платформы)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'teacher') {
        // Разрешаем доступ только если вызвано из платформы
        TrialLesson.switchToTeacher();
    }
});

window.TrialLesson = TrialLesson;

