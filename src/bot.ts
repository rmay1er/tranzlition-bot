import {
  Bot,
  InlineKeyboard,
  InputFile,
  session,
  GrammyError,
  HttpError,
} from "grammy";
import { ignoreOld } from "grammy-middlewares";
import { logger } from "./utils/logger.js";

import {
  loadConfig,
  loadInstructions,
  TELEGRAM_BOT_API_KEY,
  OPENAI_API_KEY,
} from "./config/bot.config.js";
import { lastMsgMiddleware } from "./middleware/editLastMsg.js";
import { handleStartCommand } from "./handlers/start.js";
import { handleCallbackQuery } from "./handlers/callback.js";
import { handleMessage } from "./handlers/message.js";
import { VoiceToSpeech } from "./utils/voiceToSpeech.js";
import TextToSpeechTelegram from "./utils/tts2.js";

import type { SessionData, BotSession } from "./types/session.js";
import type {
  CustomContext,
  MessageContext,
  CallbackQueryContext,
} from "./types/context.js";
import type { BotError } from "./types/bot.js";

// Загрузка конфигурации
const devConfig = await loadConfig();
const instructions = await loadInstructions();

// Инициализация сервисов
const tts = new TextToSpeechTelegram(OPENAI_API_KEY);
const voiceToSpeech = new VoiceToSpeech(OPENAI_API_KEY, TELEGRAM_BOT_API_KEY);

// Создание бота с кастомным контекстом
const bot = new Bot<CustomContext>(TELEGRAM_BOT_API_KEY);

// Настройка команд бота
bot.api.setMyCommands([
  { command: "start", description: "Главное меню выбора языка" },
]);

// Инициализация сессии
const enterSession = (): SessionData => {
  return {
    lastMessage: {
      id: null,
    },
  };
};

// Middleware
bot.use(
  session({
    initial: enterSession,
  }),
);
bot.use(ignoreOld());
bot.use(lastMsgMiddleware);

// Обработчики команд
bot.command("start", async (ctx) => {
  await handleStartCommand(ctx as CustomContext, devConfig, instructions);
});

// Обработчики callback запросов
bot.on("callback_query:data", async (ctx) => {
  await handleCallbackQuery(ctx as CallbackQueryContext, instructions, tts);
});

// Обработчики сообщений
bot.on(":voice", async (ctx) => {
  await handleMessage(ctx as MessageContext, instructions, voiceToSpeech);
});

bot.on("message", async (ctx) => {
  await handleMessage(ctx as MessageContext, instructions, voiceToSpeech);
});

// Обработка ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  logger.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    logger.error(e, "Error in request:");
  } else if (e instanceof HttpError) {
    logger.error(e, "Could not contact Telegram:");
  } else {
    logger.error(e, "Unknown error:");
  }
});

// Запуск бота
logger.info("🤖 Бот запущен...");
bot.start();
