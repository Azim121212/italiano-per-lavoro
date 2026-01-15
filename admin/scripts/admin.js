// Admin Panel Main Script
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = API.getCurrentUser();
    if (currentUser) {
        showAdminPanel();
        initAdminPanel();
        
        // Восстанавливаем состояние после инициализации
        if (typeof StateManager !== 'undefined') {
            restoreAdminState();
        }
    } else {
        showLoginScreen();
        initLogin();
        
        // Восстанавливаем данные формы входа
        if (typeof StateManager !== 'undefined') {
            StateManager.restoreForm('loginForm');
            StateManager.autoSaveForm('loginForm');
        }
    }
});

// Восстановление состояния админ-панели
function restoreAdminState() {
    if (typeof StateManager === 'undefined') return;
    
    // Восстанавливаем активную секцию
    const activeSection = StateManager.getActiveSection();
    if (activeSection) {
        setTimeout(() => {
            const navItem = document.querySelector(`.nav-item[data-section="${activeSection}"]`);
            if (navItem) {
                navItem.click();
            }
        }, 300);
    }
    
    // Восстанавливаем состояние сайдбара
    const uiState = StateManager.getUIState();
    if (uiState.sidebarOpen !== undefined) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (uiState.sidebarOpen) {
                sidebar.classList.add('open');
            } else {
                sidebar.classList.remove('open');
            }
        }
    }
    
    // Восстанавливаем фильтры
    const filters = StateManager.getFilters();
    if (Object.keys(filters).length > 0) {
        Object.keys(filters).forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement && filters[filterId] !== undefined) {
                filterElement.value = filters[filterId];
            }
        });
    }
}

// Login Screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
}

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    
    // Добавляем кнопку для сброса паролей (для отладки)
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-secondary';
    resetBtn.style.marginTop = '1rem';
    resetBtn.textContent = 'Сбросить все пароли';
    resetBtn.onclick = function() {
        if (confirm('Вы уверены? Все пароли платформы будут сброшены (кроме админки). Пароли будут установлены как: первые 6 символов email + "123"')) {
            const resetUsers = API.resetPlatformPasswords();
            const resetCount = resetUsers.filter(u => {
                const adminEmails = ['admin@admin.com', 'admin'];
                return !adminEmails.includes((u.email || '').trim().toLowerCase());
            }).length;
            alert(`✅ Пароли платформы сброшены (кроме админки)!\n\nСброшено паролей: ${resetCount}\n\nНовые пароли: первые 6 символов email + "123"\nНапример: email "student@example.com" → пароль "studen123"`);
        }
    };
    loginForm.appendChild(resetBtn);
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Пожалуйста, заполните все поля';
            errorDiv.style.display = 'block';
            return;
        }
        
        const user = API.login(username, password);
        if (user) {
            API.setCurrentUser(user);
            showAdminPanel();
            initAdminPanel();
            
            // Очищаем сохраненные данные формы после успешного входа
            if (typeof StateManager !== 'undefined') {
                StateManager.remove('form_loginForm');
            }
        } else {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Неверный логин или пароль. Используйте: admin / admin';
            errorDiv.style.display = 'block';
        }
    });
    
    // Автоматическое сохранение формы при изменении
    if (typeof StateManager !== 'undefined') {
        StateManager.autoSaveForm('loginForm');
    }
}

// Admin Panel Initialization
function initAdminPanel() {
    const currentUser = API.getCurrentUser();
    document.getElementById('userName').textContent = currentUser.name;
    
    // Navigation
    initNavigation();
    
    // Menu toggle
    initMenuToggle();
    
    // User menu
    initUserMenu();
    
    // Load dashboard
    loadDashboard();
    
    // Quick actions
    initQuickActions();
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            showSection(section);
            
            // Сохраняем активную секцию
            if (typeof StateManager !== 'undefined') {
                StateManager.saveActiveSection(section);
            }
        });
    });
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        loadSectionData(sectionName);
    }
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'groups':
            loadGroups();
            break;
        case 'students':
            loadStudents();
            break;
        case 'platform-users':
            loadPlatformUsers();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'content':
            loadContent();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Menu Toggle
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        
        // Сохраняем состояние сайдбара
        if (typeof StateManager !== 'undefined') {
            const uiState = StateManager.getUIState();
            uiState.sidebarOpen = sidebar.classList.contains('open');
            StateManager.saveUIState(uiState);
        }
    });
}

// User Menu
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutLink = document.getElementById('logoutLink');
    const settingsLink = document.getElementById('settingsLink');
    
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
        userDropdown.classList.remove('show');
    });
    
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        API.logout();
        showLoginScreen();
        document.getElementById('loginForm').reset();
    });
    
    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('settings');
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-section="settings"]').classList.add('active');
    });
}

// Dashboard
function loadDashboard() {
    const stats = API.getStats();
    
    document.getElementById('totalStudents').textContent = stats.totalStudents;
    document.getElementById('activeGroups').textContent = stats.activeGroups;
    document.getElementById('totalRevenue').textContent = stats.totalRevenue + '€';
    document.getElementById('newMessages').textContent = stats.newMessages;
    
    loadNotifications();
    updateBadges();
    
    // Автообновление каждые 30 секунд
    if (!window.dashboardInterval) {
        window.dashboardInterval = setInterval(() => {
            if (document.getElementById('dashboardSection').classList.contains('active')) {
                loadDashboard();
            }
        }, 30000);
    }
}

