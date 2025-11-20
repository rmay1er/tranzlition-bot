import { InlineKeyboard } from "grammy";
import type { MessageContext } from "../types/context.js";
import { handleGenerateText } from "./text.js";
import { LANGUAGES } from "../types/languages.js";
import type { Instructions } from "../types/bot.js";
import { VoiceToSpeech } from "../utils/voiceToSpeech.js";
import { logger } from "../utils/logger.js";

/**
 * Обработчик получения AI ответа
 */
const getAiResponse = async (
  ctx: MessageContext,
  response: string,
  instructions: Instructions,
): Promise<void> => {
  if (!ctx.session.langToTranslate) {
    throw new Error("Язык перевода не установлен");
  }

  const text = await handleGenerateText(
    ctx as any,
    instructions.translator,
    `My language is ${ctx.from?.language_code || "en"}, please translate my response: ${response} to ${ctx.session.langToTranslate.name} language`,
  );

  const stageKeyboard = new InlineKeyboard().text("Озвучить 🔊", "tts");
  const formattedText = `🗣️ You:\n<code>${response}</code>\n\n${ctx.session.langToTranslate.flag} Translate:\n<code>${text}</code>`;

  const lastTranslatedMessage = await ctx.reply(formattedText, {
    reply_markup: stageKeyboard,
    parse_mode: "HTML",
  });

  ctx.session.lastMessage = {
    translatedText: text,
    fullText: formattedText,
    id: lastTranslatedMessage.message_id,
  };
};

/**
 * Обработчик сообщений
 */
export const handleMessage = async (
  ctx: MessageContext,
  instructions: Instructions,
  voiceToSpeech: VoiceToSpeech,
): Promise<void> => {
  // Проверка установленного языка перевода
  if (!ctx.session.langToTranslate) {
    try {
      const text = await handleGenerateText(
        ctx as any,
        instructions.translator +
          "Ask the user in their language to first set the language from the suggested options (do not suggest options)",
        `My language is ${ctx.from?.language_code || "en"}`,
      );

      const keyboard = new InlineKeyboard();
      LANGUAGES.forEach((language, index) => {
        if (index % 3 === 0 && index !== 0) {
          keyboard.row();
        }
        keyboard.text(`${language.flag} ${language.name}`, language.code);
      });

      await ctx.editLastMessage(`${text}`, {
        reply_markup: keyboard,
        parse_mode: "HTML",
      } as any);
    } catch (error) {
      logger.warn("Невозможно редактировать одинаковый текст.");
    }
    return;
  }

  // Очистка предыдущих сообщений
  if (!ctx.session.lastMessage?.isStart) {
    try {
      await ctx.editLastMessage(ctx.session.lastMessage?.fullText || "", {
        parse_mode: "HTML",
      });
    } catch (error) {
      logger.warn("Последнее сообщение не имеет кнопок чтобы его изменять.");
    }
  } else {
    try {
      await ctx.deleteLastMessage();
    } catch (error) {
      logger.warn("Последнее сообщение не стартовое");
    }
  }

  ctx.session.lastMessage = { isStart: false, id: null };

  try {
    // Обработка голосового сообщения
    const fileInfo = ctx.message.voice
      ? await ctx.api.getFile(ctx.message.voice.file_id)
      : null;

    let response: string;
    if (fileInfo) {
      response = await voiceToSpeech.getWhisperResponse(fileInfo.file_path!);
    } else {
      response = ctx.message.text ?? "";
    }

    await getAiResponse(ctx, response, instructions);
  } catch (error) {
    logger.error(error, "Ошибка при обработке сообщения:");
  }
};
