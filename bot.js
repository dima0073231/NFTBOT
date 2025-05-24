const { Telegraf } = require('telegraf');
const mongoose = require("mongoose");
require('dotenv').config();

const commands = require('./commands.js');
const events = require('./events.js');
const User = require("./models/user");

// Проверка на наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("❌ Ошибка: TELEGRAM_BOT_TOKEN не найден!");
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Подключение к MongoDB
mongoose
  .connect(process.env.mongoURI)
  .then(async () => {
    console.log("✅ Подключено к MongoDB");

    // Убедимся, что индексы созданы
    await User.syncIndexes();

    // Регистрируем команды и события
    bot.start(commands.startCommand);
    commands.buttonActions(bot);
    bot.on("new_chat_members", events.userJoined);

    // Запуск бота
    bot.launch()
      .then(() => console.log("✅ Бот запущен и работает!"))
      .catch((err) => console.error("❌ Ошибка запуска бота:", err));
  })
  .catch((err) => {
    console.error("❌ Ошибка подключения к MongoDB:", err);
    process.exit(1);
  });

// Обработка ошибок бота
bot.catch((err) => {
  console.error('❌ Ошибка Telegraf:', err);
});


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));