function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    const messages = API.getMessages().filter(m => !m.read).slice(0, 5);
    const payments = API.getPayments().filter(p => p.status === 'unpaid').slice(0, 3);
    
    notificationsList.innerHTML = '';
    
    messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = `
            <strong>Новое сообщение</strong>
            <p>От: ${msg.name} - ${msg.email}</p>
            <small>${new Date(msg.date).toLocaleString()}</small>
        `;
        notificationsList.appendChild(item);
    });
    
    payments.forEach(payment => {
        const student = API.getStudents().find(s => s.id === payment.studentId);
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = `
            <strong>Неоплаченный платеж</strong>
            <p>Студент: ${student ? student.name : 'Неизвестно'} - ${payment.amount}€</p>
        `;
        notificationsList.appendChild(item);
    });
    
    if (messages.length === 0 && payments.length === 0) {
        notificationsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Нет новых уведомлений</p>';
    }
}

function updateBadges() {
    const messages = API.getMessages().filter(m => !m.read);
    document.getElementById('messagesBadge').textContent = messages.length;
    document.getElementById('notificationsBadge').textContent = messages.length;
}

// Courses
function loadCourses() {
    const courses = API.getCourses();
    const tbody = document.getElementById('coursesTableBody');
    
    tbody.innerHTML = '';
    
    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Нет курсов. Добавьте первый курс.</td></tr>';
        return;
    }
    
    courses.forEach(course => {
        const groups = API.getGroups().filter(g => g.courseId === course.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.duration} месяцев</td>
            <td>${course.lessonsCount}</td>
            <td>${course.price}€</td>
            <td>${groups.length}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editCourse(${course.id})" title="Редактировать">✏️</button>
                    <button class="btn-icon" onclick="deleteCourse(${course.id})" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initQuickActions() {
    document.getElementById('quickAddStudent').addEventListener('click', () => showAddStudentModal());
    document.getElementById('quickAddGroup').addEventListener('click', () => showAddGroupModal());
    document.getElementById('quickAddCourse').addEventListener('click', () => showAddCourseModal());
    
    document.getElementById('addCourseBtn').addEventListener('click', () => showAddCourseModal());
    document.getElementById('addGroupBtn').addEventListener('click', () => showAddGroupModal());
    document.getElementById('addStudentBtn').addEventListener('click', () => showAddStudentModal());
    document.getElementById('addReviewBtn').addEventListener('click', () => showAddReviewModal());
    document.getElementById('addPlatformUserBtn')?.addEventListener('click', () => showAddPlatformUserModal());
    const platformUserRoleFilter = document.getElementById('platformUserRoleFilter');
    if (platformUserRoleFilter) {
        // Восстанавливаем сохраненный фильтр
        if (typeof StateManager !== 'undefined') {
            const filters = StateManager.getFilters();
            if (filters.platformUserRoleFilter) {
                platformUserRoleFilter.value = filters.platformUserRoleFilter;
            }
        }
        
        platformUserRoleFilter.addEventListener('change', function() {
            loadPlatformUsers();
            
            // Сохраняем фильтр
            if (typeof StateManager !== 'undefined') {
                const filters = StateManager.getFilters();
                filters.platformUserRoleFilter = this.value;
                StateManager.saveFilters(filters);
            }
        });
    }
}

// Modal Functions
function showModal(title, content, footer = '') {
    const modal = document.getElementById('modal');
    modal.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="btn-icon" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
        <div class="modal-footer">
            ${footer}
        </div>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Course Modals
function showAddCourseModal(courseId = null) {
    const course = courseId ? API.getCourses().find(c => c.id === courseId) : null;
    const content = `
        <form id="courseForm">
            <div class="form-group">
                <label>Название курса</label>
                <input type="text" name="name" value="${course ? course.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Описание</label>
                <textarea name="description">${course ? course.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Длительность (месяцев)</label>
                <input type="number" name="duration" value="${course ? course.duration : 3}" required>
            </div>
            <div class="form-group">
                <label>Количество занятий</label>
                <input type="number" name="lessonsCount" value="${course ? course.lessonsCount : 24}" required>
            </div>
            <div class="form-group">
                <label>Длительность занятия (минут)</label>
                <input type="number" name="lessonDuration" value="${course ? course.lessonDuration : 90}" required>
            </div>
            <div class="form-group">
                <label>Стоимость (€)</label>
                <input type="number" name="price" value="${course ? course.price : 260}" required>
            </div>
            <input type="hidden" name="id" value="${course ? course.id : ''}">
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="saveCourse()">Сохранить</button>
    `;
    showModal(courseId ? 'Редактировать курс' : 'Добавить курс', content, footer);
}

function saveCourse() {
    const form = document.getElementById('courseForm');
    const formData = new FormData(form);
    const course = Object.fromEntries(formData);
    course.duration = parseInt(course.duration);
    course.lessonsCount = parseInt(course.lessonsCount);
    course.lessonDuration = parseInt(course.lessonDuration);
    course.price = parseFloat(course.price);
    if (course.id) course.id = parseInt(course.id);
    
    API.saveCourse(course);
    closeModal();
    loadCourses();
    loadDashboard();
}

function editCourse(id) {
    showAddCourseModal(id);
}

function deleteCourse(id) {
    if (confirm('Вы уверены, что хотите удалить этот курс?')) {
        API.deleteCourse(id);
        loadCourses();
        loadDashboard();
    }
}

// Groups
function loadGroups() {
    const groups = API.getGroups();
    const courses = API.getCourses();
    const tbody = document.getElementById('groupsTableBody');
    
    tbody.innerHTML = '';
    
    if (groups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Нет групп. Добавьте первую группу.</td></tr>';
        return;
    }
    
    groups.forEach(group => {
        const course = courses.find(c => c.id === group.courseId);
        const students = API.getStudents().filter(s => s.groupId === group.id);
        const statusClass = group.status === 'active' ? 'status-active' : 'status-completed';
        const statusText = group.status === 'active' ? 'Активна' : 'Завершена';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${group.name}</td>
            <td>${course ? course.name : 'Не указан'}</td>
            <td>${group.teacher || 'Не назначен'}</td>
            <td>${students.length}</td>
            <td>${group.maxStudents || 7}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editGroup(${group.id})" title="Редактировать">✏️</button>
                    <button class="btn-icon" onclick="deleteGroup(${group.id})" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddGroupModal(groupId = null) {
    const group = groupId ? API.getGroups().find(g => g.id === groupId) : null;
    const courses = API.getCourses();
    const coursesOptions = courses.map(c => `<option value="${c.id}" ${group && group.courseId === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
    
    const content = `
        <form id="groupForm">
            <div class="form-group">
                <label>Название группы</label>
                <input type="text" name="name" value="${group ? group.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Курс</label>
                <select name="courseId" required>
                    <option value="">Выберите курс</option>
                    ${coursesOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Преподаватель</label>
                <input type="text" name="teacher" value="${group ? group.teacher : ''}">
            </div>
            <div class="form-group">
                <label>Максимум студентов</label>
                <input type="number" name="maxStudents" value="${group ? group.maxStudents : 7}" required>
            </div>
            <div class="form-group">
                <label>Статус</label>
                <select name="status" required>
                    <option value="active" ${group && group.status === 'active' ? 'selected' : ''}>Активна</option>
                    <option value="completed" ${group && group.status === 'completed' ? 'selected' : ''}>Завершена</option>
                </select>
            </div>
            <input type="hidden" name="id" value="${group ? group.id : ''}">
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="saveGroup()">Сохранить</button>
    `;
    showModal(groupId ? 'Редактировать группу' : 'Добавить группу', content, footer);
}

function saveGroup() {
    const form = document.getElementById('groupForm');
    const formData = new FormData(form);
    const group = Object.fromEntries(formData);
    group.courseId = parseInt(group.courseId);
    group.maxStudents = parseInt(group.maxStudents);
    if (group.id) group.id = parseInt(group.id);
    
    API.saveGroup(group);
    closeModal();
    loadGroups();
    loadDashboard();
}

function editGroup(id) {
    showAddGroupModal(id);
}

function deleteGroup(id) {
    if (confirm('Вы уверены, что хотите удалить эту группу?')) {
        API.deleteGroup(id);
        loadGroups();
        loadDashboard();
    }
}

// Students
function loadStudents() {
    const students = API.getStudents();
    const groups = API.getGroups();
    const tbody = document.getElementById('studentsTableBody');
    
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Нет студентов. Добавьте первого студента.</td></tr>';
        return;
    }
    
    students.forEach(student => {
        const group = groups.find(g => g.id === student.groupId);
        const payments = API.getPayments().filter(p => p.studentId === student.id);
        const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
        const course = student.groupId ? API.getCourses().find(c => c.id === group?.courseId) : null;
        const totalPrice = course ? course.price : 0;
        
        let paymentStatus = 'status-unpaid';
        let paymentText = 'Не оплачено';
        if (totalPaid >= totalPrice) {
            paymentStatus = 'status-paid';
            paymentText = 'Оплачено';
        } else if (totalPaid > 0) {
            paymentStatus = 'status-partial';
            paymentText = `Частично (${totalPaid}€/${totalPrice}€)`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${group ? group.name : 'Не назначена'}</td>
            <td><span class="status-badge ${paymentStatus}">${paymentText}</span></td>
            <td>${student.attendance || 0}%</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editStudent(${student.id})" title="Редактировать">✏️</button>
                    <button class="btn-icon" onclick="viewStudent(${student.id})" title="Просмотр">👁️</button>
                    <button class="btn-icon" onclick="deleteStudent(${student.id})" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Search functionality
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        // Восстанавливаем сохраненное значение поиска
        if (typeof StateManager !== 'undefined') {
            const filters = StateManager.getFilters();
            if (filters.studentSearch) {
                searchInput.value = filters.studentSearch;
            }
        }
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
            
            // Сохраняем значение поиска
            if (typeof StateManager !== 'undefined') {
                const filters = StateManager.getFilters();
                filters.studentSearch = this.value;
                StateManager.saveFilters(filters);
            }
        });
    }
}

function showAddStudentModal(studentId = null) {
    const student = studentId ? API.getStudents().find(s => s.id === studentId) : null;
    const groups = API.getGroups();
    const groupsOptions = groups.map(g => `<option value="${g.id}" ${student && student.groupId === g.id ? 'selected' : ''}>${g.name}</option>`).join('');
    
    const content = `
        <form id="studentForm">
            <div class="form-group">
                <label>ФИО</label>
                <input type="text" name="name" value="${student ? student.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${student ? student.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" name="phone" value="${student ? student.phone : ''}" required>
            </div>
            <div class="form-group">
                <label>Группа</label>
                <select name="groupId">
                    <option value="">Не назначена</option>
                    ${groupsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Уровень итальянского</label>
                <select name="level">
                    <option value="beginner" ${student && student.level === 'beginner' ? 'selected' : ''}>Начинающий</option>
                    <option value="elementary" ${student && student.level === 'elementary' ? 'selected' : ''}>Элементарный</option>
                    <option value="intermediate" ${student && student.level === 'intermediate' ? 'selected' : ''}>Средний</option>
                </select>
            </div>
            <input type="hidden" name="id" value="${student ? student.id : ''}">
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="saveStudent()">Сохранить</button>
    `;
    showModal(studentId ? 'Редактировать студента' : 'Добавить студента', content, footer);
}

function saveStudent() {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    const student = Object.fromEntries(formData);
    if (student.groupId) student.groupId = parseInt(student.groupId);
    if (student.id) student.id = parseInt(student.id);
    
    const isNewStudent = !student.id;
    const savedStudent = API.saveStudent(student);
    
    // Если создан новый студент, показываем данные для входа на платформу
    if (isNewStudent && savedStudent.email) {
        const platformUsers = API.getPlatformUsers();
        const normalizedEmail = (savedStudent.email || '').trim().toLowerCase();
        const platformUser = platformUsers.find(u => 
            u.id === savedStudent.id || (u.email || '').trim().toLowerCase() === normalizedEmail
        );
        
        if (platformUser) {
            const loginPassword = platformUser.password || normalizedEmail.substring(0, 6) + '123';
            alert(`Студент "${savedStudent.name}" успешно создан!\n\nДанные для входа на платформу обучения:\nEmail: ${normalizedEmail}\nПароль: ${loginPassword}\n\nСохраните эти данные для входа на платформу обучения.`);
        }
    }
    
    closeModal();
    loadStudents();
    loadPlatformUsers(); // Обновляем список пользователей платформы
    loadDashboard();
}

function editStudent(id) {
    showAddStudentModal(id);
}

function viewStudent(id) {
    const student = API.getStudents().find(s => s.id === id);
    const group = student.groupId ? API.getGroups().find(g => g.id === student.groupId) : null;
    const payments = API.getPayments().filter(p => p.studentId === id);
    
    const content = `
        <div>
            <h4>Информация о студенте</h4>
            <p><strong>ФИО:</strong> ${student.name}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Телефон:</strong> ${student.phone}</p>
            <p><strong>Группа:</strong> ${group ? group.name : 'Не назначена'}</p>
            <p><strong>Уровень:</strong> ${student.level || 'Не указан'}</p>
            
            <h4 style="margin-top: 1.5rem;">История оплат</h4>
            ${payments.length > 0 ? payments.map(p => `
                <p>${new Date(p.date).toLocaleDateString()} - ${p.amount}€ - ${p.status === 'paid' ? 'Оплачено' : 'Не оплачено'}</p>
            `).join('') : '<p>Нет оплат</p>'}
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
        <button class="btn btn-primary" onclick="editStudent(${id}); closeModal();">Редактировать</button>
    `;
    showModal('Просмотр студента', content, footer);
}

function deleteStudent(id) {
    if (confirm('Вы уверены, что хотите удалить этого студента?')) {
        API.deleteStudent(id);
        loadStudents();
        loadDashboard();
    }
}

// Payments
function loadPayments() {
    const payments = API.getPayments();
    const students = API.getStudents();
    const filter = document.getElementById('paymentFilter').value;
    
    let filteredPayments = payments;
    if (filter !== 'all') {
        filteredPayments = payments.filter(p => p.status === filter);
    }
    
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Нет оплат</td></tr>';
        return;
    }
    
    filteredPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(payment => {
        const student = students.find(s => s.id === payment.studentId);
        const statusClass = payment.status === 'paid' ? 'status-paid' : payment.status === 'partial' ? 'status-partial' : 'status-unpaid';
        const statusText = payment.status === 'paid' ? 'Оплачено' : payment.status === 'partial' ? 'Частично' : 'Не оплачено';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${student ? student.name : 'Неизвестно'}</td>
            <td>${payment.amount}€</td>
            <td>${payment.method || 'Не указан'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editPayment(${payment.id})" title="Редактировать">✏️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    const paymentFilter = document.getElementById('paymentFilter');
    if (paymentFilter) {
        // Восстанавливаем сохраненный фильтр
        if (typeof StateManager !== 'undefined') {
            const filters = StateManager.getFilters();
            if (filters.paymentFilter) {
                paymentFilter.value = filters.paymentFilter;
            }
        }
        
        paymentFilter.addEventListener('change', function() {
            loadPayments();
            
            // Сохраняем фильтр
            if (typeof StateManager !== 'undefined') {
                const filters = StateManager.getFilters();
                filters.paymentFilter = this.value;
                StateManager.saveFilters(filters);
            }
        });
    }
}

// Reviews
function loadReviews() {
    const reviews = API.getReviews();
    const grid = document.getElementById('reviewsGrid');
    
    grid.innerHTML = '';
    
    if (reviews.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Нет отзывов. Добавьте первый отзыв.</p>';
        return;
    }
    
    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; box-shadow: var(--shadow); margin-bottom: 1rem;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h4>${review.author || 'Аноним'}</h4>
                    <p style="color: var(--text-light); font-size: 0.9rem;">${review.date ? new Date(review.date).toLocaleDateString() : ''}</p>
                </div>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editReview(${review.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteReview(${review.id})">🗑️</button>
                </div>
            </div>
            <p>${review.text}</p>
            ${review.rating ? `<div style="margin-top: 0.5rem;">⭐ ${review.rating}/5</div>` : ''}
        `;
        grid.appendChild(card);
    });
}

function showAddReviewModal(reviewId = null) {
    const review = reviewId ? API.getReviews().find(r => r.id === reviewId) : null;
    const students = API.getStudents();
    const studentsOptions = students.map(s => `<option value="${s.id}" ${review && review.studentId === s.id ? 'selected' : ''}>${s.name}</option>`).join('');
    
    const content = `
        <form id="reviewForm">
            <div class="form-group">
                <label>Автор</label>
                <input type="text" name="author" value="${review ? review.author : ''}" required>
            </div>
            <div class="form-group">
                <label>Студент (опционально)</label>
                <select name="studentId">
                    <option value="">Не привязан</option>
                    ${studentsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Текст отзыва</label>
                <textarea name="text" required>${review ? review.text : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Рейтинг (1-5)</label>
                <input type="number" name="rating" min="1" max="5" value="${review ? review.rating : ''}">
            </div>
            <input type="hidden" name="id" value="${review ? review.id : ''}">
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="saveReview()">Сохранить</button>
    `;
    showModal(reviewId ? 'Редактировать отзыв' : 'Добавить отзыв', content, footer);
}

function saveReview() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    const review = Object.fromEntries(formData);
    if (review.studentId) review.studentId = parseInt(review.studentId);
    if (review.rating) review.rating = parseInt(review.rating);
    if (review.id) review.id = parseInt(review.id);
    review.date = new Date().toISOString();
    
    API.saveReview(review);
    closeModal();
    loadReviews();
}

function editReview(id) {
    showAddReviewModal(id);
}

function deleteReview(id) {
    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        API.deleteReview(id);
        loadReviews();
    }
}

// Messages
function loadMessages() {
    const messages = API.getMessages();
    const filter = document.getElementById('messageFilter').value;
    
    let filteredMessages = messages;
    if (filter === 'unread') {
        filteredMessages = messages.filter(m => !m.read);
    } else if (filter === 'read') {
        filteredMessages = messages.filter(m => m.read);
    }
    
    const list = document.getElementById('messagesList');
    list.innerHTML = '';
    
    if (filteredMessages.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 2rem;">Нет сообщений</p>';
        return;
    }
    
    filteredMessages.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(message => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.style.cursor = 'pointer';
        item.style.marginBottom = '1rem';
        if (message.read) item.style.opacity = '0.7';
        
        const isApplication = message.type === 'course_application';
        const paymentText = message.payment === 'installment' ? 'Оплата в 2 части (130€ + 130€)' : 'Полная оплата 260€';
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <strong>${message.name}</strong>
                        ${isApplication ? '<span class="status-badge status-active" style="font-size: 0.75rem;">Заявка на курс</span>' : ''}
                        ${!message.read ? '<span class="badge">Новое</span>' : ''}
                    </div>
                    <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${message.email}</p>
                    <p style="margin: 0.25rem 0;"><strong>Телефон:</strong> ${message.phone || 'Не указан'}</p>
                    ${message.message ? `<p style="margin: 0.5rem 0; padding: 0.75rem; background: var(--bg-color); border-radius: 6px;">${message.message}</p>` : ''}
                    ${isApplication ? `<p style="margin: 0.5rem 0;"><strong>Тип оплаты:</strong> ${paymentText}</p>` : ''}
                    <small style="color: var(--text-light);">${new Date(message.date).toLocaleString()}</small>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
                    ${message.phone ? `<a href="https://wa.me/${message.phone.replace(/\D/g, '')}" target="_blank" class="btn-icon" title="Написать в WhatsApp">💬</a>` : ''}
                    ${message.email ? `<a href="mailto:${message.email}" class="btn-icon" title="Написать email">📧</a>` : ''}
                </div>
            </div>
        `;
        item.addEventListener('click', (e) => {
            // Не помечаем как прочитанное при клике на ссылки
            if (!e.target.closest('a')) {
                API.markMessageAsRead(message.id);
                loadMessages();
                updateBadges();
            }
        });
        list.appendChild(item);
    });
    
    const messageFilter = document.getElementById('messageFilter');
    if (messageFilter) {
        // Восстанавливаем сохраненный фильтр
        if (typeof StateManager !== 'undefined') {
            const filters = StateManager.getFilters();
            if (filters.messageFilter) {
                messageFilter.value = filters.messageFilter;
            }
        }
        
        messageFilter.addEventListener('change', function() {
            loadMessages();
            
            // Сохраняем фильтр
            if (typeof StateManager !== 'undefined') {
                const filters = StateManager.getFilters();
                filters.messageFilter = this.value;
                StateManager.saveFilters(filters);
            }
        });
    }
}

// Platform Users
function loadPlatformUsers() {
    // Убеждаемся, что PlatformAPI инициализирован
    if (typeof PlatformAPI === 'undefined') {
        console.error('PlatformAPI не загружен');
        const tbody = document.getElementById('platformUsersTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--error-color);">Ошибка загрузки платформы обучения</td></tr>';
        }
        return;
    }
    
    const users = API.getPlatformUsers();
    const groups = API.getGroups();
    const filter = document.getElementById('platformUserRoleFilter')?.value || 'all';
    
    let filteredUsers = users;
    if (filter !== 'all') {
        filteredUsers = users.filter(u => u.role === filter);
    }
    
    const tbody = document.getElementById('platformUsersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Нет пользователей. Добавьте первого пользователя.</td></tr>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const group = user.groupId ? groups.find(g => g.id === user.groupId) : null;
        
        // Получаем прогресс для студентов
        let progressHtml = '-';
        let pointsHtml = '-';
        if (user.role === 'student' && typeof PlatformAPI !== 'undefined') {
            const courses = PlatformAPI.getCourses();
            if (courses.length > 0) {
                const progress = PlatformAPI.getStudentProgress(user.id, courses[0].id);
                if (progress) {
                    progressHtml = `${progress.progress}% (${progress.completedLessons}/${progress.totalLessons} уроков)`;
                    pointsHtml = `${progress.totalPoints} очков`;
                }
            }
        }
        
        const roleBadge = user.role === 'student' ? 
            '<span class="status-badge status-active">Студент</span>' : 
            '<span class="status-badge" style="background: #fef3c7; color: #92400e;">Преподаватель</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name || 'Не указано'}</td>
            <td>${user.email || 'Не указано'}</td>
            <td>${roleBadge}</td>
            <td>${group ? group.name : 'Не назначена'}</td>
            <td>${progressHtml}</td>
            <td>${pointsHtml}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editPlatformUser(${user.id})" title="Редактировать">✏️</button>
                    <button class="btn-icon" onclick="viewPlatformUserProgress(${user.id})" title="Просмотр прогресса">📊</button>
                    <button class="btn-icon" onclick="deletePlatformUser(${user.id})" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddPlatformUserModal(userId = null) {
    const user = userId ? API.getPlatformUser(userId) : null;
    const groups = API.getGroups();
    const groupsOptions = groups.map(g => `<option value="${g.id}" ${user && user.groupId === g.id ? 'selected' : ''}>${g.name}</option>`).join('');
    
    const content = `
        <form id="platformUserForm">
            <div class="form-group">
                <label>Имя</label>
                <input type="text" name="name" value="${user ? user.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email (логин для входа)</label>
                <input type="email" name="email" value="${user ? user.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" name="password" ${user ? 'placeholder="Оставьте пустым, чтобы не менять"' : 'placeholder="По умолчанию: admin"'} value="">
                <small style="color: var(--text-light);">${user ? 'Оставьте пустым, чтобы не менять пароль' : 'По умолчанию будет установлен пароль "admin"'}</small>
            </div>
            <div class="form-group">
                <label>Роль</label>
                <select name="role" required>
                    <option value="student" ${user && user.role === 'student' ? 'selected' : ''}>Студент</option>
                    <option value="teacher" ${user && user.role === 'teacher' ? 'selected' : ''}>Преподаватель</option>
                </select>
            </div>
            <div class="form-group" id="groupIdGroup">
                <label>Группа (только для студентов)</label>
                <select name="groupId">
                    <option value="">Не назначена</option>
                    ${groupsOptions}
                </select>
            </div>
            <input type="hidden" name="id" value="${user ? user.id : ''}">
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="savePlatformUser()">Сохранить</button>
    `;
    showModal(userId ? 'Редактировать пользователя' : 'Добавить пользователя', content, footer);
    
    // Показываем/скрываем поле группы в зависимости от роли
    const roleSelect = document.querySelector('#platformUserForm select[name="role"]');
    const groupIdGroup = document.getElementById('groupIdGroup');
    
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            if (this.value === 'student') {
                groupIdGroup.style.display = 'block';
            } else {
                groupIdGroup.style.display = 'none';
            }
        });
        
        // Устанавливаем начальное состояние
        if (roleSelect.value === 'teacher') {
            groupIdGroup.style.display = 'none';
        }
    }
}

function savePlatformUser() {
    const form = document.getElementById('platformUserForm');
    if (!form) {
        alert('Форма не найдена');
        return;
    }
    
    const formData = new FormData(form);
    
    // Получаем значения напрямую из полей формы
    const passwordInput = form.querySelector('input[name="password"]');
    const emailInput = form.querySelector('input[name="email"]');
    const nameInput = form.querySelector('input[name="name"]');
    const roleSelect = form.querySelector('select[name="role"]');
    const groupSelect = form.querySelector('select[name="groupId"]');
    const idInput = form.querySelector('input[name="id"]');
    
    const user = {
        name: (nameInput?.value || '').trim(),
        email: (emailInput?.value || '').trim().toLowerCase(),
        password: (passwordInput?.value || '').trim(),
        role: roleSelect?.value || 'student',
        groupId: groupSelect?.value || null,
        id: idInput?.value ? parseInt(idInput.value) : null
    };
    
    console.log('Данные из формы:', {
        name: user.name,
        email: user.email,
        password: user.password ? '***' : 'ПУСТО',
        role: user.role,
        groupId: user.groupId,
        id: user.id
    });
    
    // Проверка обязательных полей
    if (!user.email) {
        alert('Email обязателен для заполнения');
        return;
    }
    
    if (!user.name) {
        alert('Имя обязателено для заполнения');
        return;
    }
    
    // Проверка email на уникальность (исключая текущего пользователя при редактировании)
    const existingUsers = API.getPlatformUsers();
    const emailExists = existingUsers.find(u => {
        const existingEmail = (u.email || '').trim().toLowerCase();
        return existingEmail === user.email && 
               (!user.id || u.id !== user.id);
    });
    
    if (emailExists) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    // Обработка пароля - ВАЖНО: всегда нормализуем
    // Генерируем пароль из email (первые 6 символов + "123") если не указан
    const generatePasswordFromEmail = (email) => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        return normalizedEmail.substring(0, 6) + '123';
    };
    
    if (user.id) {
        // Редактирование существующего пользователя
        const existingUser = API.getPlatformUser(user.id);
        if (existingUser) {
            // Если пароль не указан или пустой, сохраняем старый пароль
            if (!user.password || user.password.trim() === '') {
                user.password = existingUser.password || generatePasswordFromEmail(user.email);
                console.log('Используется существующий пароль для пользователя:', user.email);
            } else {
                // Нормализуем новый пароль
                user.password = user.password.trim();
                console.log('Устанавливается новый пароль для пользователя:', user.email);
            }
        } else {
            // Если пользователь не найден, но есть ID, создаем нового
            if (!user.password || user.password.trim() === '') {
                user.password = generatePasswordFromEmail(user.email);
            } else {
                user.password = user.password.trim();
            }
        }
    } else {
        // Создание нового пользователя
        if (!user.password || user.password.trim() === '') {
            user.password = generatePasswordFromEmail(user.email);
            console.log('Используется сгенерированный пароль для нового пользователя:', user.email, '→', user.password);
        } else {
            user.password = user.password.trim();
            console.log('Используется указанный пароль для нового пользователя:', user.email);
        }
    }
    
    // Финальная проверка: убеждаемся, что пароль не пустой
    if (!user.password || user.password.trim() === '') {
        user.password = generatePasswordFromEmail(user.email);
        console.warn('Пароль был пустым, сгенерирован из email');
    }
    
    // Нормализуем все строковые поля перед сохранением
    user.email = (user.email || '').trim().toLowerCase();
    user.password = (user.password || '').trim();
    user.name = (user.name || '').trim();
    
    // Устанавливаем groupId в зависимости от роли
    if (user.role === 'student') {
        if (user.groupId) {
            user.groupId = parseInt(user.groupId);
        } else {
            user.groupId = null;
        }
        // Удаляем groups для студентов
        delete user.groups;
    } else if (user.role === 'teacher') {
        // Преподаватели не имеют группы, но имеют groups (массив ID групп)
        delete user.groupId;
        if (!user.groups || !Array.isArray(user.groups)) {
            user.groups = [];
        }
    } else {
        delete user.groupId;
        delete user.groups;
    }
    
    // Убеждаемся, что все обязательные поля установлены
    if (!user.name) {
        user.name = user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор';
    }
    
    // Финальная проверка пароля перед сохранением
    if (!user.password || user.password.trim() === '') {
        const generatePasswordFromEmail = (email) => {
            const normalizedEmail = (email || '').trim().toLowerCase();
            return normalizedEmail.substring(0, 6) + '123';
        };
        user.password = generatePasswordFromEmail(user.email);
        console.warn('Пароль все еще пустой, сгенерирован из email');
    }
    
    console.log('Сохранение пользователя с данными:', {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password ? '*** (длина: ' + user.password.length + ')' : 'ПУСТО',
        role: user.role,
        groupId: user.groupId
    });
    
    // Сохраняем пользователя
    console.log('🔄 Начало сохранения пользователя:', user.email);
    const savedUser = API.savePlatformUser(user);
    
    if (!savedUser) {
        console.error('❌ API.savePlatformUser вернул null');
        alert('Ошибка при сохранении пользователя. Проверьте консоль браузера (F12).');
        return;
    }
    
    console.log('✅ Пользователь сохранен через API:', savedUser);
    
    // ВАЖНО: Принудительно перечитываем пользователей из localStorage
    // Читаем напрямую из localStorage сразу после сохранения
    const rawData = localStorage.getItem('platform_users');
    console.log('📖 Чтение из localStorage после сохранения', rawData ? 'данные найдены' : 'данные отсутствуют');
    
    let allUsers = [];
    let verifyUser = null;
    
    if (rawData) {
        try {
            allUsers = JSON.parse(rawData);
            console.log(`📋 Найдено пользователей: ${allUsers.length}`);
            console.log('📋 Все email в системе:', allUsers.map(u => u.email));
            
            // Ищем пользователя по email (самый надежный способ)
            verifyUser = allUsers.find(u => {
                const uEmail = (u.email || '').trim().toLowerCase();
                const searchEmail = user.email.trim().toLowerCase();
                const match = uEmail === searchEmail;
                if (match) {
                    console.log('✅ Найден пользователь:', {
                        id: u.id,
                        email: u.email,
                        role: u.role,
                        hasPassword: !!u.password
                    });
                }
                return match;
            });
            
            if (verifyUser) {
                console.log('✅ Пользователь найден в localStorage:', {
                    id: verifyUser.id,
                    email: verifyUser.email,
                    password: verifyUser.password ? '*** (длина: ' + verifyUser.password.length + ')' : 'ПУСТО',
                    role: verifyUser.role
                });
            } else {
                console.warn(`⚠️ Пользователь ${user.email} не найден в списке. Доступные email:`, 
                    allUsers.map(u => u.email));
            }
        } catch (e) {
            console.error('Ошибка парсинга localStorage:', e);
        }
    }
    
    // Если пользователь все еще не найден, пытаемся сохранить напрямую
    if (!verifyUser) {
        console.warn('⚠️ Пользователь не найден после сохранения, пытаемся сохранить напрямую');
        
        // Получаем текущий список
        const currentUsers = JSON.parse(localStorage.getItem('platform_users') || '[]');
        
        // Проверяем, нет ли уже пользователя с таким email
        const existingIndex = currentUsers.findIndex(u => 
            (u.email || '').trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        
        if (existingIndex >= 0) {
            // Обновляем существующего
            currentUsers[existingIndex] = {
                ...currentUsers[existingIndex],
                ...savedUser,
                password: savedUser.password || user.password || (user.email.substring(0, 6) + '123')
            };
            verifyUser = currentUsers[existingIndex];
        } else {
            // Добавляем нового
            const newUser = {
                ...savedUser,
                id: savedUser.id || Date.now(),
                email: user.email.trim().toLowerCase(),
                password: savedUser.password || user.password || (user.email.substring(0, 6) + '123'),
                role: user.role || 'student',
                name: user.name || 'Пользователь'
            };
            currentUsers.push(newUser);
            verifyUser = newUser;
        }
        
        // Сохраняем обратно
        localStorage.setItem('platform_users', JSON.stringify(currentUsers));
        console.log('💾 Пользователь сохранен напрямую в localStorage');
        
        // Проверяем еще раз
        const verifyData = localStorage.getItem('platform_users');
        const verifyUsers = JSON.parse(verifyData || '[]');
        verifyUser = verifyUsers.find(u => 
            (u.email || '').trim().toLowerCase() === user.email.trim().toLowerCase()
        );
    }
    
    if (verifyUser) {
        console.log('✅ Пользователь успешно сохранен и проверен:', {
            id: verifyUser.id,
            email: verifyUser.email,
            password: verifyUser.password ? '*** (длина: ' + verifyUser.password.length + ')' : 'ПУСТО',
            role: verifyUser.role
        });
        
        // Показываем сохраненный пароль пользователю
        const savedPassword = verifyUser.password || user.password || (user.email.substring(0, 6) + '123');
        alert(`✅ Пользователь "${user.name}" успешно ${user.id ? 'обновлен' : 'создан'}!\n\nEmail: ${verifyUser.email}\nПароль: ${savedPassword}\nРоль: ${verifyUser.role === 'student' ? 'Студент' : 'Преподаватель'}\n\nТеперь можно войти на платформу обучения с этими данными.`);
    } else {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: пользователь не найден после всех попыток сохранения');
        console.log('Все пользователи в системе:', allUsers);
        console.log('Попытка сохранения пользователя:', user);
        alert('❌ Критическая ошибка: пользователь не был сохранен.\n\nПроверьте консоль браузера (F12) для деталей.\n\nEmail: ' + user.email);
        return;
    }
    
    closeModal();
    
    // Принудительно обновляем список пользователей
    loadPlatformUsers();
    loadDashboard();
    
    // Дополнительная проверка через небольшую задержку
    setTimeout(() => {
        const finalCheck = API.getPlatformUsers();
        const finalUser = finalCheck.find(u => 
            (u.email || '').trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        if (finalUser) {
            console.log('✅ Финальная проверка: пользователь найден в системе');
        } else {
            console.error('❌ Финальная проверка: пользователь НЕ найден в системе');
        }
    }, 500);
}

function editPlatformUser(id) {
    showAddPlatformUserModal(id);
}

function deletePlatformUser(id) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
        API.deletePlatformUser(id);
        loadPlatformUsers();
        loadDashboard();
    }
}

function viewPlatformUserProgress(userId) {
    const user = API.getPlatformUser(userId);
    if (!user) return;
    
    if (user.role !== 'student') {
        alert('Прогресс доступен только для студентов');
        return;
    }
    
    if (typeof PlatformAPI === 'undefined') {
        alert('Платформа обучения не загружена');
        return;
    }
    
    const courses = PlatformAPI.getCourses();
    if (courses.length === 0) {
        alert('Нет доступных курсов');
        return;
    }
    
    const course = courses[0];
    const progress = PlatformAPI.getStudentProgress(userId, course.id);
    const answers = PlatformAPI.getAllStudentAnswers(userId);
    const modules = PlatformAPI.getModules(course.id);
    
    let modulesHtml = '';
    modules.forEach(module => {
        const lessons = PlatformAPI.getLessons(module.id);
        const lessonsHtml = lessons.map(lesson => {
            const assignments = PlatformAPI.getAssignments(lesson.id);
            const lessonAnswers = PlatformAPI.getStudentAnswers(userId, lesson.id);
            const completed = lessonAnswers.filter(a => a.answer).length;
            const progressPercent = assignments.length > 0 ? (completed / assignments.length) * 100 : 0;
            const lessonPoints = lessonAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
            
            return `
                <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Урок ${lesson.order}: ${lesson.title}</strong>
                            <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem;">
                                Заданий: ${completed}/${assignments.length} | Очков: ${lessonPoints}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div class="progress-bar small" style="width: 100px; margin-bottom: 0.25rem;">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span style="font-size: 0.875rem; color: var(--text-light);">${Math.round(progressPercent)}%</span>
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
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Прогресс студента: ${user.name}</h3>
            <button class="btn-icon" onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
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
                    <div class="stat-item">
                        <div class="stat-value">${answers.filter(a => a.graded).length}</div>
                        <div class="stat-label">Оцененных заданий</div>
                    </div>
                </div>
            </div>
            <h3 style="margin-bottom: 1rem;">Детальный прогресс по урокам</h3>
            ${modulesHtml}
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    
    overlay.style.display = 'flex';
}

// Content & Settings (заглушки)
function loadContent() {
    document.getElementById('contentEditor').innerHTML = '<p>Редактор контента будет здесь</p>';
}

function loadSettings() {
    document.getElementById('settingsContent').innerHTML = '<p>Настройки системы будут здесь</p>';
}

// Export functions to window for onclick handlers
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.saveCourse = saveCourse;
window.editGroup = editGroup;
window.deleteGroup = deleteGroup;
window.saveGroup = saveGroup;
window.editStudent = editStudent;
window.viewStudent = viewStudent;
window.deleteStudent = deleteStudent;
window.saveStudent = saveStudent;
window.editReview = editReview;
window.deleteReview = deleteReview;
window.saveReview = saveReview;
window.closeModal = closeModal;
window.showAddCourseModal = showAddCourseModal;
window.showAddGroupModal = showAddGroupModal;
window.showAddStudentModal = showAddStudentModal;
window.showAddReviewModal = showAddReviewModal;
window.showAddPlatformUserModal = showAddPlatformUserModal;
window.savePlatformUser = savePlatformUser;
window.editPlatformUser = editPlatformUser;
window.deletePlatformUser = deletePlatformUser;
window.viewPlatformUserProgress = viewPlatformUserProgress;

