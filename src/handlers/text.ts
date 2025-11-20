import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { CustomContext } from "../types/context.js";
import type {
  TextGenerationOptions,
  GenerateTextResult,
} from "../types/bot.js";
import { logger } from "../utils/logger.js";

/**
 * Обработчик генерации текста с помощью AI
 */
export const handleGenerateText = async (
  ctx: CustomContext,
  system: string,
  prompt: string,
): Promise<string> => {
  try {
    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      system,
      prompt,
    });
    return text;
  } catch (error) {
    logger.error(error, "Ошибка генерации текста:");
    throw error;
  }
};

/**
 * Генерация текста с дополнительными опциями
 */
export const generateTextWithOptions = async (
  options: TextGenerationOptions,
): Promise<GenerateTextResult> => {
  try {
    const result = await generateText(options);
    return result;
  } catch (error) {
    logger.error(error, "Ошибка генерации текста:");
    throw error;
  }
};
