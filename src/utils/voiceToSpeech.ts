import axios from "axios";
import { OpenAI } from "openai";
import type { VoiceFileInfo } from "../types/bot.js";
import { logger } from "../utils/logger.js";

export class VoiceToSpeech {
  private openai: OpenAI;
  private botToken: string;

  constructor(GPTapiKey: string, TGapiToken: string) {
    this.openai = new OpenAI({ apiKey: GPTapiKey });
    this.botToken = TGapiToken;
  }

  async getWhisperResponse(filePath: string): Promise<string> {
    try {
      // Загрузка голосового сообщения
      const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      // Создание временного файла для OpenAI Whisper
      const tempFilePath = "./temp_voice_file.ogg";
      await Bun.write(tempFilePath, response.data);

      // Транскрибирование с помощью OpenAI Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: Bun.file(tempFilePath) as any,
        model: "whisper-1",
      });

      // Удаление временного файла
      await Bun.file(tempFilePath).delete();

      return transcription.text;
    } catch (error) {
      logger.error(error, "Ошибка в ответе:");
      throw error;
    }
  }
}

export default VoiceToSpeech;
