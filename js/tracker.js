/**
 * INST НА МІЛЬЙОН — Analytics & Event Tracker
 * 
 * Этот файл отвечает за:
 * 1. Отслеживание скролла (до каких секций доскролил пользователь)
 * 2. Отслеживание кликов по CTA-кнопкам
 * 3. Время на сайте (сколько провел на странице)
 * 4. Отслеживание выходов (закрытие вкладки)
 * 
 * Сейчас события логируются в консоль.
 * Для подключения Google Analytics 4 — раскомментируйте вызовы gtag().
 * Meta Pixel уже поддерживается через fbq() в main.js.
 */

(function () {
    'use strict';

    // ===== CONFIG =====
    const TRACKED_SECTIONS = [
        'hero',
        'for-you',
        'how-it-works',
        'included',
        'pricing',
        'results',
        'faq',
        'final-cta',
    ];

    const viewedSections = new Set();
    let sessionStart = Date.now();
    let maxScrollDepth = 0;

    // ===== TRACK EVENT (Universal) =====
    window.trackEvent = function (eventName, params) {
        // Console log (development)
        console.log(`📊 [Track] ${eventName}`, params || '');

        // Google Analytics 4 (uncomment when GA4 is set up)
        // if (typeof gtag === 'function') {
        //     gtag('event', eventName, params);
        // }

        // Meta Pixel custom event
        if (typeof fbq === 'function') {
            fbq('trackCustom', eventName, params);
        }
    };

    // ===== SECTION VIEW TRACKING =====
    function initSectionTracking() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        if (!viewedSections.has(sectionId)) {
                            viewedSections.add(sectionId);
                            trackEvent('section_view', {
                                section: sectionId,
                                order: viewedSections.size,
                                time_on_page_ms: Date.now() - sessionStart,
                            });
                        }
                    }
                });
            },
            {
                threshold: 0.3,
            }
        );

        TRACKED_SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }

    // ===== SCROLL DEPTH TRACKING =====
    function initScrollDepthTracking() {
        const milestones = [25, 50, 75, 90, 100];
        const reportedMilestones = new Set();

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
            }

            milestones.forEach((milestone) => {
                if (
                    scrollPercent >= milestone &&
                    !reportedMilestones.has(milestone)
                ) {
                    reportedMilestones.add(milestone);
                    trackEvent('scroll_depth', {
                        depth_percent: milestone,
                        time_on_page_ms: Date.now() - sessionStart,
                    });
                }
            });
        });
    }

    // ===== CTA CLICK TRACKING =====
    function initCtaTracking() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (btn) {
                trackEvent('cta_click', {
                    button_text: btn.textContent.trim().substring(0, 50),
                    section: btn.closest('section')?.id || 'unknown',
                    time_on_page_ms: Date.now() - sessionStart,
                });
            }
        });
    }

    // ===== TIME ON PAGE TRACKING =====
    function initTimeTracking() {
        const intervals = [10, 30, 60, 120, 300]; // seconds
        const reported = new Set();

        setInterval(() => {
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            intervals.forEach((sec) => {
                if (elapsed >= sec && !reported.has(sec)) {
                    reported.add(sec);
                    trackEvent('time_on_page', {
                        seconds: sec,
                        max_scroll_depth: maxScrollDepth,
                        sections_viewed: viewedSections.size,
                    });
                }
            });
        }, 5000);
    }

    // ===== EXIT TRACKING =====
    function initExitTracking() {
        window.addEventListener('beforeunload', () => {
            const data = {
                total_time_seconds: Math.floor(
                    (Date.now() - sessionStart) / 1000
                ),
                max_scroll_depth: maxScrollDepth,
                sections_viewed: Array.from(viewedSections),
                total_sections_viewed: viewedSections.size,
            };

            // Use sendBeacon for reliable exit tracking
            if (navigator.sendBeacon) {
                // When GA4 is connected, this will fire automatically.
                // For custom backend: 
                // navigator.sendBeacon('/api/analytics/exit', JSON.stringify(data));
            }

            console.log('👋 [Exit] Session summary:', data);
        });
    }

    // ===== INIT =====
    function init() {
        initSectionTracking();
        initScrollDepthTracking();
        initCtaTracking();
        initTimeTracking();
        initExitTracking();

        trackEvent('page_load', {
            referrer: document.referrer || 'direct',
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            user_agent: navigator.userAgent,
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
