// ============================================
// INSTAGRAM НА МІЛЬЙОН — main.js
// ============================================

// --- TELEGRAM BOT CONFIG ---
// 1. Відкрий Telegram, знайди @BotFather
// 2. Відправ /newbot, дай назву та username
// 3. Скопіюй токен сюди:
const TG_BOT_TOKEN = 'ТВІЙ_ТОКЕН_БОТ'; // напр: '7123456789:AAF...'
// 4. Відправ будь-яке повідомлення своєму боту,
//    потім відкрий: https://api.telegram.org/bot<ТОКЕН>/getUpdates
//    знайди "chat":{"id": ... } — це твій CHAT_ID
const TG_CHAT_ID = 'ТВІЙ_CHAT_ID'; // напр: '123456789'

// --- HEADER SCROLL ---
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }
});

// --- SCROLL REVEAL ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- COUNTDOWN TIMER ---
function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    // Таймер: 48 годин від першого завантаження сторінки
    const STORAGE_KEY = 'imm_deadline';
    let deadline = localStorage.getItem(STORAGE_KEY);
    if (!deadline) {
        deadline = Date.now() + 48 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, deadline);
    }

    const interval = setInterval(() => {
        const diff = Math.max(0, deadline - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML = `
            <span>${String(h).padStart(2,'0')}<small>год</small></span>
            <span>${String(m).padStart(2,'0')}<small>хв</small></span>
            <span>${String(s).padStart(2,'0')}<small>сек</small></span>
        `;
        if (diff === 0) clearInterval(interval);
    }, 1000);
}
updateCountdown();

// --- BURGER MENU ---
const burgerBtn = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobile-nav');

if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });
}

function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

// --- CONTACT SHEET ---
let selectedPlan = '';

// Backward-compatible: old openModal calls redirect to new contact sheet
function openModal(type = 'call', plan = '') {
    selectedPlan = plan;
    if (plan) {
        openContactSheet('form');
    } else {
        openContactSheet();
    }
}

function openContactSheet(view = 'options') {
    const sheet = document.getElementById('contact-sheet');
    if (!sheet) return;

    sheet.classList.add('active');
    document.body.classList.add('no-scroll');

    if (view === 'form') {
        showCallbackForm();
    } else {
        showContactOptions();
    }
    updatePlanLabels();
}

function closeContactSheet() {
    const sheet = document.getElementById('contact-sheet');
    if (sheet) sheet.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function closeModal() {
    closeContactSheet();
}

function showCallbackForm() {
    const opts = document.getElementById('cs-options');
    const form = document.getElementById('cs-form');
    if (opts) opts.style.display = 'none';
    if (form) form.style.display = 'block';
    updatePlanLabels();
}

function showContactOptions() {
    const opts = document.getElementById('cs-options');
    const form = document.getElementById('cs-form');
    if (opts) opts.style.display = 'block';
    if (form) form.style.display = 'none';
}

function updatePlanLabels() {
    ['cs-plan-label', 'cs-form-plan-label'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (selectedPlan) {
            el.textContent = `📦 Тариф: ${selectedPlan}`;
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeContactSheet();
});

// --- SEND TELEGRAM NOTIFICATION ---
async function sendTelegramNotification(name, phone, callTime) {
    if (!TG_BOT_TOKEN || TG_BOT_TOKEN === 'ТВІЙ_ТОКЕН_БОТ') {
        console.warn('[Telegram] Токен бота не налаштований. Заявка:', { name, phone, callTime });
        return;
    }

    const now = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
    const text = `
🔔 *НОВА ЗАЯВКА — Фабрика Контенту*

👤 Ім'я: *${name}*
📞 Телефон: *${phone}*
⏰ Зручний час дзвінку: *${callTime}*
${selectedPlan ? `📦 Тариф: *${selectedPlan}*` : ''}

📅 Заявка надійшла: ${now}
    `.trim();

    try {
        const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text,
                parse_mode: 'Markdown'
            })
        });
        const data = await res.json();
        if (!data.ok) console.error('[Telegram] Помилка:', data);
    } catch (err) {
        console.error('[Telegram] Помилка з\'єднання:', err);
    }
}

