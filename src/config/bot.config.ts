import type { BotConfig, Instructions } from "../types/bot.js";

export const loadConfig = async (): Promise<BotConfig> => {
  const packageJson = Bun.file("./package.json");
  const packageData = JSON.parse(await packageJson.text());

  return {
    model: "gpt-4.1-mini",
    version: packageData.version,
  };
};

export const loadInstructions = async (): Promise<Instructions> => {
  const instructionsFile = Bun.file("./instructions.json");
  const instructionsData = JSON.parse(await instructionsFile.text());

  return instructionsData;
};

export const getEnv = (key: string): string => {
  const value = Bun.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const TELEGRAM_BOT_API_KEY = getEnv("BOT_TOKEN");
export const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");
