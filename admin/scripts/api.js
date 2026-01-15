// API для работы с данными (используем localStorage для демо)
const API = {
    // Сброс всех паролей на admin/admin (только админка, платформа не трогается)
    resetAllPasswords() {
        // Очищаем старые данные админки
        localStorage.removeItem('admin_users');
        localStorage.removeItem('current_user');
        
        // Создаем нового администратора
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            password: 'admin',
            role: 'admin',
            name: 'Администратор'
        };
        localStorage.setItem('admin_users', JSON.stringify([defaultAdmin]));
        
        console.log('Пароли админки сброшены. Используйте admin/admin для входа.');
    },
    
    // Сброс паролей платформы (кроме админки)
    resetPlatformPasswords() {
        if (typeof PlatformAPI !== 'undefined') {
            PlatformAPI.resetAllPasswords();
        } else {
            // Если PlatformAPI не загружен, делаем напрямую
            const users = JSON.parse(localStorage.getItem('platform_users') || '[]');
            const adminEmails = ['admin@admin.com', 'admin'];
            
            const resetUsers = users.map(u => {
                const isAdmin = adminEmails.includes((u.email || '').trim().toLowerCase());
                if (!isAdmin) {
                    return {
                        ...u,
                        password: 'admin',
                        email: (u.email || '').trim().toLowerCase()
                    };
                }
                return u;
            });
            
            localStorage.setItem('platform_users', JSON.stringify(resetUsers));
            console.log('✅ Пароли платформы сброшены (кроме админки)');
        }
    },

    // Авторизация
    login(username, password) {
        // Нормализуем входные данные
        username = (username || '').trim();
        password = (password || '').trim();
        
        console.log('Попытка входа в админ-панель:', { username, password: password ? '***' : 'ПУСТО' });
        
        // Демо: проверка учетных данных
        let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        
        // Если пользователей нет или есть старые данные с неправильными паролями, сбрасываем
        if (users.length === 0 || (users.length > 0 && users[0].password !== 'admin')) {
            this.resetAllPasswords();
            users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        }
        
        // Сначала проверяем админов админ-панели
        let user = users.find(u => {
            const uUsername = (u.username || '').trim();
            const uPassword = (u.password || '').trim();
            return uUsername === username && uPassword === password;
        });
        
        if (user) {
            console.log('Найден админ админ-панели');
            return user;
        }
        
        // Если не найден в админах, проверяем пользователей платформы обучения
        // (можно войти в админ-панель с email любого пользователя платформы)
        const platformUsers = JSON.parse(localStorage.getItem('platform_users') || '[]');
        console.log('Проверка пользователей платформы:', platformUsers.length, 'пользователей');
        
        const platformUser = platformUsers.find(u => {
            const uEmail = (u.email || '').trim().toLowerCase();
            const uPassword = (u.password || '').trim();
            const matches = uEmail === username.toLowerCase() && uPassword === password;
            if (matches) {
                console.log('Найден пользователь платформы:', { email: uEmail, role: u.role, name: u.name });
            }
            return matches;
        });
        
        if (platformUser) {
            // Разрешаем вход в админ-панель любому пользователю платформы
            // (для удобства управления)
            console.log('Разрешен вход пользователя платформы в админ-панель');
            return {
                id: platformUser.id,
                username: platformUser.email,
                email: platformUser.email,
                password: platformUser.password,
                role: 'admin',
                name: platformUser.name || 'Администратор'
            };
        }
        
        // Если не найден, но пытаемся войти как admin/admin, создаем его
        if (username === 'admin' && password === 'admin') {
            console.log('Создание админа admin/admin');
            this.resetAllPasswords();
            return JSON.parse(localStorage.getItem('admin_users') || '[]')[0];
        }
        
        console.log('Пользователь не найден. Доступные админы:', users.map(u => u.username));
        console.log('Доступные пользователи платформы:', platformUsers.map(u => u.email));
        return null;
    },

    logout() {
        localStorage.removeItem('current_user');
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('current_user') || 'null');
    },

    setCurrentUser(user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    },

    // Курсы
    getCourses() {
        return JSON.parse(localStorage.getItem('courses') || '[]');
    },

    saveCourse(course) {
        const courses = this.getCourses();
        if (course.id) {
            const index = courses.findIndex(c => c.id === course.id);
            courses[index] = course;
        } else {
            course.id = Date.now();
            courses.push(course);
        }
        localStorage.setItem('courses', JSON.stringify(courses));
        return course;
    },

    deleteCourse(id) {
        const courses = this.getCourses().filter(c => c.id !== id);
        localStorage.setItem('courses', JSON.stringify(courses));
    },

    // Группы
    getGroups() {
        return JSON.parse(localStorage.getItem('groups') || '[]');
    },

    saveGroup(group) {
        const groups = this.getGroups();
        if (group.id) {
            const index = groups.findIndex(g => g.id === group.id);
            groups[index] = group;
        } else {
            group.id = Date.now();
            groups.push(group);
        }
        localStorage.setItem('groups', JSON.stringify(groups));
        return group;
    },

    deleteGroup(id) {
        const groups = this.getGroups().filter(g => g.id !== id);
        localStorage.setItem('groups', JSON.stringify(groups));
    },

    // Студенты
    getStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    },

    saveStudent(student) {
        const students = this.getStudents();
        if (student.id) {
            const index = students.findIndex(s => s.id === student.id);
            students[index] = student;
        } else {
            student.id = Date.now();
            students.push(student);
        }
        localStorage.setItem('students', JSON.stringify(students));
        return student;
    },

    deleteStudent(id) {
        const students = this.getStudents().filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
    },

    // Оплаты
    getPayments() {
        return JSON.parse(localStorage.getItem('payments') || '[]');
    },

    savePayment(payment) {
        const payments = this.getPayments();
        if (payment.id) {
            const index = payments.findIndex(p => p.id === payment.id);
            payments[index] = payment;
        } else {
            payment.id = Date.now();
            payment.date = new Date().toISOString();
            payments.push(payment);
        }
        localStorage.setItem('payments', JSON.stringify(payments));
        return payment;
    },

    // Сообщения
    getMessages() {
        return JSON.parse(localStorage.getItem('messages') || '[]');
    },

    saveMessage(message) {
        const messages = this.getMessages();
        message.id = Date.now();
        message.date = new Date().toISOString();
        message.read = false;
        if (!message.type) message.type = 'message';
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        return message;
    },

    markMessageAsRead(id) {
        const messages = this.getMessages();
        const message = messages.find(m => m.id === id);
        if (message) {
            message.read = true;
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    },

    // Отзывы
    getReviews() {
        return JSON.parse(localStorage.getItem('reviews') || '[]');
    },

    saveReview(review) {
        const reviews = this.getReviews();
        if (review.id) {
            const index = reviews.findIndex(r => r.id === review.id);
            reviews[index] = review;
        } else {
            review.id = Date.now();
            reviews.push(review);
        }
        localStorage.setItem('reviews', JSON.stringify(reviews));
        return review;
    },

    deleteReview(id) {
        const reviews = this.getReviews().filter(r => r.id !== id);
        localStorage.setItem('reviews', JSON.stringify(reviews));
    },

    // Контент сайта
    getSiteContent() {
        return JSON.parse(localStorage.getItem('site_content') || '{}');
    },

    saveSiteContent(content) {
        localStorage.setItem('site_content', JSON.stringify(content));
    },

    // Статистика
    getStats() {
        const students = this.getStudents();
        const groups = this.getGroups().filter(g => g.status === 'active');
        const payments = this.getPayments();
        const messages = this.getMessages().filter(m => !m.read);
        
        const totalRevenue = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
            totalStudents: students.length,
            activeGroups: groups.length,
            totalRevenue: totalRevenue,
            newMessages: messages.length
        };
    },

    // Пользователи платформы (студенты и преподаватели)
    getPlatformUsers() {
        return JSON.parse(localStorage.getItem('platform_users') || '[]');
    },

    savePlatformUser(user) {
        const users = this.getPlatformUsers();
        
        // Нормализуем email сразу
        if (!user.email) {
            console.error('Email обязателен');
            return null;
        }
        user.email = (user.email || '').trim().toLowerCase();
        
        // Обработка пароля - ВАЖНО: всегда сохраняем пароль
        if (user.id) {
            // Редактирование существующего пользователя
            const existingUser = users.find(u => u.id === user.id);
            if (existingUser) {
                // Если пароль не указан или пустой, сохраняем старый пароль
                if (!user.password || user.password.trim() === '') {
                    user.password = existingUser.password || 'admin';
                    console.log('Используется существующий пароль для пользователя:', user.email);
                } else {
                    // Нормализуем новый пароль
                    user.password = user.password.trim();
                    console.log('Устанавливается новый пароль для пользователя:', user.email);
                }
            } else {
                // Пользователь не найден, но есть ID - создаем нового
                if (!user.password || user.password.trim() === '') {
                    user.password = 'admin';
                } else {
                    user.password = user.password.trim();
                }
            }
        } else {
            // Создание нового пользователя
            if (!user.password || user.password.trim() === '') {
                user.password = 'admin';
            } else {
                user.password = user.password.trim();
            }
        }
        
        // Убеждаемся, что пароль не пустой
        if (!user.password || user.password.trim() === '') {
            user.password = 'admin';
        }
        
        // Убеждаемся, что все обязательные поля есть
        if (!user.role) {
            user.role = 'student';
        }
        
        if (!user.name) {
            user.name = user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор';
        }
        
        // Нормализуем все строковые поля
        user.name = (user.name || '').trim();
        user.email = (user.email || '').trim().toLowerCase();
        user.password = (user.password || '').trim();
        
        console.log('Сохранение пользователя в API:', {
            id: user.id,
            email: user.email,
            password: user.password ? '*** (длина: ' + user.password.length + ')' : 'ПУСТО',
            role: user.role,
            name: user.name
        });
        
        if (user.id) {
            const index = users.findIndex(u => u.id === user.id);
            if (index >= 0) {
                // Обновляем существующего пользователя - ВАЖНО: сохраняем все поля, включая пароль
                const updatedUser = {
                    ...users[index],
                    ...user,
                    password: user.password // Гарантируем что пароль обновлен
                };
                users[index] = updatedUser;
                console.log('Пользователь обновлен:', {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    password: updatedUser.password ? '***' : 'ПУСТО',
                    role: updatedUser.role
                });
            } else {
                // ID указан, но пользователь не найден - добавляем как нового
                if (!user.id) {
                    user.id = Date.now();
                }
                users.push(user);
                console.log('Пользователь добавлен (ID был указан, но не найден):', user);
            }
        } else {
            user.id = Date.now();
            users.push(user);
            console.log('Новый пользователь добавлен:', user);
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('platform_users', JSON.stringify(users));
        
        // Дополнительная проверка: читаем обратно и проверяем
        const savedUsers = JSON.parse(localStorage.getItem('platform_users') || '[]');
        const savedUser = savedUsers.find(u => 
            (user.id && u.id === user.id) || 
            ((u.email || '').trim().toLowerCase() === user.email)
        );
        
        if (savedUser) {
            console.log('✅ Пользователь успешно сохранен:', {
                id: savedUser.id,
                email: savedUser.email,
                password: savedUser.password ? '*** (длина: ' + savedUser.password.length + ')' : 'ПУСТО',
                role: savedUser.role,
                name: savedUser.name
            });
            
            // Возвращаем нормализованного пользователя
            return {
                ...savedUser,
                email: (savedUser.email || '').trim().toLowerCase(),
                password: (savedUser.password || '').trim()
            };
        } else {
            console.error('❌ Ошибка: пользователь не найден после сохранения в localStorage');
            // Возвращаем нормализованного пользователя
            return {
                ...user,
                email: user.email,
                password: user.password
            };
        }
    },

    deletePlatformUser(id) {
        const users = this.getPlatformUsers().filter(u => u.id !== id);
        localStorage.setItem('platform_users', JSON.stringify(users));
    },

    getPlatformUser(id) {
        return this.getPlatformUsers().find(u => u.id === id);
    },

    // Получить прогресс студента из платформы обучения
    getStudentProgressFromPlatform(studentId) {
        // Используем API платформы обучения
        if (typeof PlatformAPI !== 'undefined') {
            const courses = PlatformAPI.getCourses();
            if (courses.length > 0) {
                return PlatformAPI.getStudentProgress(studentId, courses[0].id);
            }
        }
        return null;
    },

    // Получить все ответы студента
    getStudentAnswersFromPlatform(studentId) {
        if (typeof PlatformAPI !== 'undefined') {
            return PlatformAPI.getAllStudentAnswers(studentId);
        }
        return [];
    }
};

// Экспорт для использования в других скриптах
window.API = API;

// Экспорт функции сброса для ручного использования из консоли
window.resetAdminPasswords = function() {
    API.resetAllPasswords();
    console.log('✅ Пароли админ-панели сброшены! Используйте: admin / admin');
};

