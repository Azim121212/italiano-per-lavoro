// Student Dashboard Logic
const StudentDashboard = {
    currentUser: null,
    currentCourse: null,

    init() {
        this.currentUser = PlatformAPI.getCurrentUser();
        
        // Строгая проверка роли
        if (!this.currentUser) {
            console.error('Пользователь не найден');
            return;
        }
        
        if (this.currentUser.role !== 'student') {
            console.error('Неверная роль для студентского дашборда:', this.currentUser.role);
            // Скрываем дашборд, если роль не совпадает
            const dashboard = document.getElementById('studentDashboard');
            if (dashboard) {
                dashboard.style.display = 'none';
            }
            return;
        }

        const studentNameEl = document.getElementById('studentName');
        if (studentNameEl) {
            studentNameEl.textContent = this.currentUser.name;
        }
        
        this.loadCourses();
        this.loadProgress();
        this.loadGrades();
        this.loadLeaderboard();
        this.initNavigation();
        this.initLogout();
    },

    initNavigation() {
        const navItems = document.querySelectorAll('#studentDashboard .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                
                // Если это внешняя ссылка (без data-section), не обрабатываем
                if (!section) {
                    return; // Позволяем браузеру обработать ссылку нормально
                }
                
                e.preventDefault();
                
                navItems.forEach(nav => {
                    // Убираем active только у внутренних ссылок
                    if (nav.dataset.section) {
                        nav.classList.remove('active');
                    }
                });
                item.classList.add('active');
                
                this.showSection(section);
                
                // Сохраняем активную секцию
                if (typeof StateManager !== 'undefined') {
                    StateManager.saveActiveSection(section);
                }
            });
        });
    },

    showSection(sectionName) {
        const sections = document.querySelectorAll('#studentDashboard .content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            
            if (sectionName === 'courses') {
                this.loadCourses();
            } else if (sectionName === 'progress') {
                this.loadProgress();
            } else if (sectionName === 'grades') {
                this.loadGrades();
            } else if (sectionName === 'leaderboard') {
                this.loadLeaderboard();
            }
        }
    },

    loadCourses() {
        const courses = PlatformAPI.getCourses();
        const container = document.getElementById('studentCourses');
        
        let html = '';
        
        // Добавляем карточку пробного урока
        html += `
            <div class="course-card trial-lesson-card" onclick="window.open('../trial-lesson/index.html', '_blank')" style="border: 2px solid #10b981; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2.5rem;">🎓</span>
                    <div>
                        <h3 style="margin: 0; color: #059669;">Пробный урок</h3>
                        <p style="margin: 0.5rem 0 0 0; color: #047857; font-weight: 500;">Prova gratuita — Lezione introduttiva di italiano</p>
                    </div>
                </div>
                <p style="color: #065f46; margin-bottom: 1rem;">
                    Познакомься с базовыми фразами для жизни и работы в Италии. 
                    Интерактивные задания, диалоги и финальный квиз.
                </p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                    <span style="background: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; color: #059669;">Бесплатно</span>
                    <span style="background: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; color: #059669;">~55 минут</span>
                    <span style="background: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; color: #059669;">Интерактивно</span>
                </div>
                <button class="btn btn-primary" style="margin-top: 1rem; width: 100%; background: #10b981; border-color: #10b981;" onclick="event.stopPropagation(); window.open('../trial-lesson/index.html', '_blank')">
                    Начать пробный урок →
                </button>
            </div>
        `;
        
        if (courses.length === 0) {
            container.innerHTML = html + '<p>Нет доступных курсов</p>';
            return;
        }

        const course = courses[0]; // Первый курс
        this.currentCourse = course;
        const modules = PlatformAPI.getModules(course.id);
        const progress = PlatformAPI.getStudentProgress(this.currentUser.id, course.id);

        html += `
            <div class="course-card" onclick="StudentDashboard.openCourse(${course.id})">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress ? progress.progress : 0}%"></div>
                    </div>
                    <span class="progress-text">Прогресс: ${progress ? progress.progress : 0}%</span>
                </div>
                <p style="margin-top: 1rem; color: var(--text-light);">
                    Модулей: ${modules.length} | 
                    Уроков завершено: ${progress ? progress.completedLessons : 0}/${progress ? progress.totalLessons : 0}
                </p>
            </div>
        `;
        
        container.innerHTML = html;
    },

    openCourse(courseId) {
        const course = PlatformAPI.getCourses().find(c => c.id === courseId);
        if (!course) return;

        const modules = PlatformAPI.getModules(courseId);
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');

        let modulesHtml = '';
        modules.forEach(module => {
            const lessons = PlatformAPI.getLessons(module.id);
            const lessonsHtml = lessons.map(lesson => {
                const assignments = PlatformAPI.getAssignments(lesson.id);
                const answers = PlatformAPI.getStudentAnswers(this.currentUser.id, lesson.id);
                const completed = answers.filter(a => a.answer).length;
                const progress = assignments.length > 0 ? (completed / assignments.length) * 100 : 0;

                return `
                    <div class="lesson-item" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;" 
                         onclick="StudentDashboard.openLesson(${lesson.id})">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Урок ${lesson.order}: ${lesson.title}</strong>
                                <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem;">
                                    ${assignments.length} заданий | ${lesson.points} очков
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div class="progress-bar small" style="width: 100px; margin-bottom: 0.25rem;">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span style="font-size: 0.875rem; color: var(--text-light);">${Math.round(progress)}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            modulesHtml += `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">${module.name}</h3>
                    ${lessonsHtml}
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${course.name}</h3>
                <button class="btn-icon" onclick="StudentDashboard.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div class="modal-body">
                ${modulesHtml}
            </div>
        `;

        overlay.style.display = 'flex';
    },

    openLesson(lessonId) {
        const lesson = PlatformAPI.getLesson(lessonId);
        if (!lesson) return;

        const assignments = PlatformAPI.getAssignments(lessonId);
        const answers = PlatformAPI.getStudentAnswers(this.currentUser.id, lessonId);
        const answersMap = {};
        answers.forEach(a => {
            answersMap[a.assignmentId] = a;
        });

        // Скрываем дашборд и показываем урок
        document.getElementById('studentDashboard').style.display = 'none';
        document.getElementById('lessonView').style.display = 'flex';
        
        // Сохраняем открытый урок
        if (typeof StateManager !== 'undefined') {
            StateManager.save('open_lesson_id', lessonId);
        }
        
        document.getElementById('lessonTitle').textContent = lesson.title;
        
        const lessonContent = document.querySelector('#lessonView .lesson-content');
        let assignmentsHtml = '';

        assignments.forEach((assignment, index) => {
            const answer = answersMap[assignment.id];
            const answerValue = answer ? answer.answer : '';
            const isGraded = answer && answer.graded;

            let assignmentHtml = `
                <div class="assignment-item">
                    <h4>Задание ${index + 1}: ${assignment.type === 'text' ? 'Текстовое задание' : assignment.type === 'quiz' ? 'Quiz' : 'Интерактивное задание'}</h4>
                    <p>${assignment.question}</p>
                    <p style="font-size: 0.875rem; color: var(--text-light);">Очки: ${assignment.points}</p>
            `;

            if (assignment.type === 'text') {
                assignmentHtml += `
                    <div class="assignment-answer">
                        <textarea id="answer_${assignment.id}" placeholder="Введите ваш ответ..." ${isGraded ? 'disabled' : ''}>${answerValue}</textarea>
                        ${!isGraded ? `<button class="btn btn-primary" onclick="StudentDashboard.submitAnswer(${assignment.id})" style="margin-top: 0.5rem;">Отправить ответ</button>` : ''}
                    </div>
                `;
            } else if (assignment.type === 'quiz') {
                assignmentHtml += '<div class="quiz-options">';
                assignment.options.forEach((option, optIndex) => {
                    const isSelected = answerValue === optIndex.toString();
                    const isCorrect = isGraded && assignment.correctAnswer === optIndex;
                    const isIncorrect = isGraded && isSelected && assignment.correctAnswer !== optIndex;
                    
                    let classes = 'quiz-option';
                    if (isSelected) classes += ' selected';
                    if (isCorrect) classes += ' correct';
                    if (isIncorrect) classes += ' incorrect';

                    assignmentHtml += `
                        <div class="${classes}" 
                             onclick="${!isGraded ? `StudentDashboard.selectQuizOption(${assignment.id}, ${optIndex})` : ''}"
                             id="option_${assignment.id}_${optIndex}">
                            ${option}
                            ${isCorrect ? ' ✓' : ''}
                            ${isIncorrect ? ' ✗' : ''}
                        </div>
                    `;
                });
                assignmentHtml += '</div>';
                if (!isGraded && answerValue) {
                    assignmentHtml += `<button class="btn btn-primary" onclick="StudentDashboard.submitAnswer(${assignment.id})" style="margin-top: 1rem;">Отправить ответ</button>`;
                }
            } else if (assignment.type === 'interactive') {
                assignmentHtml += '<div class="interactive-quiz">';
                assignmentHtml += '<h3>Интерактивная викторина</h3>';
                assignmentHtml += '<div class="quiz-options">';
                assignment.options.forEach((option, optIndex) => {
                    const isSelected = answerValue === optIndex.toString();
                    const isCorrect = isGraded && assignment.correctAnswer === optIndex;
                    const isIncorrect = isGraded && isSelected && assignment.correctAnswer !== optIndex;
                    
                    let classes = 'quiz-option';
                    if (isSelected) classes += ' selected';
                    if (isCorrect) classes += ' correct';
                    if (isIncorrect) classes += ' incorrect';

                    assignmentHtml += `
                        <div class="${classes}" 
                             onclick="${!isGraded ? `StudentDashboard.selectQuizOption(${assignment.id}, ${optIndex})` : ''}"
                             id="option_${assignment.id}_${optIndex}">
                            ${option}
                            ${isCorrect ? ' ✓' : ''}
                            ${isIncorrect ? ' ✗' : ''}
                        </div>
                    `;
                });
                assignmentHtml += '</div></div>';
                if (!isGraded && answerValue) {
                    assignmentHtml += `<button class="btn btn-primary" onclick="StudentDashboard.submitAnswer(${assignment.id})" style="margin-top: 1rem; background: white; color: var(--primary-color);">Отправить ответ</button>`;
                }
            }

            if (isGraded && answer.feedback) {
                assignmentHtml += `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-alt); border-radius: 8px;">
                        <strong>Оценка: ${answer.score}/${assignment.points}</strong>
                        ${answer.feedback ? `<p style="margin-top: 0.5rem;">${answer.feedback}</p>` : ''}
                    </div>
                `;
            }

            assignmentHtml += '</div>';
            assignmentsHtml += assignmentHtml;
        });

        const completed = answers.filter(a => a.answer).length;
        const progress = assignments.length > 0 ? (completed / assignments.length) * 100 : 0;

        lessonContent.innerHTML = `
            <div class="lesson-theory">
                ${lesson.content.split('\n').map(line => {
                    if (line.startsWith('# ')) {
                        return `<h2>${line.substring(2)}</h2>`;
                    } else if (line.startsWith('## ')) {
                        return `<h3>${line.substring(3)}</h3>`;
                    } else if (line.startsWith('- ')) {
                        return `<li>${line.substring(2)}</li>`;
                    } else if (line.trim() === '') {
                        return '<br>';
                    } else {
                        return `<p>${line}</p>`;
                    }
                }).join('')}
            </div>
            <div style="margin-top: 2rem;">
                <h3>Задания</h3>
                ${assignmentsHtml}
            </div>
        `;

        document.getElementById('lessonProgressFill').style.width = progress + '%';
        document.getElementById('lessonProgressText').textContent = Math.round(progress) + '%';
    },

    selectQuizOption(assignmentId, optionIndex) {
        const answerInput = document.getElementById(`answer_${assignmentId}`);
        if (answerInput) {
            answerInput.value = optionIndex;
        }

        // Обновляем визуальное выделение
        const options = document.querySelectorAll(`[id^="option_${assignmentId}_"]`);
        options.forEach((opt, idx) => {
            opt.classList.remove('selected');
            if (idx === optionIndex) {
                opt.classList.add('selected');
            }
        });
    },

    submitAnswer(assignmentId) {
        const assignment = PlatformAPI.getAssignment(assignmentId);
        if (!assignment) return;

        let answerValue = '';
        if (assignment.type === 'text') {
            const textarea = document.getElementById(`answer_${assignmentId}`);
            answerValue = textarea.value.trim();
        } else if (assignment.type === 'quiz' || assignment.type === 'interactive') {
            const selectedOption = document.querySelector(`[id^="option_${assignment.id}_"].selected`);
            if (selectedOption) {
                const optionId = selectedOption.id.split('_').pop();
                answerValue = optionId;
            }
        }

        if (!answerValue) {
            alert('Пожалуйста, заполните ответ');
            return;
        }

        // Автоматическая проверка для quiz и interactive
        if ((assignment.type === 'quiz' || assignment.type === 'interactive') && assignment.correctAnswer !== null) {
            const isCorrect = parseInt(answerValue) === assignment.correctAnswer;
            const score = isCorrect ? assignment.points : 0;
            PlatformAPI.saveStudentAnswer(this.currentUser.id, assignmentId, answerValue);
            PlatformAPI.gradeAssignment(
                PlatformAPI.getAllStudentAnswers(this.currentUser.id).find(a => a.assignmentId === assignmentId).id,
                score,
                isCorrect ? 'Правильно!' : 'Неправильно. Попробуйте ещё раз.'
            );
        } else {
            PlatformAPI.saveStudentAnswer(this.currentUser.id, assignmentId, answerValue);
        }

        // Обновляем урок
        const lessonId = assignment.lessonId;
        this.openLesson(lessonId);
        
        // Обновляем прогресс
        this.loadProgress();
        this.updatePoints();
    },

    loadProgress() {
        if (!this.currentCourse) return;

        const progress = PlatformAPI.getStudentProgress(this.currentUser.id, this.currentCourse.id);
        if (!progress) return;

        document.getElementById('overallProgress').querySelector('.progress-fill').style.width = progress.progress + '%';
        document.getElementById('overallProgressText').textContent = progress.progress + '%';
        document.getElementById('completedLessons').textContent = progress.completedLessons;
        document.getElementById('totalPoints').textContent = progress.totalPoints;
        document.getElementById('averageGrade').textContent = progress.averageScore + '%';
    },

    loadGrades() {
        const answers = PlatformAPI.getAllStudentAnswers(this.currentUser.id);
        const gradedAnswers = answers.filter(a => a.graded);
        const container = document.getElementById('gradesList');

        if (gradedAnswers.length === 0) {
            container.innerHTML = '<p>Пока нет оценок</p>';
            return;
        }

        container.innerHTML = gradedAnswers.map(answer => {
            const assignment = PlatformAPI.getAssignment(answer.assignmentId);
            const lesson = assignment ? PlatformAPI.getLesson(assignment.lessonId) : null;
            
            return `
                <div class="grade-item">
                    <div class="grade-info">
                        <h4>${lesson ? lesson.title : 'Задание'}</h4>
                        <p>${assignment ? assignment.question.substring(0, 50) + '...' : ''}</p>
                        ${answer.feedback ? `<p style="margin-top: 0.5rem; font-size: 0.875rem;">${answer.feedback}</p>` : ''}
                    </div>
                    <div class="grade-score">${answer.score}/${assignment ? assignment.points : 0}</div>
                </div>
            `;
        }).join('');
    },

    loadLeaderboard() {
        if (!this.currentUser.groupId) {
            document.getElementById('leaderboard').innerHTML = '<p>Вы не привязаны к группе</p>';
            return;
        }

        const leaderboard = PlatformAPI.getGroupLeaderboard(this.currentUser.groupId);
        const container = document.getElementById('leaderboard');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p>Нет данных для рейтинга</p>';
            return;
        }

        container.innerHTML = leaderboard.map((item, index) => {
            const isCurrentUser = item.studentId === this.currentUser.id;
            const rankClass = index < 3 ? 'top' : '';
            
            return `
                <div class="leaderboard-item" style="${isCurrentUser ? 'background: #eff6ff;' : ''}">
                    <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                    <div class="leaderboard-name">${item.name} ${isCurrentUser ? '(Вы)' : ''}</div>
                    <div class="leaderboard-points">${item.points} очков</div>
                </div>
            `;
        }).join('');
    },

    updatePoints() {
        if (!this.currentCourse) return;
        const progress = PlatformAPI.getStudentProgress(this.currentUser.id, this.currentCourse.id);
        if (progress) {
            document.getElementById('studentPoints').textContent = progress.totalPoints + ' очков';
        }
    },

    initLogout() {
        document.getElementById('studentLogout').addEventListener('click', () => {
            PlatformAPI.logout();
            window.location.reload();
        });
    },

    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    },

    backToCourses() {
        document.getElementById('lessonView').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'flex';
        this.loadCourses();
        
        // Удаляем сохраненный открытый урок
        if (typeof StateManager !== 'undefined') {
            StateManager.remove('open_lesson_id');
        }
    }
};

// Инициализация при загрузке
if (document.getElementById('studentDashboard')) {
    document.getElementById('backToCourses')?.addEventListener('click', () => {
        StudentDashboard.backToCourses();
    });
}

window.StudentDashboard = StudentDashboard;

