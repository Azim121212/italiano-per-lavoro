// State Manager - Утилита для сохранения и восстановления состояния приложения
const StateManager = {
    // Префиксы для разных страниц
    prefixes: {
        main: 'main_',
        platform: 'platform_',
        admin: 'admin_'
    },

    // Получить префикс для текущей страницы
    getPrefix() {
        const path = window.location.pathname;
        if (path.includes('/admin/')) return this.prefixes.admin;
        if (path.includes('/platform/')) return this.prefixes.platform;
        return this.prefixes.main;
    },

    // Сохранить значение
    save(key, value) {
        try {
            const prefix = this.getPrefix();
            const fullKey = prefix + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения состояния:', error);
            return false;
        }
    },

    // Получить значение
    load(key, defaultValue = null) {
        try {
            const prefix = this.getPrefix();
            const fullKey = prefix + key;
            const value = localStorage.getItem(fullKey);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Ошибка загрузки состояния:', error);
            return defaultValue;
        }
    },

    // Удалить значение
    remove(key) {
        try {
            const prefix = this.getPrefix();
            const fullKey = prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Ошибка удаления состояния:', error);
            return false;
        }
    },

    // Сохранить состояние формы
    saveForm(formId, formData = null) {
        const form = document.getElementById(formId);
        if (!form) return false;

        if (!formData) {
            formData = {};
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.value;
                    }
                } else {
                    formData[input.name] = input.value;
                }
            });
        }

        return this.save('form_' + formId, formData);
    },

    // Восстановить состояние формы
    restoreForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const formData = this.load('form_' + formId);
        if (!formData) return false;

        Object.keys(formData).forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = formData[name];
                } else if (input.type === 'radio') {
                    if (input.value === formData[name]) {
                        input.checked = true;
                    }
                } else {
                    input.value = formData[name];
                }
            }
        });

        return true;
    },

    // Сохранить позицию прокрутки
    saveScrollPosition() {
        const scrollData = {
            x: window.scrollX || window.pageXOffset,
            y: window.scrollY || window.pageYOffset,
            timestamp: Date.now()
        };
        this.save('scroll_position', scrollData);
    },

    // Восстановить позицию прокрутки
    restoreScrollPosition() {
        const scrollData = this.load('scroll_position');
        if (scrollData && scrollData.y) {
            // Восстанавливаем только если прошло меньше 5 минут
            const timeDiff = Date.now() - (scrollData.timestamp || 0);
            if (timeDiff < 5 * 60 * 1000) {
                window.scrollTo(scrollData.x || 0, scrollData.y || 0);
                return true;
            }
        }
        return false;
    },

    // Сохранить активную секцию/вкладку
    saveActiveSection(sectionId) {
        this.save('active_section', sectionId);
    },

    // Получить активную секцию
    getActiveSection() {
        return this.load('active_section', null);
    },

    // Сохранить состояние фильтров
    saveFilters(filters) {
        this.save('filters', filters);
    },

    // Получить сохраненные фильтры
    getFilters() {
        return this.load('filters', {});
    },

    // Сохранить состояние UI (открытые модальные окна, сайдбары и т.д.)
    saveUIState(state) {
        this.save('ui_state', state);
    },

    // Получить состояние UI
    getUIState() {
        return this.load('ui_state', {});
    },

    // Очистить все сохраненные состояния для текущей страницы
    clearAll() {
        const prefix = this.getPrefix();
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Автоматическое сохранение состояния формы при изменении
    autoSaveForm(formId, delay = 500) {
        const form = document.getElementById(formId);
        if (!form) return;

        let timeout;
        const saveHandler = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.saveForm(formId);
            }, delay);
        };

        form.addEventListener('input', saveHandler);
        form.addEventListener('change', saveHandler);
    },

    // Автоматическое сохранение позиции прокрутки
    autoSaveScroll() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.saveScrollPosition();
            }, 500);
        });
    }
};

// Экспорт для использования
window.StateManager = StateManager;

