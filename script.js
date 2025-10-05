// =======================================
// Кастомный Date Picker
// =======================================

let currentDate = new Date();
let selectedDate = null;
let highlightCount = 1;

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

// Дождемся загрузки DOM
document.addEventListener('DOMContentLoaded', function() {

const dateDisplay = document.getElementById('dateDisplay');
const dateText = document.getElementById('dateText');
const customDatePicker = document.getElementById('customDatePicker');
const datePickerDays = document.getElementById('datePickerDays');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const yesterdayBtn = document.getElementById('yesterdayBtn');

// Устанавливаем сегодняшнюю дату по умолчанию
const today = new Date();
selectDate(today);

// Показать/скрыть календарь
dateDisplay.addEventListener('click', function() {
    const isVisible = customDatePicker.style.display === 'block';
    customDatePicker.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderCalendar();
});

// Закрыть календарь при клике вне его
document.addEventListener('click', function(e) {
    if (!e.target.closest('.date-picker-wrapper')) {
        customDatePicker.style.display = 'none';
    }
});

// Навигация по месяцам
prevMonthBtn.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Кнопки быстрого выбора
todayBtn.addEventListener('click', function() {
    selectDate(new Date());
});

yesterdayBtn.addEventListener('click', function() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    selectDate(yesterday);
});

// Отрисовка календаря
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Получаем день недели (0 - воскресенье, нужно сделать понедельник = 0)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    datePickerDays.innerHTML = '';
    
    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const cell = createDayCell(day, true);
        datePickerDays.appendChild(cell);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = createDayCell(day, false);
        const cellDate = new Date(year, month, day);
        
        // Проверка на сегодня
        const today = new Date();
        if (cellDate.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }
        
        // Проверка на выбранную дату
        if (selectedDate && cellDate.toDateString() === selectedDate.toDateString()) {
            cell.classList.add('selected');
        }
        
        cell.addEventListener('click', function() {
            selectDate(new Date(year, month, day));
        });
        
        datePickerDays.appendChild(cell);
    }
    
    // Дни следующего месяца
    const totalCells = datePickerDays.children.length;
    const remainingCells = 42 - totalCells; // 6 недель * 7 дней
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createDayCell(day, true);
        datePickerDays.appendChild(cell);
    }
}

function createDayCell(day, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    cell.textContent = day;
    return cell;
}

