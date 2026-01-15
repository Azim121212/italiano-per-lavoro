// API для платформы обучения
const PlatformAPI = {
    // Сброс всех паролей (кроме админки)
    resetAllPasswords() {
        const users = this.getUsers();
        
        // Сохраняем админа если он есть
        const adminUsers = users.filter(u => {
            const adminEmails = ['admin@admin.com', 'admin'];
            return adminEmails.includes((u.email || '').trim().toLowerCase());
        });
        
        // Сбрасываем пароли всех пользователей кроме админа
        const resetUsers = users.map(u => {
            const normalizedEmail = (u.email || '').trim().toLowerCase();
            const isAdmin = adminUsers.some(admin => admin.id === u.id);
            
            if (!isAdmin) {
                // Генерируем пароль из email (первые 6 символов + "123")
                const newPassword = normalizedEmail.substring(0, 6) + '123';
                return {
                    ...u,
                    password: newPassword,
                    email: normalizedEmail
                };
            }
            return u;
        });
        
        // Если админа нет, создаем его
        if (adminUsers.length === 0) {
            resetUsers.push({
                id: Date.now(),
                email: 'admin',
                password: 'admin',
                role: 'admin',
                name: 'Администратор'
            });
        }
        
        localStorage.setItem('platform_users', JSON.stringify(resetUsers));
        const resetCount = resetUsers.filter(u => {
            const adminEmails = ['admin@admin.com', 'admin'];
            return !adminEmails.includes((u.email || '').trim().toLowerCase());
        }).length;
        
        console.log('✅ Пароли платформы сброшены (кроме админки)');
        console.log('Сброшено паролей:', resetCount);
        console.log('Новые пароли: первые 6 символов email + "123"');
        
        return resetUsers;
    },
    
    // Проверка и синхронизация пользователей
    syncUsers() {
        const users = this.getUsers();
        console.log('Синхронизация пользователей. Всего:', users.length);
        return users;
    },

    // Авторизация
    login(email, password, role) {
        // НЕ создаем демо-пользователей автоматически при входе
        // Они должны создаваться только при первой инициализации данных
        let users = this.getUsers();
        
        // Нормализуем входные данные
        email = (email || '').trim().toLowerCase();
        password = (password || '').trim();
        
        console.log('Попытка входа:', { 
            email, 
            password: password ? '*** (длина: ' + password.length + ')' : 'ПУСТО', 
            role 
        });
        console.log('Доступные пользователи:', users.length, 'пользователей');
        
        // Обычная проверка - ищем пользователя с совпадающими данными
        // ВАЖНО: сравниваем нормализованные значения
        let user = users.find(u => {
            const userEmail = (u.email || '').trim().toLowerCase();
            const userPassword = (u.password || '').trim();
            const userRole = u.role || 'student';
            
            const emailMatch = userEmail === email;
            const passwordMatch = userPassword === password;
            const roleMatch = userRole === role;
            
            if (emailMatch && !passwordMatch) {
                console.warn('Email найден, но пароль не совпадает:', {
                    email: userEmail,
                    введенный_пароль: password ? '***' : 'ПУСТО',
                    сохраненный_пароль: userPassword ? '*** (длина: ' + userPassword.length + ')' : 'ПУСТО'
                });
            }
            
            if (emailMatch && passwordMatch && !roleMatch) {
                console.warn('Email и пароль совпадают, но роль не совпадает:', {
                    email: userEmail,
                    введенная_роль: role,
                    сохраненная_роль: userRole
                });
            }
            
            return emailMatch && passwordMatch && roleMatch;
        });
        
        if (user) {
            console.log('✅ Пользователь найден и авторизован:', {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            });
            // Сохраняем нормализованного пользователя
            const normalizedUser = {
                ...user,
                email: (user.email || '').trim().toLowerCase(),
                password: (user.password || '').trim()
            };
            localStorage.setItem('platform_user', JSON.stringify(normalizedUser));
            return normalizedUser;
        }
        
        // Если не найден, но пытаемся войти как admin/admin, создаем пользователя
        if (email === 'admin' && password === 'admin') {
            console.log('Создание пользователя admin/admin с ролью:', role);
            const newUser = {
                id: Date.now(),
                email: 'admin',
                password: 'admin',
                role: role,
                name: role === 'student' ? 'Студент' : role === 'teacher' ? 'Преподаватель' : 'Администратор',
                groupId: role === 'student' ? 1 : null,
                groups: role === 'teacher' ? [1] : null
            };
            users.push(newUser);
            localStorage.setItem('platform_users', JSON.stringify(users));
            localStorage.setItem('platform_user', JSON.stringify(newUser));
            console.log('Пользователь создан:', newUser);
            return newUser;
        }
        
        console.error('Пользователь не найден. Проверьте:', {
            введенный_email: email,
            введенный_пароль: password ? '*** (длина: ' + password.length + ')' : 'ПУСТО',
            введенная_роль: role,
            доступные_пользователи: users.map(u => ({
                id: u.id,
                email: u.email,
                role: u.role,
                password: u.password ? '*** (длина: ' + u.password.length + ')' : 'ПУСТО',
                name: u.name
            }))
        });
        
        // Показываем подробную информацию для отладки
        const matchingEmail = users.find(u => (u.email || '').trim().toLowerCase() === email);
        if (matchingEmail) {
            console.error('Найден пользователь с таким email, но:', {
                email: matchingEmail.email,
                введенный_пароль: password ? '***' : 'ПУСТО',
                сохраненный_пароль: matchingEmail.password ? '***' : 'ПУСТО',
                пароли_совпадают: matchingEmail.password === password,
                введенная_роль: role,
                сохраненная_роль: matchingEmail.role,
                роли_совпадают: matchingEmail.role === role
            });
        } else {
            console.error('Пользователь с таким email не найден. Все доступные email:', users.map(u => u.email));
        }
        
        return null;
    },

    createDemoUsers() {
        // Получаем существующих пользователей, чтобы НЕ перезаписать их
        const existingUsers = JSON.parse(localStorage.getItem('platform_users') || '[]');
        console.log('Существующие пользователи перед созданием демо:', existingUsers.length);
        
        // Если уже есть пользователи, НЕ создаем демо-пользователей
        if (existingUsers.length > 0) {
            console.log('Пользователи уже существуют, демо-пользователи не создаются');
            console.log('Существующие пользователи:', existingUsers.map(u => ({ email: u.email, role: u.role, name: u.name })));
            return;
        }
        
        // Создаем демо-пользователей только если пользователей вообще нет
        const demoUsers = [
            {
                id: Date.now(),
                email: 'admin',
                password: 'admin',
                role: 'student',
                name: 'Студент',
                groupId: 1
            },
            {
                id: Date.now() + 1,
                email: 'admin',
                password: 'admin',
                role: 'teacher',
                name: 'Преподаватель',
                groups: [1]
            },
            {
                id: Date.now() + 2,
                email: 'admin',
                password: 'admin',
                role: 'admin',
                name: 'Администратор'
            }
        ];
        
        localStorage.setItem('platform_users', JSON.stringify(demoUsers));
        console.log('Демо-пользователи созданы. Всего пользователей:', demoUsers.length);
    },

    getUsers() {
        const users = JSON.parse(localStorage.getItem('platform_users') || '[]');
        console.log('Получение пользователей из localStorage:', users.length, 'пользователей');
        
        // Убеждаемся, что все пользователи имеют правильный формат
        const normalizedUsers = users.map(user => {
            // Убеждаемся, что есть все необходимые поля
            if (!user.email) user.email = user.username || 'admin';
            if (!user.password) {
                console.warn('Пользователь без пароля:', user.email);
                user.password = 'admin';
            }
            if (!user.role) user.role = 'student';
            if (!user.name) user.name = user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор';
            
            // Нормализуем email и password
            user.email = (user.email || '').trim().toLowerCase();
            user.password = (user.password || '').trim();
            
            return user;
        });
        
        console.log('Нормализованные пользователи:', normalizedUsers.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            hasPassword: !!u.password && u.password.length > 0
        })));
        
        return normalizedUsers;
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('platform_user') || 'null');
    },

    logout() {
        localStorage.removeItem('platform_user');
    },

    // Группы
    getGroups() {
        return JSON.parse(localStorage.getItem('platform_groups') || '[]');
    },

    getGroup(groupId) {
        return this.getGroups().find(g => g.id === groupId);
    },

    getGroupStudents(groupId) {
        const users = this.getUsers();
        return users.filter(u => u.role === 'student' && u.groupId === groupId);
    },

    // Курсы и модули
    getCourses() {
        return JSON.parse(localStorage.getItem('platform_courses') || '[]');
    },

    getModules(courseId) {
        const modules = JSON.parse(localStorage.getItem('platform_modules') || '[]');
        return modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
    },

    getLessons(moduleId) {
        const lessons = JSON.parse(localStorage.getItem('platform_lessons') || '[]');
        return lessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
    },

    getLesson(lessonId) {
        const lessons = JSON.parse(localStorage.getItem('platform_lessons') || '[]');
        return lessons.find(l => l.id === lessonId);
    },

    // Задания
    getAssignments(lessonId) {
        const assignments = JSON.parse(localStorage.getItem('platform_assignments') || '[]');
        return assignments.filter(a => a.lessonId === lessonId).sort((a, b) => a.order - b.order);
    },

    getAssignment(assignmentId) {
        const assignments = JSON.parse(localStorage.getItem('platform_assignments') || '[]');
        return assignments.find(a => a.id === assignmentId);
    },

    // Ответы студентов
    saveStudentAnswer(studentId, assignmentId, answer) {
        const answers = JSON.parse(localStorage.getItem('platform_answers') || '[]');
        const existingIndex = answers.findIndex(a => 
            a.studentId === parseInt(studentId) && a.assignmentId === parseInt(assignmentId)
        );
        
        const answerData = {
            id: existingIndex >= 0 ? answers[existingIndex].id : Date.now(),
            studentId: parseInt(studentId),
            assignmentId: parseInt(assignmentId),
            answer: answer,
            submittedAt: new Date().toISOString(),
            graded: false,
            score: null,
            feedback: null
        };
        
        if (existingIndex >= 0) {
            answers[existingIndex] = answerData;
        } else {
            answers.push(answerData);
        }
        
        localStorage.setItem('platform_answers', JSON.stringify(answers));
        return answerData;
    },

    getStudentAnswers(studentId, lessonId) {
        const answers = JSON.parse(localStorage.getItem('platform_answers') || '[]');
        const assignments = this.getAssignments(lessonId);
        const assignmentIds = assignments.map(a => a.id);
        
        return answers.filter(a => 
            a.studentId === parseInt(studentId) && 
            assignmentIds.includes(a.assignmentId)
        );
    },

    getAllStudentAnswers(studentId) {
        return JSON.parse(localStorage.getItem('platform_answers') || '[]')
            .filter(a => a.studentId === parseInt(studentId));
    },

    // Оценки
    gradeAssignment(answerId, score, feedback) {
        const answers = JSON.parse(localStorage.getItem('platform_answers') || '[]');
        const answer = answers.find(a => a.id === parseInt(answerId));
        
        if (answer) {
            answer.score = parseFloat(score);
            answer.feedback = feedback || '';
            answer.graded = true;
            answer.gradedAt = new Date().toISOString();
            localStorage.setItem('platform_answers', JSON.stringify(answers));
        }
        
        return answer;
    },

    // Прогресс
    getStudentProgress(studentId, courseId) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return null;
        
        const modules = this.getModules(courseId);
        let totalLessons = 0;
        let completedLessons = 0;
        let totalPoints = 0;
        let totalPossiblePoints = 0;
        
        modules.forEach(module => {
            const lessons = this.getLessons(module.id);
            totalLessons += lessons.length;
            
            lessons.forEach(lesson => {
                const assignments = this.getAssignments(lesson.id);
                totalPossiblePoints += assignments.reduce((sum, a) => sum + (a.points || 10), 0);
                
                const answers = this.getStudentAnswers(studentId, lesson.id);
                const completedAssignments = answers.filter(a => a.answer).length;
                
                if (completedAssignments === assignments.length && assignments.length > 0) {
                    completedLessons++;
                }
                
                answers.forEach(answer => {
                    if (answer.score !== null) {
                        totalPoints += answer.score;
                    }
                });
            });
        });
        
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        
        return {
            courseId,
            totalLessons,
            completedLessons,
            progress: Math.round(progress),
            totalPoints,
            totalPossiblePoints,
            averageScore: totalPossiblePoints > 0 ? Math.round((totalPoints / totalPossiblePoints) * 100) : 0
        };
    },

    // Рейтинг группы
    getGroupLeaderboard(groupId) {
        const students = this.getGroupStudents(groupId);
        const course = this.getCourses()[0]; // Первый курс
        if (!course) return [];
        
        return students.map(student => {
            const progress = this.getStudentProgress(student.id, course.id);
            const answers = this.getAllStudentAnswers(student.id);
            const totalPoints = answers.reduce((sum, a) => sum + (a.score || 0), 0);
            
            return {
                studentId: student.id,
                name: student.name,
                points: totalPoints,
                progress: progress ? progress.progress : 0,
                completedLessons: progress ? progress.completedLessons : 0
            };
        }).sort((a, b) => b.points - a.points);
    },

    // Инициализация демо данных
    initDemoData() {
        // Создаем демо курс
        const courses = [
            {
                id: 1,
                name: 'Italiano per lavoro',
                description: 'Практический курс итальянского для работы',
                duration: 3,
                modules: []
            }
        ];
        localStorage.setItem('platform_courses', JSON.stringify(courses));
        
        // Создаем демо модули
        const modules = [
            { id: 1, courseId: 1, name: 'Модуль 1: Первый месяц', order: 1 },
            { id: 2, courseId: 1, name: 'Модуль 2: Второй месяц', order: 2 },
            { id: 3, courseId: 1, name: 'Модуль 3: Третий месяц', order: 3 }
        ];
        localStorage.setItem('platform_modules', JSON.stringify(modules));
        
        // Создаем демо группу
        const groups = [
            {
                id: 1,
                name: 'Группа 1',
                courseId: 1,
                teacherId: 2,
                maxStudents: 7
            }
        ];
        localStorage.setItem('platform_groups', JSON.stringify(groups));
        
        // Создаем 12 уроков первого месяца с конкретными заданиями
        this.createFirstMonthLessons();
    },

    createFirstMonthLessons() {
        const lessons = [];
        const lessonData = [
            {
                title: 'Основы повседневного итальянского',
                content: `# Теория: Основы повседневного итальянского

## Приветствия и прощания
- Buongiorno (Доброе утро) - используется до обеда
- Buonasera (Добрый вечер) - используется после обеда
- Ciao (Привет/Пока) - неформальное приветствие
- Arrivederci (До свидания) - формальное прощание

## Основные фразы
- Per favore (Пожалуйста)
- Grazie (Спасибо)
- Prego (Пожалуйста, в ответ на "спасибо")
- Scusi (Извините)
- Mi dispiace (Мне жаль)

## Полезные выражения для работы
- Posso aiutarla? (Могу я вам помочь?)
- Come posso aiutarla? (Как я могу вам помочь?)
- Un momento, per favore (Один момент, пожалуйста)
- Certamente (Конечно)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Вставьте правильные фразы в диалог:\n\nКлиент: "Buongiorno!"\nВы: "______, come posso aiutarla?"\nКлиент: "Vorrei informazioni sul corso."\nВы: "______, un momento."',
                        points: 5,
                        correctAnswer: 'Buongiorno, Certamente'
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно попрощаться с клиентом в рабочее время?',
                        options: ['Ciao', 'Arrivederci', 'Buongiorno', 'Grazie'],
                        correctAnswer: 1,
                        points: 3
                    },
                    {
                        type: 'interactive',
                        question: 'Мини-quiz: Выберите правильный вариант приветствия',
                        options: [
                            'Buongiorno (утром)',
                            'Buonasera (вечером)',
                            'Ciao (с друзьями)',
                            'Все варианты правильные'
                        ],
                        correctAnswer: 3,
                        points: 2
                    }
                ]
            },
            {
                title: 'Работа с клиентами',
                content: `# Теория: Работа с клиентами

## Фразы для обслуживания клиентов
- Benvenuto/a (Добро пожаловать)
- Cosa desidera? (Что вы желаете?)
- Ha bisogno di aiuto? (Вам нужна помощь?)
- Posso mostrarle... (Могу я показать вам...)
- Quanto costa? (Сколько стоит?)
- Accetta carte? (Принимаете карты?)

## Диалоги с клиентами
Пример диалога в магазине:
- Cliente: "Buongiorno, avete questo prodotto?"
- Commesso: "Sì, certo. Lo cerco subito."
- Cliente: "Quanto costa?"
- Commesso: "Costa 25 euro."`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Составьте диалог на рабочую тему. Ситуация: клиент спрашивает о наличии товара, вы отвечаете, что товар есть, и называете цену.',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Кахут-подобная викторина: Выберите правильную фразу для работы с клиентом',
                        options: [
                            'Cosa vuoi?',
                            'Cosa desidera?',
                            'Che cosa fai?',
                            'Dove vai?'
                        ],
                        correctAnswer: 1,
                        points: 10
                    }
                ]
            },
            {
                title: 'Числа, время, даты',
                content: `# Теория: Числа, время, даты

## Числа (1-100)
1-10: uno, due, tre, quattro, cinque, sei, sette, otto, nove, dieci
11-20: undici, dodici, tredici, quattordici, quindici, sedici, diciassette, diciotto, diciannove, venti
20, 30, 40...: venti, trenta, quaranta, cinquanta, sessanta, settanta, ottanta, novanta, cento

## Время
- Che ora è? (Который час?)
- Sono le... (Сейчас...)
- Mezzogiorno (Полдень)
- Mezzanotte (Полночь)
- Di mattina (Утром)
- Di pomeriggio (Днём)
- Di sera (Вечером)

## Даты
- Che giorno è oggi? (Какой сегодня день?)
- Oggi è... (Сегодня...)
- Domani (Завтра)
- Ieri (Вчера)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Практика на подсчёт и планирование: Напишите на итальянском:\n1) Сколько стоит товар за 35 евро?\n2) Как спросить "Который час?"\n3) Как сказать "Завтра в 15:00"?',
                        points: 5
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно сказать "35" по-итальянски?',
                        options: ['trentacinque', 'trentacinque', 'trenta cinque', 'trenta-cinque'],
                        correctAnswer: 0,
                        points: 3
                    },
                    {
                        type: 'interactive',
                        question: 'Ролевой кейс: Вы работаете в магазине. Клиент спрашивает цену товара (47 евро) и время работы (9:00-18:00). Составьте ответ.',
                        points: 2
                    }
                ]
            },
            {
                title: 'Магазины и заказы',
                content: `# Теория: Магазины и заказы

## В магазине
- Dove si trova...? (Где находится...?)
- Quanto costa? (Сколько стоит?)
- Ha qualcosa di più economico? (Есть что-то подешевле?)
- Lo prendo (Я возьму это)
- Posso pagare con carta? (Могу заплатить картой?)

## Заказы
- Vorrei ordinare... (Я хотел бы заказать...)
- Per favore (Пожалуйста)
- Grazie (Спасибо)
- Il conto, per favore (Счёт, пожалуйста)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Составьте диалог с покупателем. Ситуация: покупатель спрашивает о товаре, вы показываете варианты, покупатель выбирает и спрашивает о способе оплаты.',
                        points: 10
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно попросить счёт в ресторане?',
                        options: ['Il conto', 'Il conto, per favore', 'Quanto costa?', 'Posso pagare?'],
                        correctAnswer: 1,
                        points: 5
                    },
                    {
                        type: 'interactive',
                        question: 'Quiz + интерактивное задание: Выберите правильные фразы для работы в магазине',
                        options: [
                            'Cosa vuoi comprare?',
                            'Cosa desidera?',
                            'Quanto costa questo?',
                            'Tutti e due (Оба правильные)'
                        ],
                        correctAnswer: 3,
                        points: 5
                    }
                ]
            },
            {
                title: 'Работа с документами',
                content: `# Теория: Работа с документами

## Документы
- Documento (Документ)
- Carta d'identità (Удостоверение личности)
- Passaporto (Паспорт)
- Permesso di soggiorno (Разрешение на пребывание)
- Contratto (Договор)

## Фразы для работы с документами
- Ha con sé i documenti? (У вас с собой документы?)
- Posso vedere il documento? (Могу я посмотреть документ?)
- Firma qui, per favore (Подпишите здесь, пожалуйста)
- Compili questo modulo (Заполните эту форму)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Найдите ошибки в примерах:\n1) "Ho bisogno del tuo documento" (в формальной ситуации)\n2) "Firma qui" (без "per favore")\n3) "Compila questo" (без указания что именно)',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Кахут-викторина: Как правильно попросить документы у клиента?',
                        options: [
                            'Dammi i documenti',
                            'Ha con sé i documenti?',
                            'Dove sono i documenti?',
                            'Voglio i documenti'
                        ],
                        correctAnswer: 1,
                        points: 10
                    }
                ]
            },
            {
                title: 'Общение с коллегами',
                content: `# Теория: Общение с коллегами

## Приветствия с коллегами
- Ciao (Привет) - неформально
- Buongiorno (Доброе утро) - формально
- Come stai? (Как дела?) - неформально
- Come sta? (Как дела?) - формально

## Рабочие фразы
- Hai bisogno di aiuto? (Тебе нужна помощь?)
- Possiamo lavorare insieme? (Можем работать вместе?)
- A che ora ci vediamo? (Во сколько встречаемся?)
- Ci sentiamo dopo (Услышимся позже)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Напишите короткий email коллеге на итальянском. Тема: встреча завтра в 10:00 для обсуждения проекта.',
                        points: 10
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно обратиться к коллеге формально?',
                        options: ['Ciao, come stai?', 'Buongiorno, come sta?', 'Ehi, come va?', 'Salve'],
                        correctAnswer: 1,
                        points: 5
                    },
                    {
                        type: 'interactive',
                        question: 'Мини-quiz: Выберите правильные фразы для общения с коллегами',
                        options: [
                            'Ciao, come stai? (неформально)',
                            'Buongiorno, come sta? (формально)',
                            'A che ora ci vediamo?',
                            'Tutti e tre (Все три)'
                        ],
                        correctAnswer: 3,
                        points: 5
                    }
                ]
            },
            {
                title: 'Повседневные ситуации',
                content: `# Теория: Повседневные ситуации

## В транспорте
- Un biglietto, per favore (Один билет, пожалуйста)
- Dove va questo autobus? (Куда идёт этот автобус?)
- Scusi, questa fermata è...? (Извините, эта остановка...?)

## В банке/почте
- Vorrei fare un bonifico (Я хотел бы сделать перевод)
- Quanto costa? (Сколько стоит?)
- Posso pagare qui? (Могу заплатить здесь?)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Заполните таблицу с фразами для разных ситуаций:\n1) В магазине: ______\n2) В транспорте: ______\n3) В банке: ______',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Ролевой кейс: Вы в автобусе. Нужно спросить, идёт ли автобус до центра. Составьте вопрос.',
                        points: 10
                    }
                ]
            },
            {
                title: 'Собеседование',
                content: `# Теория: Собеседование

## Типичные вопросы на собеседовании
- Perché vuole lavorare qui? (Почему вы хотите работать здесь?)
- Quali sono le sue competenze? (Каковы ваши навыки?)
- Ha esperienza? (У вас есть опыт?)
- Quando può iniziare? (Когда вы можете начать?)
- Quanto vuole guadagnare? (Сколько вы хотите зарабатывать?)

## Ответы
- Mi chiamo... (Меня зовут...)
- Ho esperienza in... (У меня есть опыт в...)
- Posso iniziare... (Я могу начать...)
- Sono disponibile (Я доступен)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Ответьте на 5 типичных вопросов на собеседовании:\n1) Perché vuole lavorare qui?\n2) Quali sono le sue competenze?\n3) Ha esperienza?\n4) Quando può iniziare?\n5) Quanto vuole guadagnare?',
                        points: 10
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно представиться на собеседовании?',
                        options: ['Mi chiamo...', 'Sono...', 'Il mio nome è...', 'Tutti e tre'],
                        correctAnswer: 3,
                        points: 5
                    },
                    {
                        type: 'interactive',
                        question: 'Quiz + обсуждение: Выберите правильные ответы на вопросы собеседования',
                        options: [
                            'Sono disponibile',
                            'Ho esperienza',
                            'Posso iniziare subito',
                            'Tutti e tre'
                        ],
                        correctAnswer: 3,
                        points: 5
                    }
                ]
            },
            {
                title: 'Работа с заказами',
                content: `# Теория: Работа с заказами

## Приём заказов
- Posso prendere il suo ordine? (Могу принять ваш заказ?)
- Cosa desidera ordinare? (Что вы хотите заказать?)
- Quale taglia? (Какой размер?)
- Ha bisogno di altro? (Вам нужно что-то ещё?)

## Подтверждение заказа
- Va bene così? (Так подойдёт?)
- Confermo il suo ordine (Подтверждаю ваш заказ)
- Il suo ordine sarà pronto tra... (Ваш заказ будет готов через...)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Практическое задание с кейсом: Клиент хочет заказать товар. Составьте полный диалог от приветствия до подтверждения заказа.',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Кахут-подобная викторина: Как правильно принять заказ?',
                        options: [
                            'Cosa vuoi?',
                            'Posso prendere il suo ordine?',
                            'Che cosa fai?',
                            'Dove vai?'
                        ],
                        correctAnswer: 1,
                        points: 10
                    }
                ]
            },
            {
                title: 'Деловая переписка',
                content: `# Теория: Деловая переписка

## Начало письма
- Gentile Signore/Signora (Уважаемый господин/госпожа)
- Egregio Signore (Уважаемый господин) - формально
- Spettabile (Уважаемый) - очень формально

## Основная часть
- Le scrivo per... (Пишу вам, чтобы...)
- Vorrei informarla che... (Хотел бы сообщить вам, что...)
- In riferimento a... (В связи с...)

## Завершение
- Cordiali saluti (С уважением)
- Distinti saluti (С уважением) - более формально
- La ringrazio (Спасибо вам)`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Напишите email и проверите: Составьте деловое письмо клиенту о подтверждении заказа. Используйте правильные формы обращения.',
                        points: 10
                    },
                    {
                        type: 'quiz',
                        question: 'Как правильно начать формальное письмо?',
                        options: ['Ciao', 'Gentile Signore', 'Ehi', 'Salve'],
                        correctAnswer: 1,
                        points: 5
                    },
                    {
                        type: 'interactive',
                        question: 'Мини-quiz: Выберите правильное завершение делового письма',
                        options: [
                            'Ciao',
                            'Cordiali saluti',
                            'A presto',
                            'Ci sentiamo'
                        ],
                        correctAnswer: 1,
                        points: 5
                    }
                ]
            },
            {
                title: 'Грамматика для работы',
                content: `# Теория: Грамматика для работы

## Важные грамматические конструкции
- Vorrei + infinitivo (Я хотел бы...)
- Posso + infinitivo (Я могу...)
- Devo + infinitivo (Я должен...)
- È necessario + infinitivo (Необходимо...)

## Времена
- Presente (Настоящее время) - для текущих действий
- Passato prossimo (Прошедшее время) - для завершённых действий
- Futuro (Будущее время) - для планов`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Заполните пропуски правильными формами глаголов:\n1) Io ______ (volere) informazioni\n2) Tu ______ (potere) aiutarmi?\n3) Lui ______ (dovere) firmare il contratto',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Интерактивное упражнение: Выберите правильную форму глагола "volere"',
                        options: [
                            'voglio',
                            'vuoi',
                            'vuole',
                            'Tutti e tre'
                        ],
                        correctAnswer: 3,
                        points: 10
                    }
                ]
            },
            {
                title: 'Итоговый урок',
                content: `# Теория: Итоговый урок

## Повторение и закрепление

В этом уроке мы повторим все изученные темы:
1. Основы повседневного итальянского
2. Работа с клиентами
3. Числа, время, даты
4. Магазины и заказы
5. Работа с документами
6. Общение с коллегами
7. Повседневные ситуации
8. Собеседование
9. Работа с заказами
10. Деловая переписка
11. Грамматика для работы

## Финальный тест
Проверьте свои знания всех изученных тем!`,
                assignments: [
                    {
                        type: 'text',
                        question: 'Ролевой кейс: Представьте, что вы проходите собеседование на работу в итальянской компании. Составьте полный диалог с работодателем, используя изученные фразы.',
                        points: 10
                    },
                    {
                        type: 'interactive',
                        question: 'Финальный quiz: Выберите правильные ответы на вопросы из всех изученных тем',
                        options: [
                            'Buongiorno - приветствие утром',
                            'Posso aiutarla? - предложение помощи',
                            'Grazie - спасибо',
                            'Tutti e tre (Все три правильные)'
                        ],
                        correctAnswer: 3,
                        points: 10
                    }
                ]
            }
        ];

        lessonData.forEach((lesson, index) => {
            lessons.push({
                id: index + 1,
                moduleId: 1,
                title: lesson.title,
                content: lesson.content,
                order: index + 1,
                duration: 60,
                points: index === 11 ? 20 : 10
            });
        });
        
        localStorage.setItem('platform_lessons', JSON.stringify(lessons));
        
        // Создаем задания для каждого урока
        this.createAssignments(lessonData);
    },

    createAssignments(lessonData) {
        const assignments = [];
        let assignmentId = 1;

        lessonData.forEach((lesson, lessonIndex) => {
            lesson.assignments.forEach((assignment, assignmentIndex) => {
                assignments.push({
                    id: assignmentId++,
                    lessonId: lessonIndex + 1,
                    type: assignment.type,
                    question: assignment.question,
                    options: assignment.options || null,
                    correctAnswer: assignment.correctAnswer !== undefined ? assignment.correctAnswer : null,
                    points: assignment.points || 10,
                    order: assignmentIndex + 1
                });
            });
        });
        
        localStorage.setItem('platform_assignments', JSON.stringify(assignments));
    }
};

