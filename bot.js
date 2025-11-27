import {
  Bot,
  InlineKeyboard,
  InputFile,
  session,
  GrammyError,
  HttpError,
} from "grammy";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import VoiceToSpeech from "./utils/voiceToSpeech.js";
import TextToSpeechTelegram from "./utils/tts2.js";
import { lastMsgMiddleware } from "./middleware/editLastMsg.js";
import dotenv from "dotenv";
import fs from "fs-extra";
import { ignoreOld } from "grammy-middlewares";

dotenv.config();

const devConfig = {
  model: "gpt-4.1-mini",
  version: fs.readJSONSync("./package.json").version,
};

const instructions = fs.readJSONSync("./instructions.json");

const tts = new TextToSpeechTelegram(process.env.OPENAI_API_KEY);
const voiceToSpeech = new VoiceToSpeech(
  process.env.OPENAI_API_KEY,
  process.env.TELEGRAM_BOT_API_KEY,
);

const bot = new Bot(process.env.BOT_API_KEY);

bot.api.setMyCommands([
  { command: "start", description: "Главное меню выбора языка" },
]);

const enterSession = () => {
  return {
    lastMessage: {
      id: null,
    },
  };
};

bot.use(
  session({
    initial: enterSession,
  }),
);
bot.use(ignoreOld());
bot.use(lastMsgMiddleware);

const languages = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "th", flag: "🇹🇭", name: "Thai" },
  { code: "es", flag: "🇪🇸", name: "Spanish" },
  { code: "fr", flag: "🇫🇷", name: "French" },
  { code: "de", flag: "🇩🇪", name: "German" },
  { code: "it", flag: "🇮🇹", name: "Italian" },
  { code: "ru", flag: "🇷🇺", name: "Russian" },
  { code: "zh", flag: "🇨🇳", name: "Chinese" },
  { code: "ja", flag: "🇯🇵", name: "Japanese" },
];

const createLangKeyboard = (languages) => {
  const keyboard = new InlineKeyboard();
  languages.forEach((language, index) => {
    if (index % 3 === 0 && index !== 0) {
      keyboard.row();
    }
    keyboard.text(`${language.flag} ${language.name}`, language.code);
  });
  return keyboard;
};

const handleGenerateText = async (ctx, system, prompt) => {
  try {
    const { text } = await generateText({
      model: openai(devConfig.model),
      system,
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Ошибка генерации текста:", error);
    throw error;
  }
};

const handleStartCommand = async (ctx) => {
  if (ctx.session.lastMessage?.isStart) {
    try {
      await ctx.deleteLastMessage();
    } catch (error) {
      console.error("Последнее сообщение не стартовое");
    }
  }
  if (ctx.session.lastMessage?.translatedText) {
    try {
      await ctx.editLastMessage(ctx.session.lastMessage?.fullText, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Последнее сообщение не имеет кнопок чтобы его изменять.");
    }
  }
  const text = await handleGenerateText(
    ctx,
    `${instructions.translator}First, greet and introduce yourself in the user's language, use one thematic emoji, and ask them to select a language for translation. Break the response into paragraphs and explain that the translation into the chosen language will continue until the user selects a different language.`,
    `My language is ${ctx.from.language_code}`,
  );

  const startKeyboard = createLangKeyboard(languages);
  const lastStartMessage = await ctx.reply(
    text + `<i>\n\n${devConfig.model} | v${devConfig.version}</i>`,
    {
      reply_markup: startKeyboard,
      parse_mode: "HTML",
    },
  );
  ctx.session.lastMessage = { isStart: true, id: lastStartMessage.message_id };
};

async function getAiRessponse(ctx, response) {
  const text = await handleGenerateText(
    ctx,
    instructions.translator,
    `My language is ${ctx.from.language_code}, please translate my response: ${response} to ${ctx.session.langToTranslate.name} language`,
  );
  const stageKeyboard = new InlineKeyboard().text("Озвучить 🔊", "tts");
  // .row()
  // .text('Получить ответ 🗣️', 'answer')
  const formatedText = `🗣️ You:\n<code>${response}</code>\n\n${ctx.session.langToTranslate.flag} Translate:\n<code>${text}</code>`;
  const lastTranslatedMessage = await ctx.reply(formatedText, {
    reply_markup: stageKeyboard,
    parse_mode: "HTML",
  });
  ctx.session.lastMessage = {
    translatedText: text,
    fullText: formatedText,
    id: lastTranslatedMessage.message_id,
  };
}

const handleCallbackQuery = async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    if (languages.some((language) => language.code === data)) {
      ctx.session.langToTranslate = languages.find(
        (language) => language.code === data,
      );
      const text = await handleGenerateText(
        ctx,
        instructions.translator +
          `In the user's primary language, inform them that the translation language has been set to ${ctx.session.langToTranslate.name}. Clearly instruct them to send either a text or voice message for translation.`,
        `The user's primary language is ${ctx.from.language_code}`,
      );
      await ctx.editLastMessage(`${text} ${ctx.session.langToTranslate.flag}`);
      ctx.session.lastMessage = { isStart: false, id: null };
    } else if (data === "tts") {
      await ctx.editLastMessage(ctx.session.lastMessage?.fullText, {
        parse_mode: "HTML",
      });
      const { fileName, stream } = await tts.convertToSpeech(
        ctx.session.lastMessage?.translatedText,
      );
      await ctx.replyWithVoice(new InputFile(stream, fileName));
    }
  } catch (error) {
    console.error("Ошибка в обработке callback_query:", error);
  }
};

const handleMessage = async (ctx) => {
  if (!ctx.session.langToTranslate) {
    try {
      const text = await handleGenerateText(
        ctx,
        instructions.translator +
          "Ask the user in their language to first set the language from the suggested options (do not suggest options)",
        `My language is ${ctx.from.language_code}`,
      );
      const keyboard = createLangKeyboard(languages);
      await ctx.editLastMessage(`${text}`, {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Невозможно редактировать одинаковый текст.");
    }
  } else {
    if (!ctx.session.lastMessage?.isStart) {
      try {
        await ctx.editLastMessage(ctx.session.lastMessage?.fullText, {
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error(
          "Последнее сообщение не имеет кнопок чтобы его изменять.",
        );
      }
    } else {
      try {
        await ctx.deleteLastMessage();
      } catch (error) {
        console.error("Последнее сообщение не стартовое");
      }
    }
    ctx.session.lastMessage = { isStart: false, id: null };
    try {
      const fileInfo = ctx.message.voice
        ? await ctx.api.getFile(ctx.message.voice.file_id)
        : null;
      const response = fileInfo
        ? await voiceToSpeech.getWhisperResponse(fileInfo.file_path)
        : ctx.message.text;
      await getAiRessponse(ctx, response);
    } catch (error) {
      console.error("Ошибка при обработке голосового сообщения:", error);
    }
  }
};

bot.command("start", handleStartCommand);
bot.on("callback_query:data", handleCallbackQuery);
bot.on(":voice", handleMessage);
bot.on("message", handleMessage);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
