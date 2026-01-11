// Main Platform Logic
// Ждем загрузки всех скриптов перед инициализацией
window.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка, чтобы убедиться, что все скрипты загружены
    setTimeout(function() {
        // Синхронизируем пользователей (не перезаписываем существующих)
        PlatformAPI.syncUsers();
        
        const currentUser = PlatformAPI.getCurrentUser();
        
        if (currentUser && currentUser.role) {
            // Пользователь уже авторизован
            console.log('Текущий пользователь:', currentUser);
            showDashboard(currentUser.role);
            
            // Восстанавливаем состояние после показа дашборда
            if (typeof StateManager !== 'undefined') {
                restorePlatformState(currentUser.role);
            }
        } else {
            // Показываем экран входа
            showLoginScreen();
            initLogin();
            
            // Восстанавливаем данные формы входа
            if (typeof StateManager !== 'undefined') {
                StateManager.restoreForm('loginForm');
                StateManager.autoSaveForm('loginForm');
            }
        }
    }, 100);
});

// Восстановление состояния платформы
function restorePlatformState(role) {
    if (typeof StateManager === 'undefined') return;
    
    // Восстанавливаем активную секцию
    const activeSection = StateManager.getActiveSection();
    if (activeSection) {
        setTimeout(() => {
            if (role === 'student' && typeof StudentDashboard !== 'undefined') {
                const navItem = document.querySelector(`#studentDashboard .nav-item[data-section="${activeSection}"]`);
                if (navItem) {
                    navItem.click();
                }
            } else if (role === 'teacher' && typeof TeacherDashboard !== 'undefined') {
                const navItem = document.querySelector(`#teacherDashboard .nav-item[data-section="${activeSection}"]`);
                if (navItem) {
                    navItem.click();
                }
            }
        }, 300);
    }
    
    // Восстанавливаем открытый урок (для студентов)
    if (role === 'student') {
        const openLessonId = StateManager.load('open_lesson_id');
        if (openLessonId && typeof StudentDashboard !== 'undefined') {
            setTimeout(() => {
                StudentDashboard.openLesson(openLessonId);
            }, 500);
        }
    }
}

function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const studentDashboard = document.getElementById('studentDashboard');
    const teacherDashboard = document.getElementById('teacherDashboard');
    const lessonView = document.getElementById('lessonView');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (studentDashboard) studentDashboard.style.display = 'none';
    if (teacherDashboard) teacherDashboard.style.display = 'none';
    if (lessonView) lessonView.style.display = 'none';
}

function showDashboard(role) {
    // Скрываем все дашборды сначала
    const loginScreen = document.getElementById('loginScreen');
    const studentDashboard = document.getElementById('studentDashboard');
    const teacherDashboard = document.getElementById('teacherDashboard');
    const lessonView = document.getElementById('lessonView');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (studentDashboard) studentDashboard.style.display = 'none';
    if (teacherDashboard) teacherDashboard.style.display = 'none';
    if (lessonView) lessonView.style.display = 'none';
    
    // Показываем правильный дашборд в зависимости от роли
    if (role === 'student') {
        if (studentDashboard) {
            studentDashboard.style.display = 'flex';
            // Проверяем, что StudentDashboard доступен перед инициализацией
            if (typeof StudentDashboard !== 'undefined' && StudentDashboard.init) {
                StudentDashboard.init();
            } else {
                console.error('StudentDashboard не загружен');
                showLoginScreen();
            }
        }
    } else if (role === 'teacher') {
        if (teacherDashboard) {
            teacherDashboard.style.display = 'flex';
            // Проверяем, что TeacherDashboard доступен перед инициализацией
            if (typeof TeacherDashboard !== 'undefined' && TeacherDashboard.init) {
                TeacherDashboard.init();
            } else {
                console.error('TeacherDashboard не загружен');
                showLoginScreen();
            }
        }
    } else if (role === 'admin') {
        // Перенаправляем в админ-панель
        window.location.href = '../admin/index.html';
    } else {
        // Неизвестная роль - показываем экран входа
        console.error('Неизвестная роль:', role);
        showLoginScreen();
    }
}

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Форма входа не найдена');
        return;
    }
    
    // Добавляем подсказку под формой
    const hint = document.createElement('div');
    hint.style.cssText = 'text-align: center; margin-top: 1rem; padding: 0.75rem; background: #eff6ff; border-radius: 8px; color: var(--primary-color); font-size: 0.875rem;';
    hint.innerHTML = '💡 Используйте: <strong>admin</strong> / <strong>admin</strong> для входа';
    loginForm.appendChild(hint);
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        if (!email || !password || !role) {
            showError('Пожалуйста, заполните все поля');
            return;
        }
        
        // Автоматический сброс, если пытаемся войти как admin/admin
        if (email === 'admin' && password === 'admin') {
            PlatformAPI.resetAllPasswords();
        }
        
        console.log('Попытка входа в платформу:', { email, password: password ? '***' : 'ПУСТО', role });
        
        const user = PlatformAPI.login(email, password, role);
        
        if (user && user.role) {
            console.log('✅ Пользователь авторизован:', user.role, user.name);
            showDashboard(user.role);
            
            // Очищаем сохраненные данные формы после успешного входа
            if (typeof StateManager !== 'undefined') {
                StateManager.remove('form_loginForm');
            }
        } else {
            // Получаем список пользователей для более информативного сообщения
            const allUsers = PlatformAPI.getUsers();
            const userWithEmail = allUsers.find(u => (u.email || '').trim().toLowerCase() === email.trim().toLowerCase());
            
            if (userWithEmail) {
                showError(`Неверный пароль или роль для ${email}. Проверьте пароль и выбранную роль (${userWithEmail.role}).`);
            } else {
                showError(`Пользователь с email ${email} не найден. Проверьте email или создайте пользователя в админ-панели.`);
            }
        }
    });
    
    // Автоматическое сохранение формы при изменении
    if (typeof StateManager !== 'undefined') {
        StateManager.autoSaveForm('loginForm');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Обработка клика вне модального окна
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Обработка ESC для закрытия модального окна
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('modalOverlay');
        if (overlay && overlay.style.display === 'flex') {
            overlay.style.display = 'none';
        }
    }
});

