import { InlineKeyboard, InputFile } from "grammy";
import type { CallbackQueryContext } from "../types/context.js";
import { handleGenerateText } from "./text.js";
import { LANGUAGES } from "../types/languages.js";
import type { Instructions } from "../types/bot.js";
import TextToSpeechTelegram from "../utils/tts2.js";

/**
 * Обработчик callback запросов
 */
export const handleCallbackQuery = async (
  ctx: CallbackQueryContext,
  instructions: Instructions,
  tts: TextToSpeechTelegram,
): Promise<void> => {
  try {
    const data = ctx.callbackQuery.data;

    // Обработка выбора языка
    if (LANGUAGES.some((language) => language.code === data)) {
      const selectedLanguage = LANGUAGES.find(
        (language) => language.code === data,
      );
      if (!selectedLanguage) return;

      ctx.session.langToTranslate = selectedLanguage;

      const text = await handleGenerateText(
        ctx,
        instructions.translator +
          `In the user's primary language, inform them that the translation language has been set to ${ctx.session.langToTranslate.name}. Clearly instruct them to send either a text or voice message for translation.`,
        `The user's primary language is ${ctx.from?.language_code || "en"}`,
      );

      await ctx.editLastMessage(`${text} ${ctx.session.langToTranslate.flag}`);
      ctx.session.lastMessage = { isStart: false, id: null };
    }
    // Обработка озвучивания текста
    else if (data === "tts") {
      await ctx.editLastMessage(ctx.session.lastMessage?.fullText || "", {
        parse_mode: "HTML",
      });

      const { fileName, stream } = await tts.convertToSpeech(
        ctx.session.lastMessage?.translatedText || "",
      );

      await ctx.replyWithVoice(new InputFile(stream, fileName));
    }
  } catch (error) {
    console.error("Ошибка в обработке callback_query:", error);
  }
};
