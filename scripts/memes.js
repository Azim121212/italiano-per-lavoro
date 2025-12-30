// Библиотека мемов для замены эмодзи
// Используем популярные мем-шаблоны с уникальными изображениями
const memesLibrary = {
    // Итальянский флаг / Италия
    italy: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
    ],
    // Группа людей
    people: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian
        'https://i.imgflip.com/1bh8.jpg', // Scumbag Steve
    ],
    // Календарь / Время
    calendar: [
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Часы / Время
    time: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian
    ],
    // Книги / Обучение
    books: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhk.jpg', // Y U No
    ],
    // Проблема / Грусть
    problem: [
        'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian
        'https://i.imgflip.com/1bh8.jpg', // Scumbag Steve
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
    ],
    // Решение / Идея
    solution: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
    ],
    // Работа / Бизнес
    work: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Обучение / Преподаватель
    teacher: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Местоположение
    location: [
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
    ],
    // Телефон / Поддержка
    phone: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
    ],
    // Результаты / Победа
    results: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
    ],
    // Разговор / Практика
    practice: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Студент
    student: [
        'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Покупки / Магазин
    shopping: [
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
    ],
    // Цель / Фокус
    target: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
    ],
    // Документы / Письмо
    document: [
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
    ],
    // Театр / Ролевые игры
    theater: [
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bij.jpg', // Success Kid
    ],
    // Обновление / Повтор
    refresh: [
        'https://i.imgflip.com/1bhk.jpg', // Y U No
        'https://i.imgflip.com/1bh5.jpg', // First World Problems
    ],
    // По умолчанию
    default: [
        'https://i.imgflip.com/1bij.jpg', // Success Kid
        'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man
        'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian
    ]
};

// Уникальные мемы для каждого элемента (чтобы не повторялись)
const uniqueMemes = {
    'solution-image': 'https://i.imgflip.com/1bij.jpg', // Success Kid для решения
    'module-1': 'https://i.imgflip.com/1bhk.jpg', // Y U No для модуля 1
    'module-2': 'https://i.imgflip.com/1bhw.jpg', // The Most Interesting Man для модуля 2
    'module-3': 'https://i.imgflip.com/1bh9.jpg', // Bad Luck Brian для модуля 3
    'benefit-1': 'https://i.imgflip.com/1bhw.jpg', // Преподаватели
    'benefit-2': 'https://i.imgflip.com/1bhk.jpg', // Расположение
    'benefit-3': 'https://i.imgflip.com/1bh5.jpg', // График
    'benefit-4': 'https://i.imgflip.com/1bij.jpg', // Поддержка
    'benefit-5': 'https://i.imgflip.com/1bh9.jpg', // Результаты
    'benefit-6': 'https://i.imgflip.com/1bh8.jpg', // Практика
    'feature-1': 'https://i.imgflip.com/1bij.jpg', // Разговорный
    'feature-2': 'https://i.imgflip.com/1bhw.jpg', // Мини-группы
    'feature-3': 'https://i.imgflip.com/1bhk.jpg', // Практика
    'feature-4': 'https://i.imgflip.com/1bh5.jpg', // CV
    'feature-5': 'https://i.imgflip.com/1bh9.jpg', // Ролевые игры
    'feature-6': 'https://i.imgflip.com/1bh8.jpg', // Материалы
    'feature-7': 'https://i.imgflip.com/1bij.jpg', // Повтор
};

// Функция для получения случайного мема из категории
function getRandomMeme(category = 'default') {
    const memes = memesLibrary[category] || memesLibrary.default;
    return memes[Math.floor(Math.random() * memes.length)];
}

// Функция для получения уникального мема для конкретного элемента
function getUniqueMeme(elementId) {
    return uniqueMemes[elementId] || getRandomMeme();
}

// Маппинг эмодзи к категориям мемов
const emojiToCategory = {
    '🇮🇹': 'italy',
    '👥': 'people',
    '📅': 'calendar',
    '⏱️': 'time',
    '📚': 'books',
    '😟': 'problem',
    '💡': 'solution',
    '💼': 'work',
    '🎓': 'teacher',
    '📍': 'location',
    '📱': 'phone',
    '🏆': 'results',
    '🗣️': 'practice',
    '👨‍🎓': 'student',
    '🛒': 'shopping',
    '🎯': 'target',
    '📝': 'document',
    '🎭': 'theater',
    '🔄': 'refresh',
    '💬': 'phone',
    '✈️': 'default',
    '✨': 'default',
    '🚀': 'default',
    '💰': 'default',
    '✓': 'default',
    '→': 'default'
};

