# Таблица Зависимостей (Где и что менять)

Этот файл описывает связи между элементами проекта. Если вы меняете что-то одно, вы сразу понимаете, где нужно внести соответствующие правки.

## Визуальные элементы

| Что вы хотите изменить? | Где это менять | Примечание |
| :--- | :--- | :--- |
| **Акцентный цвет (кнопки, выделения)** | `css/style.css` → `:root` → `--accent`, `--accent-hover`, `--accent-light`, `--accent-glow`, `--shadow-accent` | Одна переменная — весь сайт обновится. Обновите `brandbook.md`. |
| **Цвет фона** | `css/style.css` → `:root` → `--bg-primary`, `--bg-secondary`, `--bg-accent-soft` | Также пропишите в `<meta name="theme-color">` в `index.html`. |
| **Цвет текста** | `css/style.css` → `:root` → `--text-primary`, `--text-secondary`, `--text-light` | — |
| **Основной шрифт (текст)** | `css/style.css` → `:root` → `--font-body` + `index.html` → `<link>` Google Fonts в `<head>` | Нужно менять и ссылку, и переменную. |
| **Шрифт заголовков** | `css/style.css` → `:root` → `--font-heading` + `index.html` → `<link>` Google Fonts в `<head>` | Нужно менять и ссылку, и переменную. |
| **Hero изображение** | Заменить файл `assets/img/hero.png` | Рекомендуемый размер: ~880x880px. Формат: PNG или WebP. |
| **Финальное CTA изображение** | Заменить файл `assets/img/author.png` | Рекомендуемый размер: ~560x560px. |

## Контент

| Что вы хотите изменить? | Где это менять | Примечание |
| :--- | :--- | :--- |
| **Текст Hero (заголовок, подзаголовок)** | `index.html` → `<section class="hero">` → `.hero__title`, `.hero__subtitle` | — |
| **Карточки "Для кого"** | `index.html` → `<section class="for-you">` → `.for-you__card` | 4 карточки. Можно добавить/убрать. |
| **Шаги "Як це працює"** | `index.html` → `<section class="how-it-works">` → `.step` | 4 шага. Нумерация вручную (01-04). |
| **Карточки "Що входить"** | `index.html` → `<section class="included">` → `.included__item` | 6 карточек. Если добавите — проверьте grid на мобильном. |
| **Тарифы (цены, фичи)** | `index.html` → `<section class="pricing">` → `.pricing__card` | Три карточки. Средняя = `--popular`. |
| **FAQ вопросы и ответы** | `index.html` → `<section class="faq">` → `.faq__item` | Логика аккордеона в `js/main.js`. |

## Функциональность

| Что вы хотите изменить? | Где это менять | Примечание |
| :--- | :--- | :--- |
| **Ссылка целевого действия (CTA кнопки)** | `index.html` → все `onclick="openBookingModal()"` | Сейчас открывает модальное окно. Если нужен redirect — менять `openBookingModal` в `js/main.js`. |
| **Куда отправляются данные формы** | `js/main.js` → функция `handleBookingSubmit` → блок `// TODO: Replace this` | Сейчас логируется в консоль. Нужно добавить fetch() к вашему бэкенду. |
| **Meta Pixel ID** | `index.html` → `<head>` → скрипт fbq → раскомментировать `fbq('init', 'YOUR_PIXEL_ID')` | Замените `YOUR_PIXEL_ID` на реальный ID. |
| **Google Analytics 4** | `index.html` → добавить gtag.js скрипт в `<head>` + `js/tracker.js` → раскомментировать вызовы `gtag()` | Когда будет создан аккаунт GA4. |
| **Список отслеживаемых секций** | `js/tracker.js` → массив `TRACKED_SECTIONS` | ID секций в HTML должны совпадать. |

## Деплой

| Что вы хотите изменить? | Где это менять | Примечание |
| :--- | :--- | :--- |
| **Домен** | Настройки хостинга (Vercel/Netlify) + обновить домен в GA4 и Meta Pixel | В коде используются относительные пути — менять ничего не нужно. |
| **OG-теги (превью в соцсетях)** | `index.html` → `<head>` → `<meta property="og:...">` | Замените og:image на полный URL после деплоя. |
| **Favicon** | `index.html` → `<head>` → `<link rel="icon">` | Сейчас используется inline SVG emoji. Можно заменить на .ico/.png. |
