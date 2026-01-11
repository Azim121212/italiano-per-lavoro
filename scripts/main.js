// Smooth scrolling and animations
document.addEventListener('DOMContentLoaded', function() {
    // Восстанавливаем состояние при загрузке страницы
    if (typeof StateManager !== 'undefined') {
        // Восстанавливаем позицию прокрутки
        StateManager.restoreScrollPosition();
        
        // Автоматическое сохранение позиции прокрутки
        StateManager.autoSaveScroll();
        
        // Восстанавливаем данные формы регистрации
        StateManager.restoreForm('registerForm');
        
        // Автоматическое сохранение формы при изменении
        StateManager.autoSaveForm('registerForm');
    }
    // Navigation menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active menu item on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
    navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate numbers if it's a stat card
                if (entry.target.classList.contains('stat-card')) {
                    animateNumber(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const elementsToAnimate = document.querySelectorAll(
        '.section, .module-card, .pricing-card, .benefit-card, .faq-item, .testimonial-card, .stat-card, .content-wrapper'
    );
    
    elementsToAnimate.forEach(element => {
        element.classList.add('fade-in-up');
        observer.observe(element);
    });

    // Number counter animation
    function animateNumber(element) {
        const numberElement = element.querySelector('.stat-number');
        if (!numberElement || numberElement.dataset.animated === 'true') return;
        
        numberElement.dataset.animated = 'true';
        const target = parseInt(numberElement.dataset.target);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                numberElement.textContent = target;
                clearInterval(timer);
            } else {
                numberElement.textContent = Math.floor(current);
            }
        }, 16);
    }

    // FAQ accordion effect (optional enhancement)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Optional: Add expand/collapse functionality
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Parallax effect for header
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (header) {
            const scrolled = currentScroll / 10;
            header.style.transform = `translateY(${scrolled}px)`;
        }
        
        lastScroll = currentScroll;
    });

    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('pulse')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Stagger animation for module cards
    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Stagger animation for benefit cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.05}s`;
    });

    // Add ripple effect to buttons
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Animate pricing card on scroll into view
    const pricingCard = document.querySelector('.pricing-card');
    if (pricingCard) {
        const pricingObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideUp 0.8s ease-out';
                }
            });
        }, { threshold: 0.2 });
        
        pricingObserver.observe(pricingCard);
    }

    // Add typing effect to header (optional)
    const slogan = document.querySelector('.slogan');
    if (slogan && window.innerWidth > 768) {
        const text = slogan.textContent;
        slogan.textContent = '';
        let index = 0;
        
        function typeWriter() {
            if (index < text.length) {
                slogan.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add scroll progress indicator (optional)
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        transition: width 0.1s;
        width: 0%;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add floating animation to icons
    const floatingIcons = document.querySelectorAll('.logo-icon, .stat-icon, .module-icon, .benefit-icon, .testimonial-avatar');
    floatingIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.2}s`;
    });

    // Registration form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                surname: formData.get('surname'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                message: formData.get('message'),
                payment: formData.get('payment') === 'on' ? 'installment' : 'full'
            };
            
            // Validate form
            if (!data.name || !data.surname || !data.email || !data.phone) {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }
            
            // Сохраняем заявку в админку
            const result = SiteAPI.saveApplication(data);
            
            if (result.success) {
                // Показываем уведомление об успешной записи
                showSuccessNotification();
                
                // Опционально: также отправляем в WhatsApp (можно закомментировать)
                const paymentText = data.payment === 'installment' ? 'Оплата в 2 части (130€ + 130€)' : 'Полная оплата 260€';
                const whatsappMessage = `Привет! Хочу записаться на курс IL.\n\nИмя: ${data.name} ${data.surname}\nEmail: ${data.email}\nТелефон: ${data.phone}\n${data.message ? 'Сообщение: ' + data.message + '\n' : ''}${paymentText}`;
                const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;
                
                // Открываем WhatsApp через 2 секунды (после показа уведомления)
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 2000);
                
                // Reset form
                this.reset();
                
                // Очищаем сохраненные данные формы после успешной отправки
                if (typeof StateManager !== 'undefined') {
                    StateManager.remove('form_registerForm');
                }
            } else {
                showNotification('Произошла ошибка при отправке заявки. Попробуйте еще раз.', 'error');
            }
        });
    }
    
    // Функция показа уведомления об успешной записи
    function showSuccessNotification() {
        // Получаем переводы из i18n
        let title = 'Заявка успешно отправлена!';
        let message = 'Спасибо за интерес к нашему курсу! Мы получили вашу заявку и свяжемся с вами в течение часа.';
        let note = 'Также вы можете связаться с нами напрямую через WhatsApp или Telegram.';
        
        // Пытаемся получить переводы
        if (window.translations && window.currentLang) {
            const lang = window.translations[window.currentLang];
            if (lang) {
                title = lang['register.success.title'] || title;
                message = lang['register.success.message'] || message;
                note = lang['register.success.note'] || note;
            }
        }
        
        // Альтернативный способ получения переводов через data-i18n элементы
        const titleElement = document.querySelector('[data-i18n="register.success.title"]');
        const messageElement = document.querySelector('[data-i18n="register.success.message"]');
        if (titleElement) title = titleElement.textContent || title;
        if (messageElement) message = messageElement.textContent || message;
        
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.id = 'successNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
            color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.5s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 1rem;">
                <div style="font-size: 2.5rem;">✅</div>
                <div>
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">${title}</h3>
                    <p style="margin: 0; opacity: 0.95; line-height: 1.6;">
                        ${message}
                    </p>
                    <p style="margin: 0.75rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                        ${note}
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; margin-left: auto;">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 8 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => notification.remove(), 500);
            }
        }, 8000);
    }
    
    // Функция показа обычного уведомления
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#2563eb'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    // Добавляем CSS анимации для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    console.log('IL - Site loaded successfully!');
    console.log('Remember to update WhatsApp and Telegram links in index.html');
});