// Инициализация демо данных при первой загрузке
// ВАЖНО: Не перезаписываем пользователей, если они уже есть!
if (!localStorage.getItem('platform_courses')) {
    PlatformAPI.initDemoData();
} else {
    // Если курсы уже есть, но пользователей нет - создаем только демо-пользователей
    const existingUsers = JSON.parse(localStorage.getItem('platform_users') || '[]');
    if (existingUsers.length === 0) {
        console.log('Курсы есть, но пользователей нет. Создаем демо-пользователей.');
        PlatformAPI.createDemoUsers();
    } else {
        console.log('Пользователи уже существуют:', existingUsers.length, 'пользователей');
        console.log('Список пользователей:', existingUsers.map(u => ({ email: u.email, role: u.role, name: u.name })));
    }
}

window.PlatformAPI = PlatformAPI;

// Экспорт функции сброса для ручного использования из консоли
window.resetPlatformPasswords = function() {
    PlatformAPI.resetAllPasswords();
    console.log('✅ Пароли платформы обучения сброшены (кроме админки)! Используйте: admin / admin');
    alert('Пароли платформы сброшены (кроме админки)! Перезагрузите страницу (F5)');
};

// Функция для полного сброса всех паролей
window.resetAllPasswords = function() {
    localStorage.removeItem('admin_users');
    localStorage.removeItem('platform_users');
    localStorage.removeItem('platform_user');
    localStorage.removeItem('current_user');
    
    if (typeof API !== 'undefined') {
        API.resetAllPasswords();
    }
    if (typeof PlatformAPI !== 'undefined') {
        PlatformAPI.resetAllPasswords();
    }
    
    console.log('✅ Все пароли сброшены! Перезагрузите страницу и используйте: admin / admin');
    alert('Все пароли сброшены! Перезагрузите страницу (F5) и используйте:\nЛогин: admin\nПароль: admin');
};
