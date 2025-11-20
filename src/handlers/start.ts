import { InlineKeyboard } from "grammy";
import type { CustomContext } from "../types/context.js";
import { handleGenerateText } from "./text.js";
import { LANGUAGES } from "../types/languages.js";
import type { BotConfig, Instructions } from "../types/bot.js";
import { logger } from "../utils/logger.js";

/**
 * Создает клавиатуру для выбора языка
 */
export const createLangKeyboard = (
  languages: typeof LANGUAGES,
): InlineKeyboard => {
  const keyboard = new InlineKeyboard();
  languages.forEach((language, index) => {
    if (index % 3 === 0 && index !== 0) {
      keyboard.row();
    }
    keyboard.text(`${language.flag} ${language.name}`, language.code);
  });
  return keyboard;
};

/**
 * Обработчик команды /start
 */
export const handleStartCommand = async (
  ctx: CustomContext,
  config: BotConfig,
  instructions: Instructions,
): Promise<void> => {
  // Очистка предыдущих сообщений
  if (ctx.session.lastMessage?.isStart) {
    try {
      await ctx.deleteLastMessage();
    } catch (error) {
      logger.warn("Последнее сообщение не стартовое");
    }
  }

  if (ctx.session.lastMessage?.translatedText) {
    try {
      await ctx.editLastMessage(ctx.session.lastMessage.fullText || "", {
        parse_mode: "HTML",
      });
    } catch (error) {
      logger.warn("Последнее сообщение не имеет кнопок чтобы его изменять.");
    }
  }

  // Генерация приветственного сообщения
  const text = await handleGenerateText(
    ctx,
    `${instructions.translator}First, greet and introduce yourself in the user's language, use one thematic emoji, and ask them to select a language for translation. Break the response into paragraphs and explain that the translation into the chosen language will continue until the user selects a different language.`,
    `My language is ${ctx.from?.language_code || "en"}`,
  );

  const startKeyboard = createLangKeyboard(LANGUAGES);
  const lastStartMessage = await ctx.reply(
    text + `<i>\n\n${config.model} | v${config.version}</i>`,
    {
      reply_markup: startKeyboard,
      parse_mode: "HTML",
    },
  );

  // Сохранение информации о последнем сообщении
  ctx.session.lastMessage = {
    isStart: true,
    id: lastStartMessage.message_id,
  };
};
