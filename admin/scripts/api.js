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
        const users = JSON.parse(localStorage.getItem('platform_users') || '[]');
        const adminEmails = ['admin@admin.com', 'admin'];
        
        const resetUsers = users.map(u => {
            const normalizedEmail = (u.email || '').trim().toLowerCase();
            const isAdmin = adminEmails.includes(normalizedEmail);
            
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
        
        localStorage.setItem('platform_users', JSON.stringify(resetUsers));
        console.log('✅ Пароли платформы сброшены (кроме админки)');
        console.log('Сброшено паролей:', resetUsers.filter(u => !adminEmails.includes((u.email || '').trim().toLowerCase())).length);
        
        return resetUsers;
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
        const isNewStudent = !student.id;
        
        if (student.id) {
            const index = students.findIndex(s => s.id === student.id);
            students[index] = student;
        } else {
            student.id = Date.now();
            students.push(student);
        }
        localStorage.setItem('students', JSON.stringify(students));
        
        // При создании нового студента автоматически создаем пользователя платформы
        if (isNewStudent && student.email) {
            const platformUsers = this.getPlatformUsers();
            const normalizedEmail = (student.email || '').trim().toLowerCase();
            
            // Проверяем, не существует ли уже пользователь с таким email
            const existingUser = platformUsers.find(u => 
                (u.email || '').trim().toLowerCase() === normalizedEmail
            );
            
            if (!existingUser) {
                // Создаем пользователя платформы для студента
                // Используем email как логин и генерируем пароль из email (первые 6 символов + "123")
                const defaultPassword = normalizedEmail.substring(0, 6) + '123';
                
                const platformUser = {
                    id: student.id, // Используем тот же ID что и у студента
                    name: student.name || 'Студент',
                    email: normalizedEmail,
                    password: defaultPassword,
                    role: 'student',
                    groupId: student.groupId || null
                };
                
                console.log('Автоматически создан пользователь платформы для студента:', {
                    email: platformUser.email,
                    password: platformUser.password,
                    role: platformUser.role
                });
                
                // Сохраняем через savePlatformUser для правильной нормализации
                this.savePlatformUser(platformUser);
            } else {
                console.log('Пользователь платформы с таким email уже существует:', normalizedEmail);
            }
        } else if (student.id && student.email) {
            // При обновлении студента синхронизируем данные с пользователем платформы
            const platformUsers = this.getPlatformUsers();
            const normalizedEmail = (student.email || '').trim().toLowerCase();
            const existingPlatformUser = platformUsers.find(u => 
                u.id === student.id || (u.email || '').trim().toLowerCase() === normalizedEmail
            );
            
            if (existingPlatformUser) {
                // Обновляем данные пользователя платформы
                existingPlatformUser.name = student.name || existingPlatformUser.name;
                existingPlatformUser.email = normalizedEmail;
                existingPlatformUser.groupId = student.groupId || existingPlatformUser.groupId;
                // Пароль не меняем при обновлении студента
                this.savePlatformUser(existingPlatformUser);
            }
        }
        
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
        const normalizedEmail = (user.email || '').trim().toLowerCase();
        user.email = normalizedEmail;
        
        // Обработка пароля - ВАЖНО: всегда сохраняем пароль
        if (user.id) {
            // Редактирование существующего пользователя
            const existingUser = users.find(u => u.id === user.id);
            if (existingUser) {
                // Если пароль не указан или пустой, сохраняем старый пароль
                if (!user.password || user.password.trim() === '') {
                    user.password = existingUser.password || normalizedEmail.substring(0, 6) + '123';
                    console.log('Используется существующий пароль для пользователя:', normalizedEmail);
                } else {
                    // Нормализуем новый пароль - убираем пробелы, но сохраняем как есть
                    user.password = user.password.trim();
                    console.log('Устанавливается новый пароль для пользователя:', normalizedEmail);
                }
            } else {
                // Пользователь не найден, но есть ID - создаем нового
                if (!user.password || user.password.trim() === '') {
                    user.password = normalizedEmail.substring(0, 6) + '123';
                } else {
                    user.password = user.password.trim();
                }
            }
        } else {
            // Создание нового пользователя
            if (!user.password || user.password.trim() === '') {
                // Генерируем пароль из email (первые 6 символов + "123")
                user.password = normalizedEmail.substring(0, 6) + '123';
            } else {
                user.password = user.password.trim();
            }
        }
        
        // Убеждаемся, что пароль не пустой
        if (!user.password || user.password.trim() === '') {
            user.password = normalizedEmail.substring(0, 6) + '123';
        }
        
        // Убеждаемся, что все обязательные поля есть
        if (!user.role) {
            user.role = 'student';
        }
        
        if (!user.name) {
            user.name = user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор';
        }
        
        // Нормализуем все строковые поля - ВАЖНО: делаем это один раз в конце
        const normalizedUser = {
            ...user,
            name: (user.name || '').trim(),
            email: normalizedEmail,
            password: (user.password || '').trim() // Убираем пробелы, но сохраняем пароль как есть
        };
        
        console.log('Сохранение пользователя в API:', {
            id: normalizedUser.id,
            email: normalizedUser.email,
            password: normalizedUser.password ? '*** (длина: ' + normalizedUser.password.length + ')' : 'ПУСТО',
            role: normalizedUser.role,
            name: normalizedUser.name
        });
        
        if (normalizedUser.id) {
            const index = users.findIndex(u => u.id === normalizedUser.id);
            if (index >= 0) {
                // Обновляем существующего пользователя - ВАЖНО: сохраняем пароль явно
                const existingPassword = users[index].password;
                const newPassword = normalizedUser.password && normalizedUser.password.trim() !== '' 
                    ? normalizedUser.password 
                    : existingPassword;
                
                // Создаем обновленного пользователя с гарантией сохранения пароля
                const updatedUser = {
                    ...users[index], // Старые данные
                    ...normalizedUser, // Новые данные
                    password: newPassword || normalizedEmail.substring(0, 6) + '123' // Гарантируем пароль
                };
                
                users[index] = updatedUser;
                
                console.log('Пользователь обновлен:', {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    password: updatedUser.password ? '*** (длина: ' + updatedUser.password.length + ')' : 'ПУСТО',
                    role: updatedUser.role,
                    старый_пароль_был: existingPassword ? '***' : 'ПУСТО',
                    новый_пароль: newPassword ? '***' : 'ПУСТО'
                });
            } else {
                // ID указан, но пользователь не найден - добавляем как нового
                if (!normalizedUser.id) {
                    normalizedUser.id = Date.now();
                }
                // Убеждаемся что пароль есть
                if (!normalizedUser.password || normalizedUser.password.trim() === '') {
                    normalizedUser.password = normalizedEmail.substring(0, 6) + '123';
                }
                users.push(normalizedUser);
                console.log('Пользователь добавлен (ID был указан, но не найден):', normalizedUser);
            }
        } else {
            normalizedUser.id = Date.now();
            // Убеждаемся что пароль есть
            if (!normalizedUser.password || normalizedUser.password.trim() === '') {
                normalizedUser.password = normalizedEmail.substring(0, 6) + '123';
            }
            users.push(normalizedUser);
            console.log('Новый пользователь добавлен:', normalizedUser);
        }
        
        // Сохраняем в localStorage - ВАЖНО: делаем это синхронно и проверяем результат
        try {
            localStorage.setItem('platform_users', JSON.stringify(users));
            
            // Сразу читаем обратно для проверки
            const verifyData = localStorage.getItem('platform_users');
            if (!verifyData) {
                throw new Error('Данные не были сохранены в localStorage');
            }
            
            const savedUsers = JSON.parse(verifyData);
            const savedUser = savedUsers.find(u => 
                (normalizedUser.id && u.id === normalizedUser.id) || 
                ((u.email || '').trim().toLowerCase() === normalizedEmail)
            );
            
            if (savedUser) {
                // Проверяем что пароль действительно сохранен
                if (!savedUser.password || savedUser.password.trim() === '') {
                    console.warn('⚠️ Пароль пустой после сохранения, восстанавливаем');
                    // Используем пароль из normalizedUser или генерируем новый
                    const restoredPassword = normalizedUser.password && normalizedUser.password.trim() !== ''
                        ? normalizedUser.password
                        : normalizedEmail.substring(0, 6) + '123';
                    
                    savedUser.password = restoredPassword;
                    const index = savedUsers.findIndex(u => 
                        (normalizedUser.id && u.id === normalizedUser.id) || 
                        ((u.email || '').trim().toLowerCase() === normalizedEmail)
                    );
                    if (index >= 0) {
                        savedUsers[index].password = restoredPassword;
                        localStorage.setItem('platform_users', JSON.stringify(savedUsers));
                        console.log('✅ Пароль восстановлен и сохранен');
                    }
                }
                
                // Финальная проверка пароля перед возвратом
                const finalPassword = savedUser.password && savedUser.password.trim() !== ''
                    ? savedUser.password.trim()
                    : normalizedEmail.substring(0, 6) + '123';
                
                console.log('✅ Пользователь успешно сохранен:', {
                    id: savedUser.id,
                    email: savedUser.email,
                    password: finalPassword ? '*** (длина: ' + finalPassword.length + ')' : 'ПУСТО',
                    role: savedUser.role,
                    name: savedUser.name
                });
                
                // Возвращаем нормализованного пользователя с гарантированным паролем
                return {
                    ...savedUser,
                    email: (savedUser.email || '').trim().toLowerCase(),
                    password: finalPassword
                };
            } else {
                console.error('❌ Ошибка: пользователь не найден после сохранения в localStorage');
                // Возвращаем нормализованного пользователя с гарантированным паролем
                const finalPassword = normalizedUser.password && normalizedUser.password.trim() !== ''
                    ? normalizedUser.password.trim()
                    : normalizedEmail.substring(0, 6) + '123';
                
                return {
                    ...normalizedUser,
                    email: normalizedEmail,
                    password: finalPassword
                };
            }
        } catch (error) {
            console.error('❌ Ошибка при сохранении в localStorage:', error);
            return {
                ...normalizedUser,
                email: normalizedEmail,
                password: normalizedUser.password
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

// Экспорт функции сброса паролей платформы
window.resetPlatformPasswords = function() {
    const resetUsers = API.resetPlatformPasswords();
    const resetCount = resetUsers.filter(u => {
        const adminEmails = ['admin@admin.com', 'admin'];
        return !adminEmails.includes((u.email || '').trim().toLowerCase());
    }).length;
    console.log(`✅ Пароли платформы сброшены! Сброшено паролей: ${resetCount}`);
    console.log('Новые пароли: первые 6 символов email + "123"');
    return resetUsers;
};

// Автоматический сброс всех паролей кроме админки при загрузке (если нужно)
// Раскомментируйте следующую строку для автоматического сброса при загрузке страницы:
// window.addEventListener('DOMContentLoaded', () => { API.resetPlatformPasswords(); });