function selectDate(date) {
    selectedDate = date;
    currentDate = new Date(date);
    
    // Форматируем дату как день.месяц
    const day = date.getDate();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}.${month}`;
    dateText.textContent = formattedDate;
    
    // Сохраняем в ISO формате
    document.getElementById('dateOfMeeting').value = date.toISOString().split('T')[0];
    
    // Закрываем календарь
    customDatePicker.style.display = 'none';
    
    // Обновляем прогресс
    updateProgress();
}

// =======================================
// Прогресс бар
// =======================================

function updateProgress() {
    const form = document.getElementById('dateReviewForm');
    
    const missingItems = [];
    
    // Обязательные поля (без хайлайтов и тегов)
    const requiredFields = form.querySelectorAll('[required]');
    let totalRequired = 0;
    let filledRequired = 0;
    
    requiredFields.forEach(field => {
        // Пропускаем поля хайлайтов и скрытые поля тегов
        if (field.name && (field.name.startsWith('highlight_') || 
            ['communication', 'attention', 'chemistry', 'sex', 'emotions'].includes(field.name))) {
            return;
        }
        
        totalRequired++;
        
        if (field.type === 'hidden') {
            if (field.value && field.value !== '0') {
                filledRequired++;
            } else {
                if (field.name === 'dateOfMeeting') missingItems.push('Дата свидания');
                if (field.name === 'rating') missingItems.push('Оценка звездами');
            }
        } else if (field.value.trim() !== '') {
            filledRequired++;
        } else {
            const label = field.previousElementSibling?.textContent || field.name;
            missingItems.push(label.replace(' *', ''));
        }
    });
    
    // Проверяем теги - минимум 4 в каждой категории
    const tagGroups = [
        { id: 'communication', name: '🗣 Общение' },
        { id: 'attention', name: '🤝 Внимание и манеры' },
        { id: 'chemistry', name: '🔥 Химия' },
        { id: 'sex', name: '💋 Секс/Интим' },
        { id: 'emotions', name: '🎭 Эмоции' }
    ];
    
    let totalTagsProgress = 0;
    tagGroups.forEach(group => {
        const field = document.getElementById(group.id);
        const tagsCount = field.value ? field.value.split(',').length : 0;
        const groupProgress = Math.min(tagsCount / 4, 1);
        totalTagsProgress += groupProgress;
        
        if (tagsCount < 4) {
            missingItems.push(`${group.name}: ${tagsCount}/4 тегов`);
        }
    });
    
    // Считаем заполненные хайлайты
    let filledHighlights = 0;
    for (let i = 1; i <= highlightCount; i++) {
        const highlight = document.querySelector(`[name="highlight_${i}"]`);
        if (highlight && highlight.value.trim() !== '') {
            filledHighlights++;
        }
    }
    
    if (filledHighlights < 3) {
        missingItems.push(`✨ Хайлайты: ${filledHighlights}/3`);
    }
    
    // Расчет прогресса:
    // 40% - обязательные поля (дата, впечатления, что хорошо, что лучше, оценка)
    // 40% - теги (5 категорий по 4 тега)
    // 20% - хайлайты (минимум 3)
    const requiredProgress = (filledRequired / totalRequired) * 0.4;
    const tagsProgress = (totalTagsProgress / tagGroups.length) * 0.4;
    const highlightsProgress = Math.min(filledHighlights / 3, 1) * 0.2;
    
    const totalProgress = Math.round((requiredProgress + tagsProgress + highlightsProgress) * 100);
    
    // Обновляем круговой прогресс
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (totalProgress / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    
    document.getElementById('progressText').textContent = totalProgress + '%';
    
    // Обновляем tooltip
    const tooltipList = document.getElementById('tooltipList');
    const modalTooltipList = document.getElementById('modalTooltipList');
    
    const tooltipHTML = missingItems.length === 0 
        ? '<li class="completed">Все заполнено! 🎉</li>'
        : missingItems.map(item => `<li>${item}</li>`).join('');
    
    if (tooltipList) {
        tooltipList.innerHTML = tooltipHTML;
    }
    if (modalTooltipList) {
        modalTooltipList.innerHTML = tooltipHTML;
    }
    
    // Обновляем мобильный прогресс-бар
    const mobileProgressBar = document.getElementById('mobileProgressBar');
    const mobileProgressText = document.getElementById('mobileProgressText');
    if (mobileProgressBar) {
        mobileProgressBar.style.width = totalProgress + '%';
    }
    if (mobileProgressText) {
        mobileProgressText.textContent = totalProgress + '%';
    }
}

// Система тегов с множественным выбором (как в Tinder)
const tagContainers = document.querySelectorAll('.tag-container');
const selectedTags = {}; // Хранилище выбранных тегов по группам

tagContainers.forEach(container => {
    const group = container.dataset.group;
    selectedTags[group] = [];
    
    const tags = container.querySelectorAll('.tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const value = this.dataset.value;
            
            if (this.classList.contains('selected')) {
                // Убираем выбор
                this.classList.remove('selected');
                selectedTags[group] = selectedTags[group].filter(t => t !== value);
            } else {
                // Добавляем выбор
                this.classList.add('selected');
                selectedTags[group].push(value);
            }
            
            // Обновляем скрытое поле
            document.getElementById(group).value = selectedTags[group].join(', ');
            updateProgress();
        });
    });
});

// Обработка пользовательских вариантов
const customInputs = document.querySelectorAll('.custom-tag-input');

customInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = this.value.trim();
            const group = this.dataset.group;
            
            if (value) {
                // Создаем новый тег
                const container = this.previousElementSibling;
                const newTag = document.createElement('button');
                newTag.type = 'button';
                newTag.className = 'tag selected';
                newTag.dataset.value = value;
                newTag.textContent = value;
                
                // Добавляем в контейнер
                container.appendChild(newTag);
                
                // Добавляем в выбранные
                selectedTags[group].push(value);
                document.getElementById(group).value = selectedTags[group].join(', ');
                
                // Добавляем обработчик клика для нового тега
                newTag.addEventListener('click', function() {
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        selectedTags[group] = selectedTags[group].filter(t => t !== value);
                    } else {
                        this.classList.add('selected');
                        selectedTags[group].push(value);
                    }
                    document.getElementById(group).value = selectedTags[group].join(', ');
                    updateProgress();
                });
                
                // Очищаем поле ввода
                this.value = '';
                updateProgress();
            }
        }
    });
});

// Рейтинг звездами
let currentRating = 0;
const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('rating');
const ratingDisplay = document.getElementById('ratingValue');

stars.forEach(star => {
    star.addEventListener('click', function() {
        currentRating = parseFloat(this.dataset.rating);
        updateStars(currentRating);
        ratingInput.value = currentRating;
        ratingDisplay.textContent = currentRating.toFixed(1);
        updateProgress();
    });
    
    star.addEventListener('mouseover', function() {
        const hoverRating = parseFloat(this.dataset.rating);
        updateStars(hoverRating);
        ratingDisplay.textContent = hoverRating.toFixed(1);
    });
});

document.getElementById('starRating').addEventListener('mouseleave', function() {
    updateStars(currentRating);
    ratingDisplay.textContent = currentRating > 0 ? currentRating.toFixed(1) : '0';
});

function updateStars(rating) {
    stars.forEach(star => {
        const starValue = parseFloat(star.dataset.rating);
        star.classList.remove('active', 'half');
        
        if (starValue <= rating) {
            star.classList.add('active');
        }
    });
}

// Добавление дополнительных хайлайтов
document.getElementById('addHighlight').addEventListener('click', function() {
    highlightCount++;
    const container = document.getElementById('highlightsContainer');
    const textarea = document.createElement('textarea');
    textarea.name = `highlight_${highlightCount}`;
    textarea.className = 'highlight-textarea';
    textarea.placeholder = 'Начните печатать...';
    container.appendChild(textarea);
    
    // Добавляем слушатель для прогресс бара (не обязательное поле)
    textarea.addEventListener('input', updateProgress);
});

// Слушатели для обновления прогресс бара
document.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', updateProgress);
});

// Обновляем прогресс сразу после инициализации
updateProgress();

// Модальное окно для прогресса (мобильные)
const mobileProgressHeader = document.getElementById('mobileProgressHeader');
const progressModal = document.getElementById('progressModal');
const modalClose = document.getElementById('modalClose');

if (mobileProgressHeader) {
    mobileProgressHeader.addEventListener('click', function() {
        progressModal.classList.add('active');
    });
}

if (modalClose) {
    modalClose.addEventListener('click', function() {
        progressModal.classList.remove('active');
    });
}

if (progressModal) {
    progressModal.addEventListener('click', function(e) {
        if (e.target === progressModal) {
            progressModal.classList.remove('active');
        }
    });
}

// Функция для отправки сообщения в Telegram
async function sendToTelegram(message) {
    const config = window.TELEGRAM_CONFIG;
    
    // Проверка настроек
    if (!config || 
        config.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || 
        config.TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        throw new Error('Пожалуйста, настройте токен бота и Chat ID в файле config.js');
    }
    
    const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: config.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Ошибка отправки в Telegram');
    }
    
    return await response.json();
}

// Отправка формы
document.getElementById('dateReviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Проверка рейтинга
    if (currentRating === 0) {
        alert('Пожалуйста, поставьте оценку!');
        return;
    }
    
    // Блокируем кнопку отправки
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем...';
    
    try {
        // Собираем данные формы
        const formData = new FormData(this);
        
        // Собираем все хайлайты
        const highlights = [];
        for (let i = 1; i <= highlightCount; i++) {
            const highlight = formData.get(`highlight_${i}`);
            if (highlight && highlight.trim()) {
                highlights.push(highlight);
            }
        }
        
        // Форматируем дату для сообщения
        const dateValue = formData.get('dateOfMeeting');
        const dateObj = new Date(dateValue);
        const formattedDate = dateObj.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        // Формируем текст сообщения для Telegram
        const stars = '⭐'.repeat(Math.round(currentRating));
        const message = `