// --- HANDLE CALLBACK FORM SUBMIT ---
async function handleCallbackSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('cb-name').value.trim();
    const phone = document.getElementById('cb-phone').value.trim();
    const callTime = document.querySelector('input[name="cb_time"]:checked').value;

    btn.textContent = 'Відправляємо...';
    btn.disabled = true;

    await sendTelegramNotification(name, phone, callTime);

    // Show success
    const formView = document.getElementById('cs-form');
    formView.innerHTML = `
        <div class="modal-success">
            <div class="success-icon">✓</div>
            <h3>Заявку прийнято!</h3>
            <p>Наш менеджер зателефонує вам у зручний час.<br>Очікуйте дзвінка від <strong>Команди Івана Врабія: +40 763 954 998</strong></p>
        </div>
    `;

    setTimeout(closeContactSheet, 3500);
}

// Backward compat
async function handleCallSubmit(e) { return handleCallbackSubmit(e); }

// --- FAQ ACCORDION ---
document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

        // Open clicked (if it was closed)
        if (!isOpen) item.classList.add('open');
    });
});

// --- DYNAMIC SCARCITY SPOTS ---
function updateScarcitySpots() {
    const spotsEl = document.getElementById('spots-count');
    if (!spotsEl) return;

    const spotsKey = 'imm_spots_left';
    let currentSpots = localStorage.getItem(spotsKey);

    // Зменшуємо лише один раз за сесію (а не при кожному оновленні сторінки F5)
    if (!sessionStorage.getItem('session_counted')) {
        sessionStorage.setItem('session_counted', 'true');
        
        if (!currentSpots) {
            currentSpots = 8; // Перший візит
        } else {
            currentSpots = Math.max(2, parseInt(currentSpots, 10) - 1); // З кожним новим візитом -1, мінімум 2
        }
        localStorage.setItem(spotsKey, currentSpots);
    } else {
        currentSpots = currentSpots ? parseInt(currentSpots, 10) : 8;
    }

    spotsEl.textContent = currentSpots;
}
updateScarcitySpots();

// --- TIMELINE ANIMATION ---
const timelineContainer = document.querySelector('.timeline-container');
const timelineProgress = document.querySelector('.timeline-line-progress');
const timelineItems = document.querySelectorAll('.timeline-item');

if (timelineContainer && timelineProgress) {
    window.addEventListener('scroll', () => {
        const rect = timelineContainer.getBoundingClientRect();
        const containerTop = rect.top;
        const containerHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Починаємо заповнювати, коли контейнер доходить до 1/2 екрану
        const scrollStart = windowHeight / 2; 
        
        if (containerTop <= scrollStart) {
            const distance = scrollStart - containerTop;
            let progress = (distance / containerHeight) * 100;
            
            if (progress > 100) progress = 100;
            if (progress < 0) progress = 0;
            
            timelineProgress.style.height = `${progress}%`;
            
            // Підсвічуємо елементи
            timelineItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.top + itemRect.height / 2;
                if (itemCenter < windowHeight / 2 + 50) {
                    item.classList.add('active-step');
                } else {
                    item.classList.remove('active-step');
                }
            });
        } else {
            timelineProgress.style.height = '0%';
            timelineItems.forEach(item => item.classList.remove('active-step'));
        }
    });
}

// --- STICKY CTA ---
const stickyCta = document.getElementById('sticky-cta');
const finalCtaSection = document.querySelector('.final-cta');

if (stickyCta) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Show after scrolling past hero
        if (scrollY > 400) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }

        // Hide when final CTA is in view
        if (finalCtaSection) {
            const rect = finalCtaSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                stickyCta.classList.add('hidden');
            } else {
                stickyCta.classList.remove('hidden');
            }
        }
    });
}
