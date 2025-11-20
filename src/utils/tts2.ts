import OpenAI from "openai";
import type { TTSResult } from "../types/bot.js";
import { logger } from "../utils/logger.js";

export class TextToSpeechTelegram {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async convertToSpeech(text: string): Promise<TTSResult> {
    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        response_format: "opus",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const fileName = `speech_${Date.now()}.ogg`;

      // Создаем поток из буфера
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        },
      });

      return {
        fileName,
        stream,
      };
    } catch (error) {
      logger.error(error, "Ошибка при конвертации текста в речь:");
      throw error;
    }
  }
}

export default TextToSpeechTelegram;
