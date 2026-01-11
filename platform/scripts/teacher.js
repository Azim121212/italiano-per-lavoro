// Teacher Dashboard Logic
const TeacherDashboard = {
    currentUser: null,

    init() {
        this.currentUser = PlatformAPI.getCurrentUser();
        
        // Строгая проверка роли
        if (!this.currentUser) {
            console.error('Пользователь не найден');
            return;
        }
        
        if (this.currentUser.role !== 'teacher') {
            console.error('Неверная роль для преподавательского дашборда:', this.currentUser.role);
            // Скрываем дашборд, если роль не совпадает
            const dashboard = document.getElementById('teacherDashboard');
            if (dashboard) {
                dashboard.style.display = 'none';
            }
            return;
        }

        const teacherNameEl = document.getElementById('teacherName');
        if (teacherNameEl) {
            teacherNameEl.textContent = this.currentUser.name;
        }
        
        this.loadGroups();
        this.loadLessons();
        this.loadAssignments();
        this.loadStatistics();
        this.initNavigation();
        this.initLogout();
    },

    initNavigation() {
        const navItems = document.querySelectorAll('#teacherDashboard .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                
                navItems.forEach(nav => nav.classList.remove('active'));
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
        const sections = document.querySelectorAll('#teacherDashboard .content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            
            if (sectionName === 'groups') {
                this.loadGroups();
            } else if (sectionName === 'lessons') {
                this.loadLessons();
            } else if (sectionName === 'assignments') {
                this.loadAssignments();
            } else if (sectionName === 'statistics') {
                this.loadStatistics();
            }
        }
    },

    loadGroups() {
        const groups = PlatformAPI.getGroups();
        const teacherGroups = groups.filter(g => g.teacherId === this.currentUser.id);
        const container = document.getElementById('teacherGroups');

        if (teacherGroups.length === 0) {
            container.innerHTML = '<p>У вас нет групп</p>';
            return;
        }

        container.innerHTML = teacherGroups.map(group => {
            const students = PlatformAPI.getGroupStudents(group.id);
            const course = PlatformAPI.getCourses().find(c => c.id === group.courseId);
            
            return `
                <div class="group-card" onclick="TeacherDashboard.openGroup(${group.id})">
                    <h3>${group.name}</h3>
                    <p>${course ? course.name : ''}</p>
                    <div class="group-stats">
                        <span>👥 ${students.length} студентов</span>
                        <span>📚 ${course ? course.name : ''}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    openGroup(groupId) {
        const group = PlatformAPI.getGroup(groupId);
        if (!group) return;

        const students = PlatformAPI.getGroupStudents(groupId);
        const course = PlatformAPI.getCourses().find(c => c.id === group.courseId);
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');

        const studentsHtml = students.map(student => {
            const progress = course ? PlatformAPI.getStudentProgress(student.id, course.id) : null;
            const answers = PlatformAPI.getAllStudentAnswers(student.id);
            const totalPoints = answers.reduce((sum, a) => sum + (a.score || 0), 0);

            return `
                <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${student.name}</strong>
                            <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem;">
                                ${progress ? `Прогресс: ${progress.progress}%` : ''} | 
                                Очков: ${totalPoints}
                            </p>
                        </div>
                        <button class="btn btn-primary" onclick="TeacherDashboard.viewStudentProgress(${student.id})">
                            Просмотр прогресса
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${group.name}</h3>
                <button class="btn-icon" onclick="TeacherDashboard.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div class="modal-body">
                <h4>Студенты группы (${students.length})</h4>
                ${studentsHtml}
            </div>
        `;

        overlay.style.display = 'flex';
    },

    viewStudentProgress(studentId) {
        const student = PlatformAPI.getUsers().find(u => u.id === studentId);
        if (!student) return;

        const course = PlatformAPI.getCourses()[0];
        if (!course) return;

        const progress = PlatformAPI.getStudentProgress(studentId, course.id);
        const modules = PlatformAPI.getModules(course.id);
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');

        let modulesHtml = '';
        modules.forEach(module => {
            const lessons = PlatformAPI.getLessons(module.id);
            const lessonsHtml = lessons.map(lesson => {
                const assignments = PlatformAPI.getAssignments(lesson.id);
                const answers = PlatformAPI.getStudentAnswers(studentId, lesson.id);
                const completed = answers.filter(a => a.answer).length;
                const progressPercent = assignments.length > 0 ? (completed / assignments.length) * 100 : 0;

                return `
                    <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Урок ${lesson.order}: ${lesson.title}</strong>
                                <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem;">
                                    Заданий выполнено: ${completed}/${assignments.length}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div class="progress-bar small" style="width: 100px; margin-bottom: 0.25rem;">
                                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <span style="font-size: 0.875rem; color: var(--text-light);">${Math.round(progressPercent)}%</span>
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="TeacherDashboard.viewStudentLesson(${studentId}, ${lesson.id})" style="margin-top: 0.5rem;">
                            Просмотр заданий
                        </button>
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
                <h3>Прогресс студента: ${student.name}</h3>
                <button class="btn-icon" onclick="TeacherDashboard.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 2rem;">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${progress ? progress.completedLessons : 0}</div>
                            <div class="stat-label">Завершено уроков</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${progress ? progress.totalPoints : 0}</div>
                            <div class="stat-label">Всего очков</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${progress ? progress.progress : 0}%</div>
                            <div class="stat-label">Прогресс</div>
                        </div>
                    </div>
                </div>
                ${modulesHtml}
            </div>
        `;

        overlay.style.display = 'flex';
    },

    viewStudentLesson(studentId, lessonId) {
        const student = PlatformAPI.getUsers().find(u => u.id === studentId);
        const lesson = PlatformAPI.getLesson(lessonId);
        if (!student || !lesson) return;

        const assignments = PlatformAPI.getAssignments(lessonId);
        const answers = PlatformAPI.getStudentAnswers(studentId, lessonId);
        const answersMap = {};
        answers.forEach(a => {
            answersMap[a.assignmentId] = a;
        });

        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');

        const assignmentsHtml = assignments.map((assignment, index) => {
            const answer = answersMap[assignment.id];
            const answerValue = answer ? answer.answer : '';

            let answerDisplay = '';
            if (assignment.type === 'text') {
                answerDisplay = answerValue || 'Ответ не предоставлен';
            } else if (assignment.type === 'quiz' || assignment.type === 'interactive') {
                if (answerValue !== '') {
                    const selectedOption = assignment.options ? assignment.options[parseInt(answerValue)] : 'Неизвестно';
                    answerDisplay = selectedOption;
                } else {
                    answerDisplay = 'Ответ не предоставлен';
                }
            }

            return `
                <div class="assignment-submission">
                    <div class="assignment-submission-header">
                        <div>
                            <h4>Задание ${index + 1}: ${assignment.question}</h4>
                            <p style="color: var(--text-light); font-size: 0.875rem;">Очки: ${assignment.points}</p>
                        </div>
                    </div>
                    <div class="assignment-answer-text">
                        <strong>Ответ студента:</strong>
                        <p style="margin-top: 0.5rem;">${answerDisplay}</p>
                    </div>
                    ${answer && answer.graded ? `
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-alt); border-radius: 8px;">
                            <strong>Оценка: ${answer.score}/${assignment.points}</strong>
                            ${answer.feedback ? `<p style="margin-top: 0.5rem;">${answer.feedback}</p>` : ''}
                        </div>
                    ` : `
                        <div class="grading-form">
                            <label>Оценка (0-${assignment.points}):</label>
                            <input type="number" id="score_${answer ? answer.id : assignment.id}" min="0" max="${assignment.points}" value="${answer && answer.score !== null ? answer.score : ''}" step="0.5">
                            <label>Комментарий:</label>
                            <textarea id="feedback_${answer ? answer.id : assignment.id}" placeholder="Введите комментарий...">${answer && answer.feedback ? answer.feedback : ''}</textarea>
                            <button class="btn btn-primary" onclick="TeacherDashboard.gradeAnswer(${answer ? answer.id : assignment.id}, ${assignment.id}, ${studentId})">
                                ${answer ? 'Обновить оценку' : 'Поставить оценку'}
                            </button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="modal-header">
                <h3>Задания урока: ${lesson.title}</h3>
                <p style="font-size: 0.875rem; color: var(--text-light);">Студент: ${student.name}</p>
                <button class="btn-icon" onclick="TeacherDashboard.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div class="modal-body">
                ${assignmentsHtml}
            </div>
        `;

        overlay.style.display = 'flex';
    },

    gradeAnswer(answerId, assignmentId, studentId) {
        const scoreInput = document.getElementById(`score_${answerId}`);
        const feedbackInput = document.getElementById(`feedback_${answerId}`);

        const score = parseFloat(scoreInput.value);
        const feedback = feedbackInput.value.trim();

        if (isNaN(score) || score < 0) {
            alert('Пожалуйста, введите корректную оценку');
            return;
        }

        const assignment = PlatformAPI.getAssignment(assignmentId);
        if (score > assignment.points) {
            alert(`Оценка не может превышать ${assignment.points}`);
            return;
        }

        // Если ответа еще нет, создаем его
        let answer = PlatformAPI.getAllStudentAnswers(studentId).find(a => a.assignmentId === assignmentId);
        if (!answer) {
            PlatformAPI.saveStudentAnswer(studentId, assignmentId, '');
            answer = PlatformAPI.getAllStudentAnswers(studentId).find(a => a.assignmentId === assignmentId);
        }

        PlatformAPI.gradeAssignment(answer.id, score, feedback);
        
        // Обновляем модальное окно
        const lesson = assignment ? PlatformAPI.getLesson(assignment.lessonId) : null;
        if (lesson) {
            this.viewStudentLesson(studentId, lesson.id);
        }
        
        // Обновляем список заданий
        this.loadAssignments();
    },

    loadLessons() {
        const course = PlatformAPI.getCourses()[0];
        if (!course) {
            document.getElementById('lessonsList').innerHTML = '<p>Нет курсов</p>';
            return;
        }

        const modules = PlatformAPI.getModules(course.id);
        const container = document.getElementById('lessonsList');

        let lessonsHtml = '';
        modules.forEach(module => {
            const lessons = PlatformAPI.getLessons(module.id);
            const moduleLessonsHtml = lessons.map(lesson => {
                const assignments = PlatformAPI.getAssignments(lesson.id);
                return `
                    <div style="padding: 1.5rem; background: white; border-radius: 8px; margin-bottom: 1rem; box-shadow: var(--shadow);">
                        <h3>Урок ${lesson.order}: ${lesson.title}</h3>
                        <p style="color: var(--text-light); margin-top: 0.5rem;">
                            ${assignments.length} заданий | ${lesson.points} очков | ${lesson.duration} минут
                        </p>
                    </div>
                `;
            }).join('');

            lessonsHtml += `
                <div style="margin-bottom: 2rem;">
                    <h2 style="margin-bottom: 1rem; color: var(--primary-color);">${module.name}</h2>
                    ${moduleLessonsHtml}
                </div>
            `;
        });

        container.innerHTML = lessonsHtml || '<p>Нет уроков</p>';
    },

    loadAssignments() {
        const course = PlatformAPI.getCourses()[0];
        if (!course) {
            document.getElementById('assignmentsList').innerHTML = '<p>Нет курсов</p>';
            return;
        }

        const groups = PlatformAPI.getGroups().filter(g => g.teacherId === this.currentUser.id);
        const allStudents = [];
        groups.forEach(group => {
            allStudents.push(...PlatformAPI.getGroupStudents(group.id));
        });

        const container = document.getElementById('assignmentsList');
        
        if (allStudents.length === 0) {
            container.innerHTML = '<p>Нет студентов в ваших группах</p>';
            return;
        }

        const modules = PlatformAPI.getModules(course.id);
        let assignmentsHtml = '';

        modules.forEach(module => {
            const lessons = PlatformAPI.getLessons(module.id);
            lessons.forEach(lesson => {
                const assignments = PlatformAPI.getAssignments(lesson.id);
                assignments.forEach(assignment => {
                    allStudents.forEach(student => {
                        const answers = PlatformAPI.getStudentAnswers(student.id, lesson.id);
                        const answer = answers.find(a => a.assignmentId === assignment.id);
                        
                        if (answer && answer.answer) {
                            const isGraded = answer.graded;
                            assignmentsHtml += `
                                <div class="assignment-submission" style="${!isGraded ? 'border-left: 4px solid var(--warning-color);' : ''}">
                                    <div class="assignment-submission-header">
                                        <div>
                                            <span class="student-name">${student.name}</span>
                                            <h4 style="margin-top: 0.5rem;">${lesson.title} - Задание ${assignment.order}</h4>
                                            <p style="color: var(--text-light); font-size: 0.875rem;">${assignment.question}</p>
                                        </div>
                                        ${!isGraded ? '<span style="background: var(--warning-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">Требует оценки</span>' : ''}
                                    </div>
                                    <div class="assignment-answer-text">
                                        <strong>Ответ:</strong>
                                        <p style="margin-top: 0.5rem;">${assignment.type === 'text' ? answer.answer : (assignment.options ? assignment.options[parseInt(answer.answer)] : answer.answer)}</p>
                                    </div>
                                    ${isGraded ? `
                                        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-alt); border-radius: 8px;">
                                            <strong>Оценка: ${answer.score}/${assignment.points}</strong>
                                            ${answer.feedback ? `<p style="margin-top: 0.5rem;">${answer.feedback}</p>` : ''}
                                        </div>
                                    ` : ''}
                                    <button class="btn btn-primary" onclick="TeacherDashboard.viewStudentLesson(${student.id}, ${lesson.id})" style="margin-top: 1rem;">
                                        ${isGraded ? 'Изменить оценку' : 'Оценить'}
                                    </button>
                                </div>
                            `;
                        }
                    });
                });
            });
        });

        container.innerHTML = assignmentsHtml || '<p>Нет заданий для проверки</p>';
    },

    loadStatistics() {
        const groups = PlatformAPI.getGroups().filter(g => g.teacherId === this.currentUser.id);
        const course = PlatformAPI.getCourses()[0];
        const container = document.getElementById('groupStatistics');

        if (groups.length === 0 || !course) {
            container.innerHTML = '<p>Нет данных для статистики</p>';
            return;
        }

        let totalStudents = 0;
        let totalPoints = 0;
        let completedLessons = 0;
        let totalLessons = 0;

        groups.forEach(group => {
            const students = PlatformAPI.getGroupStudents(group.id);
            totalStudents += students.length;

            students.forEach(student => {
                const progress = PlatformAPI.getStudentProgress(student.id, course.id);
                if (progress) {
                    totalPoints += progress.totalPoints;
                    completedLessons += progress.completedLessons;
                    totalLessons += progress.totalLessons;
                }
            });
        });

        const avgPoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;
        const avgProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        container.innerHTML = `
            <div class="statistics-content">
                <h3>Общая статистика</h3>
                <div class="statistics-grid">
                    <div class="stat-card">
                        <div class="stat-card-value">${groups.length}</div>
                        <div class="stat-card-label">Групп</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${totalStudents}</div>
                        <div class="stat-card-label">Студентов</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${avgPoints}</div>
                        <div class="stat-card-label">Средний балл</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${avgProgress}%</div>
                        <div class="stat-card-label">Средний прогресс</div>
                    </div>
                </div>
            </div>
        `;
    },

    initLogout() {
        document.getElementById('teacherLogout').addEventListener('click', () => {
            PlatformAPI.logout();
            window.location.reload();
        });
    },

    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    }
};

window.TeacherDashboard = TeacherDashboard;