// Инициализация замены эмодзи на мемы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    let memeIndex = 0;
    const usedMemes = new Set();
    
    // Заменяем все элементы с эмодзи на изображения мемов
    const emojiElements = document.querySelectorAll('[class*="icon"], .logo-icon, .stat-icon, .module-icon, .benefit-icon, .testimonial-avatar, .image-icon, .nav-logo-icon, .feature-icon');
    
    emojiElements.forEach((element, index) => {
        // Пропускаем секцию "Наше решение" - оставляем обычные смайлики
        if (element.closest('.solution-section')) {
            // Если элемент уже был заменен на мем, восстанавливаем эмодзи
            if (element.classList.contains('meme-container')) {
                const originalEmoji = element.dataset.originalEmoji || '💡';
                element.innerHTML = originalEmoji;
                element.classList.remove('meme-container');
                element.style.width = '';
                element.style.height = '';
                element.style.minWidth = '';
                element.style.minHeight = '';
            }
            return; // Не заменяем эмодзи на мемы в этой секции
        }
        
        const text = element.textContent || element.innerHTML;
        const emoji = text.trim();
        
        if (emoji && emojiToCategory[emoji]) {
            const category = emojiToCategory[emoji];
            
            // Определяем уникальный ID для элемента
            let elementId = '';
            if (element.closest('.module-card')) {
                const moduleCard = element.closest('.module-card');
                const moduleNumber = moduleCard.querySelector('.module-number')?.textContent;
                if (moduleNumber?.includes('1')) elementId = 'module-1';
                else if (moduleNumber?.includes('2')) elementId = 'module-2';
                else if (moduleNumber?.includes('3')) elementId = 'module-3';
            } else if (element.closest('.benefit-card')) {
                const benefitCards = Array.from(document.querySelectorAll('.benefit-card'));
                const cardIndex = benefitCards.indexOf(element.closest('.benefit-card'));
                elementId = `benefit-${cardIndex + 1}`;
            } else if (element.closest('.pricing-features')) {
                const featureItems = Array.from(document.querySelectorAll('.pricing-features li'));
                const itemIndex = featureItems.indexOf(element.closest('li'));
                elementId = `feature-${itemIndex + 1}`;
            }
            
            // Получаем уникальный мем
            let memeUrl;
            if (elementId && uniqueMemes[elementId]) {
                memeUrl = uniqueMemes[elementId];
            } else {
                // Используем разные мемы из категории, избегая повторений
                const memes = memesLibrary[category] || memesLibrary.default;
                const availableMemes = memes.filter(m => !usedMemes.has(m));
                if (availableMemes.length === 0) {
                    // Если все использованы, сбрасываем для этой категории
                    usedMemes.clear();
                    memeUrl = memes[0];
                } else {
                    memeUrl = availableMemes[memeIndex % availableMemes.length];
                }
                usedMemes.add(memeUrl);
                memeIndex++;
            }
            
            // Создаем изображение мема
            const img = document.createElement('img');
            img.src = memeUrl;
            img.alt = emoji;
            img.className = 'meme-image';
            img.loading = 'lazy';
            
            // Обработка ошибок загрузки изображения
            img.onerror = function() {
                // Fallback на эмодзи, если мем не загрузился
                element.innerHTML = emoji;
                element.classList.remove('meme-container');
                element.style.width = '';
                element.style.height = '';
                element.style.minWidth = '';
                element.style.minHeight = '';
            };
            
            // Заменяем содержимое
            element.innerHTML = '';
            element.appendChild(img);
            element.classList.add('meme-container');
            
            // Сохраняем оригинальный размер для fallback
            if (!element.dataset.originalEmoji) {
                element.dataset.originalEmoji = emoji;
            }
        }
    });
    
    // Также заменяем эмодзи в тексте кнопок и других местах (только маленькие инлайн)
    const textElements = document.querySelectorAll('.btn, .section-text, .module-description');
    textElements.forEach(element => {
        let html = element.innerHTML;
        Object.keys(emojiToCategory).forEach(emoji => {
            if (html.includes(emoji)) {
                const category = emojiToCategory[emoji];
                const memeUrl = getRandomMeme(category);
                // Для текстовых элементов создаем маленький инлайн-мем
                html = html.replace(emoji, `<img src="${memeUrl}" alt="${emoji}" class="inline-meme" style="width: 24px; height: 24px; vertical-align: middle; border-radius: 4px; margin: 0 4px;">`);
            }
        });
        element.innerHTML = html;
    });
});

// Экспорт для использования в других скриптах
window.memesLibrary = memesLibrary;
window.getRandomMeme = getRandomMeme;
window.getUniqueMeme = getUniqueMeme;
