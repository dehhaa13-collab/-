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

// --- MODAL OPEN / CLOSE ---
let selectedPlan = '';

function openModal(type = 'call', plan = '') {
    selectedPlan = plan;
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.classList.add('no-scroll');

    const planLabel = document.getElementById('modal-plan-label');
    if (planLabel && plan) planLabel.textContent = `Тариф: ${plan}`;

    switchModalTab(type);
}

function switchModalTab(type) {
    const paneCall = document.getElementById('pane-call');
    const paneZoom = document.getElementById('pane-zoom');
    const tabCall  = document.getElementById('tab-call');
    const tabZoom  = document.getElementById('tab-zoom');
    const slider   = document.getElementById('modal-slider');

    if (!paneCall || !paneZoom) return;

    if (type === 'zoom') {
        paneCall.classList.remove('active');
        paneZoom.classList.add('active');
        if (tabCall) tabCall.classList.remove('active');
        if (tabZoom) tabZoom.classList.add('active');
        if (slider) slider.style.transform = 'translateX(100%)';
    } else {
        paneCall.classList.add('active');
        paneZoom.classList.remove('active');
        if (tabCall) tabCall.classList.add('active');
        if (tabZoom) tabZoom.classList.remove('active');
        if (slider) slider.style.transform = 'translateX(0)';
    }
}

function closeModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Close on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'booking-modal') closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
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

// --- HANDLE CALL FORM SUBMIT ---
async function handleCallSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const callTime = document.querySelector('input[name="client_time"]:checked').value;

    btn.textContent = 'Відправляємо...';
    btn.disabled = true;

    await sendTelegramNotification(name, phone, callTime);

    // Show success
    const callForm = document.getElementById('call-form');
    callForm.innerHTML = `
        <div class="modal-success">
            <div class="success-icon">✓</div>
            <h3>Заявку прийнято!</h3>
            <p>Наш менеджер зателефонує вам у зручний час для консультації.<br>Очікуйте дзвінка від <strong>Команди Івана Врабія: +40 763 954 998</strong></p>
        </div>
    `;

    setTimeout(closeModal, 3500);
}

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
