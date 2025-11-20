export interface BotConfig {
  model: string;
  version: string;
}

export interface Instructions {
  translator: string;
}

export interface TextGenerationOptions {
  model: any; // OpenAI model from ai-sdk
  system: string;
  prompt: string;
}

export interface TTSResult {
  fileName: string;
  stream: ReadableStream;
}

export interface VoiceFileInfo {
  file_path: string;
}

export interface GenerateTextResult {
  text: string;
}

export interface BotError {
  ctx: any;
  error: Error;
}
