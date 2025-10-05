// Конфигурация для Telegram бота
// 
// Как получить токен бота:
// 1. Откройте Telegram и найдите @BotFather
// 2. Отправьте команду /newbot
// 3. Следуйте инструкциям и получите токен
// 
// Как получить CHAT_ID:
// 1. Напишите что-нибудь своему боту в Telegram
// 2. Откройте в браузере: https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
// 3. Найдите "chat":{"id": XXXXXX} - это и есть ваш CHAT_ID

const CONFIG = {
    // Вставьте сюда токен вашего бота (получите у @BotFather)
    TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // Вставьте сюда ваш Chat ID
    TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID_HERE'
};

// Не редактируйте ниже эту строку
window.TELEGRAM_CONFIG = CONFIG;