<b>💜 ОТЗЫВ НА СВИДАНИЕ</b>
<b>📅 Дата свидания:</b> ${formattedDate}

<b>📝 КАК ЭТО БЫЛО?</b>
${escapeHtml(formData.get('impression'))}

<b>💭 МОМЕНТЫ:</b>
🗣 Общение: ${escapeHtml(formData.get('communication')) || 'не указано'}
🤝 Внимание и манеры: ${escapeHtml(formData.get('attention')) || 'не указано'}
🔥 Химия: ${escapeHtml(formData.get('chemistry')) || 'не указано'}
💋 Секс / Интим: ${escapeHtml(formData.get('sex')) || 'не указано'}
🎭 Эмоции после: ${escapeHtml(formData.get('emotions')) || 'не указано'}

<b>✨ ХАЙЛАЙТЫ:</b>
${highlights.map((h, i) => `${i + 1}. ${escapeHtml(h)}`).join('\n')}

<b>👍 ЧТО БЫЛО ХОРОШО:</b>
${escapeHtml(formData.get('good'))}

<b>👎 ЧТО МОГЛО БЫТЬ ЛУЧШЕ:</b>
${escapeHtml(formData.get('better'))}

<b>⭐ ОЦЕНКА:</b> ${stars} (${currentRating}/5.0)

<i>📅 Отправлено: ${new Date().toLocaleString('ru-RU')}</i>
        `.trim();
        
        // Отправляем в Telegram
        await sendToTelegram(message);
        
        // Показываем сообщение об успехе
        document.getElementById('dateReviewForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        alert('Ошибка: ' + error.message);
        console.error(error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
    }
});

// Функция для экранирования HTML в Telegram
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Закрываем DOMContentLoaded
}); // конец DOMContentLoaded