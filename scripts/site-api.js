// API для связи основного сайта с админкой
const SiteAPI = {
    // Сохранение заявки на курс
    saveApplication(applicationData) {
        try {
            // Получаем существующие сообщения из админки
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            
            // Создаем новое сообщение/заявку
            const application = {
                id: Date.now(),
                type: 'course_application',
                name: applicationData.name + ' ' + applicationData.surname,
                email: applicationData.email,
                phone: applicationData.phone,
                message: applicationData.message || '',
                payment: applicationData.payment === 'on' ? 'installment' : 'full',
                date: new Date().toISOString(),
                read: false,
                status: 'new'
            };
            
            messages.push(application);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            return { success: true, application };
        } catch (error) {
            console.error('Error saving application:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Проверка доступности админки
    isAdminAvailable() {
        try {
            return typeof Storage !== 'undefined';
        } catch (e) {
            return false;
        }
    }
};

// Экспорт для использования
window.SiteAPI = SiteAPI;

